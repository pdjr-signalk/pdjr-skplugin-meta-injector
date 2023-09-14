import React from 'react';
import { Col, FormGroup, FormText, Label, Input } from 'reactstrap';
import Select from 'react-select';

class FormField extends React.Component {

  constructor(props) {
    super(props);

    this.type = props.type || 'text'
    this.name = props.name;
    this.value = props.value;
    this.label = props.label;
    this.radios = props.radios;
    this.text = props.text;
    this.options = props.options;
    this.rows = props.rows || '12'
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
            ? <Input type='checkbox' name={this.name} onChange={(e)=>this.state.onChangeCallback(e.target.value)} checked={this.value} />
            : ''
          }
          {
            (this.type == 'multiselect')
            ? <Select name={this.name} options={this.options} defaultValue={this.value} value={this.value} isMulti className="basic-multi-select" classNamePrefix="select" onChange={(v)=>this.onChangeCallback(v)} />
            : ''
          }
          {
            (this.type == 'text')
            ? <Input type='text' name={this.name} onChange={(e)=>this.onChangeCallback(e.target.value.trim() )} value={this.value} />
            : ''
          }
          {
            (this.type == 'textarea')
            ? <textarea name={this.name} rows={this.rows} wrap='off' style={{ width: '100%' }} value={this.value} onChange={(e)=>this.onChangeCallback(e.target.value)} />
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

}

export default FormField;