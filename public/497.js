"use strict";(self.webpackChunkpdjr_skplugin_metadata=self.webpackChunkpdjr_skplugin_metadata||[]).push([[497],{59:(e,t,a)=>{a.r(t),a.d(t,{default:()=>c});var l=a(624),r=a.n(l),s=a(264),n=a(985);const c=e=>(fetch("/plugins/metadata/pathList",{credentials:"include"}).then((e=>e.json())).then((e=>alert(JSON.stringify(e)))),r().createElement(s.Zb,null,r().createElement(s.Ol,null,"Metadata Configuration"),r().createElement(s.eW,null,r().createElement("div",null,r().createElement("div",{style:{float:"left",width:"49%"}},r().createElement(i,{configuration:e.configuration,save:t=>e.save(t)})),r().createElement("div",{style:{float:"right",width:"49%"}},r().createElement(p,{options:[{value:"chocolate",label:"Chocolate"},{value:"strawberry",label:"Strawberry"},{value:"vanilla",label:"Vanilla"}]})))))),m={lineHeight:"36px"},o=({type:e,fieldName:t,label:a,value:l,setter:n,text:c})=>r().createElement(s.cw,{row:!0},r().createElement(s.JX,{md:"6"},r().createElement(s.__,{style:m,htmlFor:t},a)),r().createElement(s.JX,{md:"6"},"checkbox"==e?r().createElement(s.II,{type:"checkbox",name:t,onChange:e=>n(e.target.checked),checked:l}):"","text"==e?r().createElement(s.II,{type:"text",name:t,onChange:e=>n(e.target.value),value:l}):"",r().createElement(s.R9,{color:"muted"},c))),i=({configuration:e,save:t})=>{const[a,n]=(0,l.useState)(e.resourceType),[c,m]=(0,l.useState)(e.startDelay),[i,p]=(0,l.useState)((()=>e.excludePaths.sort().join(", "))),[u,E]=(0,l.useState)(e.persist),[d,y]=(0,l.useState)(e.compose),[h,f]=(0,l.useState)(e.snapshot);return r().createElement(s.l0,{className:"square rounded border",style:{padding:"5px"}},r().createElement(s.cw,{row:!0,style:{height:"60px"}},r().createElement(s.JX,null,r().createElement(o,{type:"text",fieldName:"resourceType",label:"Metadata resource type",value:a,setter:n,text:""}))),r().createElement(s.cw,{row:!0,style:{height:"300px"}},r().createElement(s.JX,null,r().createElement(o,{type:"text",fieldName:"startDelay",label:"Start delay",value:c,setter:m,text:""}),r().createElement(o,{type:"text",fieldName:"excludePathsString",label:"Exclude paths beginning with",value:i,setter:p,text:""}),r().createElement(o,{type:"checkbox",fieldName:"persist",label:"Persist dynamic changes",value:u,setter:E,text:""}),r().createElement(o,{type:"checkbox",fieldName:"compose",label:"Compose metadata",value:d,setter:y,text:""}),r().createElement(o,{type:"checkbox",fieldName:"snapshot",label:"Take metadata snapshot",value:h,setter:f,text:""}))),r().createElement(s.cw,{row:!0},r().createElement(s.JX,null,r().createElement(s.Si,{style:{justifyContent:"space-between"}},r().createElement(s.zx,{size:"sm",color:"primary",onClick:e=>{e.preventDefault(),t({resourceType:a,startDelay:c,excludePaths:i.split(/,/).map((e=>e.trim())).sort(),persist:u,compose:d,snapshot:h})}},r().createElement("i",{className:"fa fa-save"})," Save "),r().createElement(s.zx,{size:"sm",color:"secondary",onClick:t=>{t.preventDefault(),n(e.resourceType),m(e.startDelay),p(e.excludePaths.sort().join(", ")),E(e.persist),y(e.compose),f(e.snapshot)}},r().createElement("i",{className:"fa fa-ban"})," Cancel ")))))},p=({pathList:e,keyList:t})=>r().createElement(s.l0,{className:"square rounded border",style:{padding:"5px"}},r().createElement(s.cw,null,r().createElement(s.cw,{row:!0,style:{height:"60px"}},r().createElement(s.JX,{md:"6"},r().createElement(n.ZP,{options:e})),r().createElement(s.JX,{md:"6"},r().createElement(n.ZP,{options:t}))),r().createElement(s.cw,{row:!0,style:{height:"300px"}},r().createElement(s.JX,null,r().createElement("textarea",{rows:"12",wrap:"off",style:{width:"100%"}}))),r().createElement(s.cw,{row:!0},r().createElement(s.JX,null,r().createElement(s.Si,{style:{justifyContent:"space-between"}},r().createElement(s.Si,null,r().createElement(s.zx,{size:"sm",color:"primary",onClick:e=>{e.preventDefault(),props.save({resourceType,startDelay})}},r().createElement("i",{className:"fa fa-save"})," Save")," ",r().createElement(s.zx,{size:"sm",color:"primary",onClick:e=>{e.preventDefault(),props.save({resourceType,startDelay})}},r().createElement("i",{className:"fa fa-save"})," Save As")),r().createElement(s.zx,{size:"sm",color:"danger"},r().createElement("i",{className:"fa fa-ban"})," Delete"))))))}}]);