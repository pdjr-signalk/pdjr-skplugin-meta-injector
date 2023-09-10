import React, { useState, useRef } from 'react';
import Select from 'react-select';

class MultiSelect extends React.Component {

  constructor(props) {
    super(props);

    this.state = {    
      value: props.value
    }

    this.name = props.name || '';
    this.options = props.options || [];
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

export default MultiSelect;