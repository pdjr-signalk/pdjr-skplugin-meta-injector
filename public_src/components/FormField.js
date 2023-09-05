import React, { useState, useRef } from 'react';
import { Col, FormGroup, FormText, Label, Input } from 'reactstrap';

class FormField extends React.Component {

  constructor(props) {
    super(props);

    this.state = {    
      label_style: { lineHeight: '36px' },
      type: props.type,
      name: props.name,
      label: props.label,
      text: props.text,
      value: props.value,
      setter: props.setter
    }
  }

  render() {
    return(
      <FormGroup row>
        <Col md='6'>
          <Label style={this.state.label_style} htmlFor={this.state.name}>{this.state.label}</Label>
        </Col>
        <Col md='6'>
        {
          (this.state.type == 'checkbox')
          ? <Input type='checkbox' name={this.state.name} onChange={(e)=>this.setValue(e.target.checked)} checked={this.state.value} />
          : ''
        }
        {
          (this.state.type == 'text')
          ? <Input type='text' name={this.state.name} onChange={(e)=>this.setValue(e.target.value )} value={this.state.value} />
          : ''
        }
        <FormText color='muted'>{this.state.text}</FormText>
        </Col>
      </FormGroup>
    )
  }

  setValue(v) {
    this.setState({ value: v });
    this.state.setter(v);
  }

}

export default FormField;