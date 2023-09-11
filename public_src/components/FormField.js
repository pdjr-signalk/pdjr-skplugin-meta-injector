import React, { useState, useRef } from 'react';
import { Col, FormGroup, FormText, Label, Input } from 'reactstrap';
import Select from 'react-select';

class FormField extends React.Component {

  constructor(props) {
    super(props);

    this.state = {    
      value: props.value
    }

    this.type = props.type || 'text'
    this.name = props.name;
    this.label = props.label;
    this.text = props.text;
    this.options = props.options;
    this.label_style = { lineHeight: '36px' };
    this.onChangeCallback = props.onChangeCallback;

  }

  render() {
    var width = (this.label)?'6':'12';
    return(
      <FormGroup row>
        {
          (this.label)
          ? <Col md={width}><Label style={this.label_style} htmlFor={this.name}>{this.label}</Label></Col>
          : ''
        }
        <Col md={width}>
          {
            (this.type == 'checkbox')
            ? <Input type='checkbox' name={this.name} onChange={(e)=>this.setValue(e.target.checked)} checked={this.state.value} />
            : ''
          }
          {
            (this.type == 'multiselect')
            ? <Select name={this.name} options={this.options} defaultValue={this.defaultValue} value={this.state.value} isMulti className="basic-multi-select" classNamePrefix="select" onChange={(v)=>this.setValue(v)} />
            : ''
          }
          {
            (this.type == 'text')
            ? <Input type='text' name={this.name} onChange={(e)=>this.setValue(e.target.value )} value={this.state.value} />
            : ''
          }
          {
            (this.text)
            ? <FormText color='muted'>{this.text}</FormText>
            : ''
          }
        </Col>
      </FormGroup>
    )
  }

  setValue(v) {
    var callbackValue = null;

    this.setState({ value: v });

    switch (this.type) {
      case 'checkbox': callbackValue = v; break;
      case 'text': callbackValue = v; break;
      case 'multiselect': callbackValue = v.map(option => option.value); break;
    }
    if (this.onChangeCallback !== null) this.onChangeCallback(callbackValue);
  }

}

export default FormField;