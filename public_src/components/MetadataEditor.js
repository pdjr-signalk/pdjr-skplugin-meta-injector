import React from 'react'
import { Col, Form, FormGroup, ButtonToolbar, Button, Select } from 'reactstrap'
import AsyncSelect from 'react-select/async';
import ContentSelect from './ContentSelect';

class MetadataEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      urls: (props.urls)?props.urls:{ metadata: '/plugins/metadata/keys', config: '/plugins/metadata/keys', paths: '/plugins/metadata/paths' },
      scope: (props.defaultScope)?props.defaultScope:'metadata',
      metadata_key: null,
      metadata_value: null,
      new_properties: [],
      button_save_disabled: false,
      button_saveas_disabled: false,
      button_delete_disabled: false,
      button_add_disabled: false,
      button_clear_disabled: false
    }
    this.changeNewProperties = this.changeNewProperties.bind(this);
  }

  render() {
    return(
      <Form className='square rounded border' style={{ padding: '5px' }}>
        <FormGroup>
          <FormGroup row style={{ height: '60px' }}>
            <Col>
              <AsyncSelect name="metadata_key" controlShouldRenderValue={true} loadOptions={this.loadPathOptions} defaultOptions key={this.state.scope} value={{ value: this.state.metadata_key, label: this.state.metadata_key }} onChange={(e)=>this.changeMetadataKey(e.value)} />
              <div class="scope-buttons">
                <label><input type="radio" name="scope" value="metadata" checked={this.state.scope === "metadata"} onChange={(e)=>this.changeScope(e.target.value)} /> metadata </label>&nbsp;&nbsp;&nbsp;&nbsp;
                <label><input type="radio" name="scope" value="config" checked={this.state.scope === "config"} onChange={(e)=>this.changeScope(e.target.value)} /> config </label>&nbsp;&nbsp;&nbsp;&nbsp;
                <label><input type="radio" name="scope" value="paths" checked={this.state.scope === "paths"} onChange={(e)=>this.changeScope(e.target.value)} /> paths </label>&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </Col>
          </FormGroup>
          <FormGroup row style={{ height: '300px' }}>
            <Col>
              <textarea name='metadata' rows='12' wrap='off' style={{ width: '100%' }} value={this.state.metadata_value} onChange={(e)=>this.changeMetadataValue(e.target.value)} />
              <ContentSelect onChangeCallback={(v)=>this.changeNewProperties(v)}/>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col>
              <ButtonToolbar style={{ justifyContent: 'space-between' }}>
                <ButtonToolbar>
                  <Button name="save" size='sm' color='primary' disabled={this.state.button_save_disabled} onClick={(e) => { e.preventDefault(); this.onSave(); }}><i className='fa fa-save' /> Save </Button>&nbsp;
                  <Button name="saveAs" size='sm' color='primary' disabled={this.state.button_saveas_disabled} onClick={(e) => { e.preventDefault(); this.onSaveAs(); }}><i className='fa fa-save' /> Save As </Button>&nbsp;
                  <Button name="delete" size='sm' color='danger' disabled={this.state.button_delete_disabled} onClick={(e) => { e.preventDefault(); this.onDelete(); }}><i className='fa fa-ban' /> Delete </Button>
                </ButtonToolbar>
                <ButtonToolbar >
                  <Button name="clear" size='sm' color='secondary' disabled={this.state.button_clear_disabled} onClick={(e) => { e.preventDefault(); this.onClear(); }}><i className='fa fa-ban' /> Clear </Button>
                </ButtonToolbar>
              </ButtonToolbar>
            </Col>
          </FormGroup>
        </FormGroup>
      </Form>
    )
  }
  
  /**
   * Change the editor's scope context to <scope> and invalidate the
   * metadata key and value properties. These property changes will
   * trigger consequent.
   * 
   * @param {*} scope - new scope. 
   */
  changeScope = (scope) => {
    console.log("changeScope(%s)...", scope);
    this.setState({
      scope: scope,
      metadata_key: null,
      metadata_value: null
    });
  }

  /**
   * Change the editor's currently selected metadata key to <key>
   * and fetch the metadata value for <key> from the plugin's HTTP
   * API.
   * @param {} key - the metadata key to be loaded.
   */
  changeMetadataKey = (key) => {
    console.log("changeMetadataKey(%s)...", key);
    this.setState({ metadata_key: key });
    if (key != null) {
      fetch(this.state.urls[this.state.scope] + "/" + key, { credentials: 'include' }).then((r) => {
        r.json().then((r) => {
          if (this.state.scope != 'paths') {
            delete r.value['timestamp'];
            delete r.value['$source'];
          }
          this.changeMetadataValue(JSON.stringify(r.value, null, 2));
        });
      }).catch((e) => {
        alert("The metadata value for '" + key + "' could not be retrieved");
      })
    }
  }

  /**
   * Set the value of the editor textarea to <text>.
   * @param {*} text - value to load into textarea.
   */
  changeMetadataValue(text) { 
    console.log("changeMetadataValue(%s)...", text);
    this.setState({ metadata_value: ((text)?text:"") });
  }

  changeNewProperties(obj) {
    console.log("changeNewProperties(%s)...", JSON.stringify(obj));
    this.setState({ new_properties: (obj || []) });
    try {
      var metadata = JSON.parse(this.state.metadata_value || "{}");
      try {
        (obj || []).forEach(p => {
          if (metadata.hasOwnProperty('zones') && p.hasOwnProperty('zones')) {
            p.zones.forEach(z => metadata.zones.push(z));
          } else {
            metadata = { ...p, ...metadata };
          }
        });
        this.setState({ metadata_value: JSON.stringify(metadata, null, 2) });
      } catch(e) {
        alert("Cannot merge objects, %s", e.message);
      }
    } catch(e) {
      alert("Merge failed because metadata is not valid JSON, %s", e.message)
    }    
  }


  loadPathOptions = (inputValue, callback) => {
    this.setState({
      metadata_key: null
    });
    fetch(this.state.urls[this.state.scope], { credentials: 'include'}) .then((r) => {
      r.json().then((r) => {
        switch (this.state.scope) {
          case 'metadata': callback(r.keys.filter(k => (!k.startsWith('.'))).map(k => ({ 'value': k, 'label': k })));
            break;
          case 'config': callback(r.keys.filter(k => (k.startsWith('.'))).map(k => ({ 'value': k, 'label': k })));
            break;
          case 'paths': callback(r.keys.sort().map(k => ({ 'value': k, 'label': k })));
            break;
        }
      })
    })
  }
  
  onSave() {
    try {
      var key = this.state.metadata_key;
      if (key !== null) {
        key = key.trim();
        if (key.length > 0) {
          var jsonMetadataValue = this.validateMetdataValue(this.state.metadata_value);
          fetch("/plugins/metadata/keys/" + key, { credentials: 'include', method: 'PUT', headers: { 'Content-type': 'application/json' }, body: jsonMetadataValue }).then((r) => {
            if (r.status == 201) {
              ;
            } else {
              throw new Error("Server rejected save request (Error " + r.status + ")");
            }
          });
        } else {
          throw new Error("key is invalid");
        }
      } else {
        throw new Error("key is null");
      }
    } catch(e) { alert(e.message); }
  }
  
  onSaveAs() {
    try {
      var key = prompt("Enter name of new metadata key");
      if (key !== null) {
        key = key.trim();
        if (key.length > 0) {
          var jsonMetadataValue = this.validateMetadataValue(this.state.metadata_value);
          fetch("/plugins/metadata/keys/" + key, { credentials: 'include', method: 'PUT', headers: { 'Content-type': 'application/json' }, body: JSON.stringify(jsonMetadataValue) }).then((r) => {
            if (r.status == 201) {
              var scope = this.state.scope;
              this.changeScope(null);
              this.changeScope(scope);
              this.changeMetadataKey(key);
            } else {
              throw new Error("Server rejected save request (Error " + r.status + ")");
            }
          });
        } else {
          throw new Error("key is invalid");
        }
      } else {
        throw new Error("key is null");
      }
    } catch(e) { alert(e.message); }
  }
  
  onDelete() {
    try {
      var key = (this.state.metadata_key)?this.state.metadata_key:null;
      if (key !== null) {
        if (confirm("Really delete metadata for " + key)) {
          fetch("/plugins/metadata/keys/" + key, { credentials: 'include', method: 'PUT', headers: { 'Content-type': 'application/json' }, body: null }).then((r) => {
            if (r.status == 200) {
              var s = this.state.scope;
              this.setState({ scope: null });
              this.setState({ scope: s, metadata_key: null, metadata_value: '' });
            } else {
              throw new Error("Server rejected delete request (Error " + r.status + ")");
            }
          });  
        }
      } else {
        throw new Error("invalid key value");
      }
    } catch(e) { alert(e.message); }
  }

  onClear() {
    this.setState({ metadata_value: JSON.stringify({}, null, 2) });
  }
    
  validateMetadataValue(text) {
    console.log("validateMetadataValue(%s)...", text);
    if (text) {
      text = text.trim();
      var value = JSON.parse(text);
      if (typeof value === "object") {
        return(value);
      } else {
        throw new Error("metadata value is not a JSON object");
      }
    } else {
      throw new Error("metadata value is null");
    }
  }
     
}

export default MetadataEditor;