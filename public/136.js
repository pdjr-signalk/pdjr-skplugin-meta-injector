"use strict";(self.webpackChunkpdjr_skplugin_metadata=self.webpackChunkpdjr_skplugin_metadata||[]).push([[136],{6732:(e,t,a)=>{a.r(t),a.d(t,{default:()=>v});var s=a(624),l=a.n(s),n=a(264),r=a(5519);class i extends l().Component{constructor(e){super(e),this.type=e.type||"text",this.name=e.name,this.value=e.value,this.label=e.label,this.radios=e.radios,this.text=e.text,this.options=e.options,this.rows=e.rows||"12",this.label_style={lineHeight:"36px"},this.onChangeCallback=e.onChangeCallback}render(){var e=this.label?"6":"12";return l().createElement(n.cw,{row:!0},this.label?l().createElement(n.JX,{md:e},l().createElement(n.__,{style:this.label_style,htmlFor:this.name},this.label)):"",l().createElement(n.JX,{md:e},"checkbox"==this.type?l().createElement(n.II,{type:"checkbox",name:this.name,onChange:e=>this.state.onChangeCallback(e.target.value),checked:this.value}):"","multiselect"==this.type?l().createElement(r.ZP,{name:this.name,options:this.options,defaultValue:this.value,value:this.value,isMulti:!0,className:"basic-multi-select",classNamePrefix:"select",onChange:e=>this.onChangeCallback(e)}):"","text"==this.type?l().createElement(n.II,{type:"text",name:this.name,onChange:e=>this.onChangeCallback(e.target.value.trim()),value:this.value}):"","textarea"==this.type?l().createElement("textarea",{name:this.name,rows:this.rows,wrap:"off",style:{width:"100%"},value:this.value,onChange:e=>this.onChangeCallback(e.target.value)}):"",this.text?l().createElement(n.R9,{color:"muted"},this.text):""))}}const o=i;class c extends l().Component{constructor(e){super(e),this.state={resourcesProviderId:e.configuration.resourcesProviderId,resourceType:e.configuration.resourceType,startDelay:e.configuration.startDelay,excludePaths:e.configuration.excludePaths,persist:e.configuration.persist,saveButtonDisabled:!1,cancelButtonDisabled:!1,composeButtonDisabled:!1,snapshotButtonDisabled:!1},this.save=e.save,this.onChangeResourcesProviderId=this.onChangeResourcesProviderId.bind(this),this.onChangeResourceType=this.onChangeResourceType.bind(this),this.onChangeStartDelay=this.onChangeStartDelay.bind(this),this.onChangeExcludePaths=this.onChangeExcludePaths.bind(this),this.onChangePersist=this.onChangePersist.bind(this)}render(){return l().createElement(n.l0,{className:"square rounded border",style:{padding:"5px"}},l().createElement(n.cw,{row:!0,style:{height:"60px"}},l().createElement(n.JX,null,l().createElement(o,{type:"text",name:"resources_provider_id",label:"Resources provider id",value:this.state.resourcesProviderId,text:"",onChangeCallback:this.onChangeResourcesProviderId}))),l().createElement(n.cw,{row:!0,style:{height:"300px"}},l().createElement(n.JX,null,l().createElement(o,{type:"text",name:"resource_type",label:"Metadata resource type",value:this.state.resourceType,text:"",onChangeCallback:this.onChangeResourceType}),l().createElement(o,{type:"text",name:"start_delay",label:"Start delay",value:this.state.startDelay,text:"",onChangeCallback:this.onChangeStartDelay}),l().createElement(o,{type:"text",name:"exclude_paths",label:"Exclude paths beginning with",value:this.state.excludePaths.join(", "),text:"",onChangeCallback:this.onChangeExcludePaths}),l().createElement(o,{type:"checkbox",fieldName:"persist",label:"Persist dynamic changes",value:this.state.persist,text:"",onChangeCallback:this.onChangePersist}))),l().createElement(n.cw,{row:!0},l().createElement(n.JX,null,l().createElement(n.Si,{style:{justifyContent:"space-between"}},l().createElement(n.Si,null,l().createElement(n.zx,{size:"sm",color:"primary",disabled:this.state.saveButtonDisabled,onClick:e=>{e.preventDefault(),this.onSubmit()}},l().createElement("i",{className:"fa fa-save"})," Save ")," ",l().createElement(n.zx,{size:"sm",color:"primary",disabled:this.state.cancelButtonDisabled,onClick:e=>{e.preventDefault(),this.onCancel()}},l().createElement("i",{className:"fa fa-ban"})," Cancel ")),l().createElement(n.Si,null,l().createElement(n.zx,{size:"sm",color:"danger",disabled:this.state.composeButtonDisabled,onClick:e=>{e.preventDefault(),this.onCompose()}},l().createElement("i",{className:"fa fa-save"})," Compose ")," ",l().createElement(n.zx,{size:"sm",color:"danger",disabled:this.state.snapshotButtonDisabled,onClick:e=>{e.preventDefault(),this.onSnapshot()}},l().createElement("i",{className:"fa fa-save"})," Snapshot "))))))}restoreState(){this.setState({resourceType:this.props.configuration.resourceType,startDelay:this.props.configuration.startDelay,excludePaths:this.props.configuration.excludePaths.join(", "),persist:this.props.configuration.persist})}updateButtonStates(){}onChangeResourcesProviderId(e){this.setState({resourcesProviderId:e})}onChangeResourceType(e){this.setState({resourceType:e}),this.updateButtonStates()}onChangeStartDelay(e){this.setState({startDelay:e}),this.updateButtonStates()}onChangeExcludePaths(e){this.setState({excludePaths:e.split(/,/).map((e=>e.trim())).sort()}),this.updateButtonStates()}onChangePersist(e){this.setState({persist:e}),this.updateButtonStates()}onSubmit(){this.save(Object.keys(this.props.configuration).reduce(((e,t)=>(e[t]=this.state[t],e)),{}))}onCancel(){this.save(this.props.configuration)}onCompose(){confirm("Compose will rebuild metadata from configuration files. New metadata entities may be created and existing metadata entities may be updated. Proceed?")&&(fetch("/plugins/metadata/compose",{credentials:"include",method:"PATCH"}).then((e=>{switch(e.status){case 201:break;case 500:alert("Compose request failed ("+e.status+")")}})),this.onCancel())}onSnapshot(){confirm("Snaphot will capture live Signal K metadata into the current metadata resource. New metadata entities may be created and existing metadata entities may be updated. Proceed?")&&(fetch("/plugins/metadata/snapshot",{credentials:"include",method:"PATCH"}).then((e=>{switch(e.status){case 201:break;case 500:alert("Snapshot request failed ("+e.status+")")}})),this.onCancel())}}const h=c;var d=a(5429);const u=[{label:"Name properties",options:[{label:"Display name",value:{displayName:""}},{label:"Long name",value:{longName:""}},{label:"Short name",value:{shortName:""}},{label:"All names",value:{displayName:"",longName:"",shortName:""}}]},{label:"Alarm methods",options:[{label:"Alert method",value:{alertMethod:["sound","visual"]}},{label:"Warn method",value:{warnMethod:["sound","visual"]}},{label:"Alarm method",value:{alarmMethod:["sound","visual"]}},{label:"Emergency method",value:{emergencyMethod:["sound","visual"]}},{label:"All methods",value:{alertMethod:["sound","visual"],warnMethod:["sound","visual"],alarmMethod:["sound","visual"],emergencyMethod:["sound","visual"]}}]},{label:"Zones",options:[{label:"Lower",value:{zones:[{lower:.5,state:"alert",message:"Value above 50%"}]}},{label:"Upper",value:{zones:[{upper:.5,state:"alert",message:"Value below 50%"}]}},{label:"Both",value:{zones:[{lower:.5,state:"alert",message:"Value above 50%"},{upper:.5,state:"alert",message:"Value below 50%"}]}}]}];class m extends l().Component{constructor(e){super(e),this.state={urls:e.urls?e.urls:{metadata:"/plugins/metadata/keys",config:"/plugins/metadata/keys",paths:"/plugins/metadata/paths"},scope:e.defaultScope?e.defaultScope:"metadata",metadata_key:null,metadata_value:null,metadata_properties:[],button_save_disabled:!1,button_saveas_disabled:!1,button_delete_disabled:!1,button_add_disabled:!1,button_clear_disabled:!1},this.changeMetadataProperties=this.changeMetadataProperties.bind(this),this.changeMetadataValue=this.changeMetadataValue.bind(this)}render(){return l().createElement(n.l0,{className:"square rounded border",style:{padding:"5px"}},l().createElement(n.cw,null,l().createElement(n.cw,{row:!0,style:{height:"60px"}},l().createElement(n.JX,null,l().createElement(d.ZP,{name:"metadata_key",key:this.state.metadata_key,controlShouldRenderValue:!0,loadOptions:this.loadPathOptions,defaultOptions:!0,key:this.state.scope,value:{value:this.state.metadata_key,label:this.state.metadata_key},onChange:e=>this.changeMetadataKey(e.value)}),l().createElement("div",{class:"scope-buttons"},l().createElement("label",null,l().createElement("input",{type:"radio",name:"scope",value:"metadata",checked:"metadata"===this.state.scope,onChange:e=>this.changeScope(e.target.value)})," metadata "),"    ",l().createElement("label",null,l().createElement("input",{type:"radio",name:"scope",value:"config",checked:"config"===this.state.scope,onChange:e=>this.changeScope(e.target.value)})," config "),"    ",l().createElement("label",null,l().createElement("input",{type:"radio",name:"scope",value:"paths",checked:"paths"===this.state.scope,onChange:e=>this.changeScope(e.target.value)})," paths "),"    "))),l().createElement(n.cw,{row:!0,style:{height:"300px"}},l().createElement(n.JX,null,l().createElement(o,{type:"textarea",name:"metadata_value",key:this.state.metadata_value,value:this.state.metadata_value,rows:"12",wrap:"off",style:{width:"100%"},onChangeCallback:e=>this.changeMetadataValue(e)}),l().createElement(o,{type:"multiselect",name:"metadata_properties",key:this.state.metadata_properties,value:this.state.metadata_properties,options:u,onChangeCallback:e=>this.changeMetadataProperties(e)}))),l().createElement(n.cw,{row:!0},l().createElement(n.JX,null,l().createElement(n.Si,{style:{justifyContent:"space-between"}},l().createElement(n.Si,null,l().createElement(n.zx,{name:"save",size:"sm",color:"primary",disabled:this.state.button_save_disabled,onClick:e=>{e.preventDefault(),this.onSave()}},l().createElement("i",{className:"fa fa-save"})," Save ")," ",l().createElement(n.zx,{name:"saveAs",size:"sm",color:"primary",disabled:this.state.button_saveas_disabled,onClick:e=>{e.preventDefault(),this.onSaveAs()}},l().createElement("i",{className:"fa fa-save"})," Save As ")," ",l().createElement(n.zx,{name:"delete",size:"sm",color:"danger",disabled:this.state.button_delete_disabled,onClick:e=>{e.preventDefault(),this.onDelete()}},l().createElement("i",{className:"fa fa-ban"})," Delete ")),l().createElement(n.Si,null,l().createElement(n.zx,{name:"clear",size:"sm",color:"secondary",disabled:this.state.button_clear_disabled,onClick:e=>{e.preventDefault(),this.onClear()}},l().createElement("i",{className:"fa fa-ban"})," Clear ")))))))}changeScope=e=>{console.log("changeScope(%s)...",e),this.setState({scope:e,metadata_key:null,metadata_value:null})};changeMetadataKey=e=>{console.log("changeMetadataKey(%s)...",e),this.setState({metadata_key:e}),null!=e&&fetch(this.state.urls[this.state.scope]+"/"+e,{credentials:"include"}).then((e=>{e.json().then((e=>{"paths"!=this.state.scope&&(delete e.timestamp,delete e.$source),this.changeMetadataValue(JSON.stringify(e,null,2))}))})).catch((t=>{alert("The metadata value for '"+e+"' could not be retrieved")}))};changeMetadataValue(e){this.setState({metadata_value:e})}changeMetadataProperties(e){this.setState({metadata_properties:e||[]});try{var t=JSON.parse(this.state.metadata_value||"{}");try{(e||[]).map((e=>e.value)).forEach((e=>{t.hasOwnProperty("zones")&&e.hasOwnProperty("zones")?e.zones.forEach((e=>t.zones.push(e))):t={...e,...t}})),this.setState({metadata_value:JSON.stringify(t,null,2)})}catch(e){alert("Cannot merge objects, %s",e.message)}}catch(e){alert("Merge failed because metadata is not valid JSON, %s",e.message)}}loadPathOptions=(e,t)=>{console.log("loadPathOptions()..."),this.setState({metadata_key:null}),fetch(this.state.urls[this.state.scope],{credentials:"include"}).then((e=>{e.json().then((e=>{switch(this.state.scope){case"metadata":t(e.filter((e=>!e.startsWith("."))).map((e=>({value:e,label:e}))));break;case"config":t(e.filter((e=>e.startsWith("."))).map((e=>({value:e,label:e}))));break;case"paths":t(e.sort().map((e=>({value:e,label:e}))))}}))}))};onSave(){try{var e=this.state.metadata_key;if(null===e)throw new Error("key is null");if(!((e=e.trim()).length>0))throw new Error("key is invalid");var t=this.validateMetdataValue(this.state.metadata_value);fetch("/plugins/metadata/keys/"+e,{credentials:"include",method:"PUT",headers:{"Content-type":"application/json"},body:t}).then((e=>{if(201!=e.status)throw new Error("Server rejected save request (Error "+e.status+")")}))}catch(e){alert(e.message)}}onSaveAs(){try{var e=prompt("Enter name of new metadata key");if(null===e)throw new Error("key is null");if(!((e=e.trim()).length>0))throw new Error("key is invalid");var t=this.validateMetadataValue(this.state.metadata_value);fetch("/plugins/metadata/keys/"+e,{credentials:"include",method:"PUT",headers:{"Content-type":"application/json"},body:JSON.stringify(t)}).then((t=>{if(201!=t.status)throw new Error("Server rejected save request (Error "+t.status+")");var a=this.state.scope;this.changeScope(null),this.changeScope(a),this.changeMetadataKey(e)}))}catch(e){alert(e.message)}}onDelete(){try{var e=this.state.metadata_key?this.state.metadata_key:null;if(null===e)throw new Error("invalid key value");confirm("Really delete metadata for '"+e+"'")&&fetch("/plugins/metadata/keys/"+e,{credentials:"include",method:"DELETE",headers:{"Content-type":"application/json"},body:null}).then((e=>{if(200!=e.status)throw new Error("Server rejected delete request (Error "+e.status+")");var t=this.state.scope;this.setState({scope:null}),this.setState({scope:t,metadata_key:null,metadata_value:""})}))}catch(e){alert(e.message)}}onClear(){this.changeMetadataValue(JSON.stringify({},null,2))}validateMetadataValue(e){if(console.log("validateMetadataValue(%s)...",e),e){e=e.trim();var t=JSON.parse(e);if("object"==typeof t)return t;throw new Error("metadata value is not a JSON object")}throw new Error("metadata value is null")}}const p=m,v=e=>l().createElement(n.Zb,null,l().createElement(n.Ol,null,"Metadata Configuration"),l().createElement(n.eW,null,l().createElement("div",null,l().createElement("div",{style:{float:"left",width:"44%"}},l().createElement(h,{configuration:e.configuration,save:t=>e.save(t)})),l().createElement("div",{style:{float:"right",width:"54%"}},l().createElement(p,null)))))}}]);