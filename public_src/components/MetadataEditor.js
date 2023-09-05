import React from 'react'
import { Col, Form, FormGroup, ButtonToolbar, Button } from 'reactstrap'
import AsyncSelect from 'react-select/async';

class MetadataEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      urls: (props.urls)?props.urls:{ metadata: '/plugins/metadata/keys', config: '/plugins/metadata/keys', paths: '/plugins/metadata/paths' },
      scope: (props.defaultScope)?props.defaultScope:'metadata',
      metadata_key: null,
      metadata_value: null,
      button_save_disabled: true,
      button_saveas_disabled: true,
      button_delete_disabled: true
    }
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
              <textarea name='metadata' rows='12' wrap='off' style={{ width: '100%' }} value={this.state.metadata_value || ''} onChange={(e)=>changeMetadata(e.value)} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col>
              <ButtonToolbar style={{ justifyContent: 'space-between' }}>
                <ButtonToolbar>
                  <Button name="save" size='sm' color='primary' disabled={this.state.button_save_disabled} onClick={(e) => { e.preventDefault(); onSave(); }}><i className='fa fa-save' /> Save </Button>&nbsp;
                  <Button name="saveAs" size='sm' color='primary' disabled={this.state.button_saveas_disabled} onClick={(e) => { e.preventDefault(); onSaveAs(); }}><i className='fa fa-save' /> Save As </Button>&nbsp;
                </ButtonToolbar>
                <ButtonToolbar >
                  <Button name="delete" size='sm' color='danger' disabled={this.state.button_delete_disabled} onClick={(e) => { e.preventDefault(); onDelete(); }}><i className='fa fa-ban' /> Delete </Button>
                </ButtonToolbar>
              </ButtonToolbar>
            </Col>
          </FormGroup>
        </FormGroup>
      </Form>
    )
  }
  
  changeScope = (s) => {
    console.log("changeScope(%s)...", s);
    this.setState({
      scope: s,
      metadata_key: null,
      metadata_value: null
    });
  }

  changeMetadataKey = (key) => {
    console.log("changeMetadataKey(%s)...", key);
    this.setState({
      metadata_key: key,
      button_save_disabled: true,
      button_saveas_disabled: true,
      button_delete_disabled: true
    });
    if (key != null) {
      fetch(this.state.urls[this.state.scope] + "/" + key, { credentials: 'include' }).then((r) => {
        r.json().then((r) => {
          delete r.value['timestamp'];
          delete r.value['$source'];
          this.changeMetadataValue(JSON.stringify(r.value, null, 2));
        });
      }).catch((e) => {
        alert("The metadata value for '" + key + "' could not be retrieved");
      })
    }
  }

  changeMetadataValue = (text) => { 
    console.log("changeMetadataValue(%s)...", text);
    this.setState({
      metadata_value: ((text)?text:""),
      button_save_disabled: ((text === null) || (this.scope === 'paths')),
      button_saveas_disabled: (text === null),
      button_delete_disabled: ((text === null) || (this.scope === 'paths'))
    });
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
          case 'paths': callback(r.keys.map(k => ({ 'value': k, 'label': k })));
            break;
        }
      })
    })
  }
  
  onSave = () => {
    try {
      var [key,value] = validateMetdata(((this.state.metadata_key)?this.state.metadata_key.value:null), this.state.metadata_value);
      fetch("/plugins/metadata/keys/" + key, { credentials: 'include', method: 'PUT', headers: { 'Content-type': 'application/json' }, body: value }).then((r) => {
        if (r.status == 200) {
          ;
        } else {
          throw new Error("Server rejected save request (Error " + r.status + ")");
        }
      });
    } catch(e) { alert(e.message); }
  }
  
  onSaveAs = () => {
    try {
      if (key = prompt("Enter name of new metadata key")) {
        var [key,value] = validateMetadata(key, this.state.metadata_value);
        fetch("/plugins/metadata/keys/" + key, { credentials: 'include', method: 'PUT', headers: { 'Content-type': 'application/json' }, body: value }).then((r) => {
          if (r.status == 200) {
            ;
          } else {
            throw new Error("Server rejected save request (Error " + r.status + ")");
          }
        });
      }
    } catch(e) { alert(e.message); }
  }
  
  onDelete = () => {
    try {
      var key = (this.state.metadata_key)?this.state.metadata_key.value:null;
      if (key !== null) {
        if (confirm("Really delete metadata for " + key)) {
          fetch("/plugins/metadata/keys/" + key, { credentials: 'include', method: 'PUT', headers: { 'Content-type': 'application/json' }, body: null }).then((r) => {
            if (r.status == 200) {
              var s = state.scope; this.setState({ scope: null });
              this.setState({
                scope: s,
                metadata_value: null
              });
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
    
  validateMetdata = (key, value) => {
    console.log("validating %s %s", key, value);
    var k, v;
    if (key !== null) {
      k = key.trim();
      if (k.length > 0) {
        if (value) {
          v = value.trim();
          try { v = JSON.parse(v); } catch(e) { throw new Error("matadata value is not valid JSON"); }
          if (typeof v === "object") {
            return([k,JSON.stringify(v)]);
          } else {
            throw new Error("metadata value is not a JSON object");
          }
        } else {
          throw new Error("metadata value is null");
        }
      } else {
        throw new Error("key is blank");
      }
    } else {
      throw new Error("key is null");
    }
  }  
     
}

export default MetadataEditor;