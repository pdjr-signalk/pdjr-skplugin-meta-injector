import React, { useState, useRef } from 'react';
import Select from 'react-select';
import { contentOptions } from '../data/data.js';

class ContentSelect extends React.Component {

  constructor(props) {
    super(props);

    this.state = {    
      value: props.value
    }

    this.name = props.name || '';
    this.options = (props.options || contentOptions).sort((a,b)=>((a.label.toUpperCase() > b.label.toUpperCase())?1:-1));
    this.defaultValue = props.defaultValue || null;
    this.onChangeCallback = props.onChangeCallback || null;

  }

  render() {
    return(
      <Select
        name={this.name}
        options={this.options}
        defaultValue={this.defaultValue}
        value={this.state.value}
        isMulti
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={(v)=>this.setValue(v)}
      />
    )
  }

  setValue(v) {
    console.log("setValue(%s)...", JSON.stringify(v));
    this.setState({ value: v })
    if (this.onChangeCallback !== null) {
      var values = v.map(option => option.value);
      this.onChangeCallback(values);
    }
  }

}

export default ContentSelect;