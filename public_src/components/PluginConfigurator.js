import React, { useState, useRef } from 'react';
import { Col, Form, FormGroup, ButtonToolbar, Button } from 'reactstrap';
import FormField from './FormField';

class PluginConfigurator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      resourceType: props.configuration.resourceType,
      startDelay: props.configuration.startDelay,
      excludePaths: props.configuration.excludePaths,
      persist: props.configuration.persist,
      saveButtonDisabled: false,
      cancelButtonDisabled: false
    }
    this.save = props.save;

    this.onChangeResourceType = this.onChangeResourceType.bind(this);
    this.onChangeStartDelay = this.onChangeStartDelay.bind(this);
    this.onChangeExcludePaths = this.onChangeExcludePaths.bind(this);
    this.onChangePersist = this.onChangePersist.bind(this);
  }

  render() {
    return(
      <Form className='square rounded border' style={{ padding: '5px' }}>
        <FormGroup row style={{ height: '60px' }}>
          <Col>
            <FormField type='text' name='resource_type' label='Metadata resource type' value={this.state.resourceType} text='' onChangeCallback={this.onChangeResourceType} />
          </Col>
        </FormGroup>
        <FormGroup row style={{ height: '300px' }}>
          <Col>
            <FormField type='text' name='start_delay' label='Start delay' value={this.state.startDelay} text='' onChangeCallback={this.onChangeStartDelay} />
            <FormField type='text' name='exclude_paths' label='Exclude paths beginning with' value={this.state.excludePaths.join(', ')} text='' onChangeCallback={this.onChangeExcludePaths} />
            <FormField type='checkbox' fieldName='persist' label='Persist dynamic changes' value={this.state.persist} text='' onChangeCallback={this.onChangePersist} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Col>
            <ButtonToolbar style={{ justifyContent: 'space-between' }}>
              <ButtonToolbar>
                <Button size='sm' color='primary' disabled={this.state.saveButtonDisabled} onClick={(e) => { e.preventDefault(); this.onSubmit(); }}><i className='fa fa-save' /> Save </Button>&nbsp;
                <Button size='sm' color='primary' disabled={this.state.cancelButtonDisabled} onClick={(e) => { e.preventDefault(); this.onCancel(); }}><i className='fa fa-ban' /> Cancel </Button>
              </ButtonToolbar>
              <ButtonToolbar>
                <Button size='sm' color='danger' onClick={(e) => { e.preventDefault(); this.onCompose(); }}><i className='fa fa-save' /> Compose </Button>&nbsp;
                <Button size='sm' color='danger' onClick={(e) => { e.preventDefault(); this.onSnapshot(); }}><i className='fa fa-save' /> Snapshot </Button>
              </ButtonToolbar>
            </ButtonToolbar>
          </Col>
        </FormGroup>
      </Form>
    )
  }

  restoreState() {
    this.setState({
      resourceType: this.props.configuration.resourceType,
      startDelay: this.props.configuration.startDelay,
      excludePaths: this.props.configuration.excludePaths.join(', '),
      persist: this.props.configuration.persist
    })
  }

  updateButtonStates() {
    return;
    var noChange = (
      (this.state.resourceType === this.props.configuration.resourceType) &&
      (this.state.startDelay === this.props.configuration.startDelay) &&
      ((JSON.stringify(this.state.excludePaths.sort())) === (JSON.stringify(this.props.configuration.excludePaths.sort()))) &&
      (this.state.persist === this.props.configuration.persist)
    );
    this.setState({ saveButtonDisabled: noChange, cancelButtonDisabled: noChange });
  }

  onChangeResourceType(s) { this.setState({ resourceType: s }); this.updateButtonStates(); }
  onChangeStartDelay(n) { this.setState({ startDelay: n }); this.updateButtonStates(); }
  onChangeExcludePaths(s) { this.setState({ excludePaths: s.split(/,/).map(v=>v.trim()).sort() }); this.updateButtonStates(); }
  onChangePersist(b) { this.setState({ persist: b }); this.updateButtonStates(); } 
  
  /** BUTTON HANDLERS ************************************************/ 

  onSubmit = () => {
    this.save(Object.keys(this.props.configuration).reduce((a,k) => { a[k] = this.state[k]; return(a) }, {})); 
  }

  onCancel = () => {
    this.save(this.props.configuration);
  }
  
  onCompose = () => {
    if (confirm("Compose will rebuild metadata from configuration files. New metadata entities may be created and existing metadata entities may be updated. Proceed?")) {
      fetch("/plugins/metadata/compose", { credentials: 'include', method: 'PUT' }).then((r) => {
        if (r.status !== 200) alert("Compose request failed (" + r.status + ")");
      });
    }
  }
  
  onSnapshot = () => {
    if (confirm("Snaphot will capture live Signal K metadata into the current metadata resource. New metadata entities may be created and existing metadata entities may be updated. Proceed?")) {
      fetch("/plugins/metadata/snapshot", { credentials: 'include', method: 'PUT' }).then((r) => {
        if (r.status !== 200) alert("Snapshot request failed (" + r.status + ")");
      });
    }
  }

}

export default PluginConfigurator;
  