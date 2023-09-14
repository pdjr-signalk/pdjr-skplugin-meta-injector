"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkpdjr_skplugin_metadata"] = self["webpackChunkpdjr_skplugin_metadata"] || []).push([["public_src_components_PluginConfigurationPanel_js-webpack_sharing_consume_default_react_react-8e7a4e"],{

/***/ "./public_src/components/FormField.js":
/*!********************************************!*\
  !*** ./public_src/components/FormField.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"webpack/sharing/consume/default/react/react?76b1\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var reactstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! reactstrap */ \"./node_modules/reactstrap/dist/reactstrap.es.js\");\n/* harmony import */ var react_select__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-select */ \"./node_modules/react-select/dist/react-select.browser.esm.js\");\n\n\n\nclass FormField extends (react__WEBPACK_IMPORTED_MODULE_0___default().Component) {\n  constructor(props) {\n    super(props);\n    this.type = props.type || 'text';\n    this.name = props.name;\n    this.value = props.value;\n    this.label = props.label;\n    this.radios = props.radios;\n    this.text = props.text;\n    this.options = props.options;\n    this.rows = props.rows || '12';\n    this.label_style = {\n      lineHeight: '36px'\n    };\n    this.onChangeCallback = props.onChangeCallback;\n  }\n  render() {\n    var width = this.label ? '6' : '12';\n    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, {\n      row: true\n    }, this.label ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, {\n      md: width\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Label, {\n      style: this.label_style,\n      htmlFor: this.name\n    }, this.label)) : '', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, {\n      md: width\n    }, this.type == 'checkbox' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Input, {\n      type: \"checkbox\",\n      name: this.name,\n      onChange: e => this.state.onChangeCallback(e.target.value),\n      checked: this.value\n    }) : '', this.type == 'multiselect' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_select__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      name: this.name,\n      options: this.options,\n      defaultValue: this.value,\n      value: this.value,\n      isMulti: true,\n      className: \"basic-multi-select\",\n      classNamePrefix: \"select\",\n      onChange: v => this.onChangeCallback(v)\n    }) : '', this.type == 'text' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Input, {\n      type: \"text\",\n      name: this.name,\n      onChange: e => this.onChangeCallback(e.target.value.trim()),\n      value: this.value\n    }) : '', this.type == 'textarea' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"textarea\", {\n      name: this.name,\n      rows: this.rows,\n      wrap: \"off\",\n      style: {\n        width: '100%'\n      },\n      value: this.value,\n      onChange: e => this.onChangeCallback(e.target.value)\n    }) : '', this.text ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormText, {\n      color: \"muted\"\n    }, this.text) : ''));\n  }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FormField);\n\n//# sourceURL=webpack://pdjr-skplugin-metadata/./public_src/components/FormField.js?");

/***/ }),

/***/ "./public_src/components/MetadataEditor.js":
/*!*************************************************!*\
  !*** ./public_src/components/MetadataEditor.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"webpack/sharing/consume/default/react/react?76b1\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var reactstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! reactstrap */ \"./node_modules/reactstrap/dist/reactstrap.es.js\");\n/* harmony import */ var react_select_async__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-select/async */ \"./node_modules/react-select/async/dist/react-select.browser.esm.js\");\n/* harmony import */ var _FormField__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./FormField */ \"./public_src/components/FormField.js\");\n/* harmony import */ var _data_data_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../data/data.js */ \"./public_src/data/data.js\");\n\n\n\n\n\nclass MetadataEditor extends (react__WEBPACK_IMPORTED_MODULE_0___default().Component) {\n  constructor(props) {\n    super(props);\n    this.state = {\n      urls: props.urls ? props.urls : {\n        metadata: '/plugins/metadata/keys',\n        config: '/plugins/metadata/keys',\n        paths: '/plugins/metadata/paths'\n      },\n      scope: props.defaultScope ? props.defaultScope : 'metadata',\n      metadata_key: null,\n      metadata_value: null,\n      metadata_properties: [],\n      button_save_disabled: false,\n      button_saveas_disabled: false,\n      button_delete_disabled: false,\n      button_add_disabled: false,\n      button_clear_disabled: false\n    };\n    this.changeMetadataProperties = this.changeMetadataProperties.bind(this);\n    this.changeMetadataValue = this.changeMetadataValue.bind(this);\n  }\n  render() {\n    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Form, {\n      className: \"square rounded border\",\n      style: {\n        padding: '5px'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, {\n      row: true,\n      style: {\n        height: '60px'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_select_async__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      name: \"metadata_key\",\n      key: this.state.metadata_key,\n      controlShouldRenderValue: true,\n      loadOptions: this.loadPathOptions,\n      defaultOptions: true,\n      key: this.state.scope,\n      value: {\n        value: this.state.metadata_key,\n        label: this.state.metadata_key\n      },\n      onChange: e => this.changeMetadataKey(e.value)\n    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"div\", {\n      class: \"scope-buttons\"\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"label\", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"input\", {\n      type: \"radio\",\n      name: \"scope\",\n      value: \"metadata\",\n      checked: this.state.scope === \"metadata\",\n      onChange: e => this.changeScope(e.target.value)\n    }), \" metadata \"), \"\\xA0\\xA0\\xA0\\xA0\", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"label\", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"input\", {\n      type: \"radio\",\n      name: \"scope\",\n      value: \"config\",\n      checked: this.state.scope === \"config\",\n      onChange: e => this.changeScope(e.target.value)\n    }), \" config \"), \"\\xA0\\xA0\\xA0\\xA0\", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"label\", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"input\", {\n      type: \"radio\",\n      name: \"scope\",\n      value: \"paths\",\n      checked: this.state.scope === \"paths\",\n      onChange: e => this.changeScope(e.target.value)\n    }), \" paths \"), \"\\xA0\\xA0\\xA0\\xA0\"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, {\n      row: true,\n      style: {\n        height: '300px'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FormField__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n      type: \"textarea\",\n      name: \"metadata_value\",\n      key: this.state.metadata_value,\n      value: this.state.metadata_value,\n      rows: \"12\",\n      wrap: \"off\",\n      style: {\n        width: '100%'\n      },\n      onChangeCallback: v => this.changeMetadataValue(v)\n    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FormField__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n      type: \"multiselect\",\n      name: \"metadata_properties\",\n      key: this.state.metadata_properties,\n      value: this.state.metadata_properties,\n      options: _data_data_js__WEBPACK_IMPORTED_MODULE_4__.contentOptions,\n      onChangeCallback: v => this.changeMetadataProperties(v)\n    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, {\n      row: true\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.ButtonToolbar, {\n      style: {\n        justifyContent: 'space-between'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.ButtonToolbar, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      name: \"save\",\n      size: \"sm\",\n      color: \"primary\",\n      disabled: this.state.button_save_disabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onSave();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-save\"\n    }), \" Save \"), \"\\xA0\", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      name: \"saveAs\",\n      size: \"sm\",\n      color: \"primary\",\n      disabled: this.state.button_saveas_disabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onSaveAs();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-save\"\n    }), \" Save As \"), \"\\xA0\", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      name: \"delete\",\n      size: \"sm\",\n      color: \"danger\",\n      disabled: this.state.button_delete_disabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onDelete();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-ban\"\n    }), \" Delete \")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.ButtonToolbar, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      name: \"clear\",\n      size: \"sm\",\n      color: \"secondary\",\n      disabled: this.state.button_clear_disabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onClear();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-ban\"\n    }), \" Clear \")))))));\n  }\n\n  /**\n   * Change the editor's scope context to <scope> and invalidate the\n   * metadata key and value properties. These property changes will\n   * trigger consequent.\n   * \n   * @param {*} scope - new scope. \n   */\n  changeScope = scope => {\n    console.log(\"changeScope(%s)...\", scope);\n    this.setState({\n      scope: scope,\n      metadata_key: null,\n      metadata_value: null\n    });\n  };\n\n  /**\n   * Change the editor's currently selected metadata key to <key>\n   * and fetch the metadata value for <key> from the plugin's HTTP\n   * API.\n   * @param {} key - the metadata key to be loaded.\n   */\n  changeMetadataKey = key => {\n    console.log(\"changeMetadataKey(%s)...\", key);\n    this.setState({\n      metadata_key: key\n    });\n    if (key != null) {\n      fetch(this.state.urls[this.state.scope] + \"/\" + key, {\n        credentials: 'include'\n      }).then(r => {\n        r.json().then(r => {\n          if (this.state.scope != 'paths') {\n            delete r['timestamp'];\n            delete r['$source'];\n          }\n          this.changeMetadataValue(JSON.stringify(r, null, 2));\n        });\n      }).catch(e => {\n        alert(\"The metadata value for '\" + key + \"' could not be retrieved\");\n      });\n    }\n  };\n\n  /**\n   * Set the value of the editor textarea to <text>.\n   * @param {*} text - value to load into textarea.\n   */\n  changeMetadataValue(text) {\n    //console.log(\"changeMetadataValue(%s)...\", text);\n    this.setState({\n      metadata_value: text\n    });\n  }\n  changeMetadataProperties(obj) {\n    //console.log(\"changeMetadataProperties(%s)...\", JSON.stringify(obj));\n    this.setState({\n      metadata_properties: obj || []\n    });\n    try {\n      var metadata = JSON.parse(this.state.metadata_value || \"{}\");\n      try {\n        (obj || []).map(p => p.value).forEach(p => {\n          if (metadata.hasOwnProperty('zones') && p.hasOwnProperty('zones')) {\n            p.zones.forEach(z => metadata.zones.push(z));\n          } else {\n            metadata = {\n              ...p,\n              ...metadata\n            };\n          }\n        });\n        this.setState({\n          metadata_value: JSON.stringify(metadata, null, 2)\n        });\n      } catch (e) {\n        alert(\"Cannot merge objects, %s\", e.message);\n      }\n    } catch (e) {\n      alert(\"Merge failed because metadata is not valid JSON, %s\", e.message);\n    }\n  }\n  loadPathOptions = (inputValue, callback) => {\n    console.log(\"loadPathOptions()...\");\n    this.setState({\n      metadata_key: null\n    });\n    fetch(this.state.urls[this.state.scope], {\n      credentials: 'include'\n    }).then(r => {\n      r.json().then(r => {\n        switch (this.state.scope) {\n          case 'metadata':\n            callback(r.filter(k => !k.startsWith('.')).map(k => ({\n              'value': k,\n              'label': k\n            })));\n            break;\n          case 'config':\n            callback(r.filter(k => k.startsWith('.')).map(k => ({\n              'value': k,\n              'label': k\n            })));\n            break;\n          case 'paths':\n            callback(r.sort().map(k => ({\n              'value': k,\n              'label': k\n            })));\n            break;\n        }\n      });\n    });\n  };\n  onSave() {\n    try {\n      var key = this.state.metadata_key;\n      if (key !== null) {\n        key = key.trim();\n        if (key.length > 0) {\n          var jsonMetadataValue = this.validateMetdataValue(this.state.metadata_value);\n          fetch(\"/plugins/metadata/keys/\" + key, {\n            credentials: 'include',\n            method: 'PUT',\n            headers: {\n              'Content-type': 'application/json'\n            },\n            body: jsonMetadataValue\n          }).then(r => {\n            if (r.status == 201) {\n              ;\n            } else {\n              throw new Error(\"Server rejected save request (Error \" + r.status + \")\");\n            }\n          });\n        } else {\n          throw new Error(\"key is invalid\");\n        }\n      } else {\n        throw new Error(\"key is null\");\n      }\n    } catch (e) {\n      alert(e.message);\n    }\n  }\n  onSaveAs() {\n    try {\n      var key = prompt(\"Enter name of new metadata key\");\n      if (key !== null) {\n        key = key.trim();\n        if (key.length > 0) {\n          var jsonMetadataValue = this.validateMetadataValue(this.state.metadata_value);\n          fetch(\"/plugins/metadata/keys/\" + key, {\n            credentials: 'include',\n            method: 'PUT',\n            headers: {\n              'Content-type': 'application/json'\n            },\n            body: JSON.stringify(jsonMetadataValue)\n          }).then(r => {\n            if (r.status == 201) {\n              var scope = this.state.scope;\n              this.changeScope(null);\n              this.changeScope(scope);\n              this.changeMetadataKey(key);\n            } else {\n              throw new Error(\"Server rejected save request (Error \" + r.status + \")\");\n            }\n          });\n        } else {\n          throw new Error(\"key is invalid\");\n        }\n      } else {\n        throw new Error(\"key is null\");\n      }\n    } catch (e) {\n      alert(e.message);\n    }\n  }\n  onDelete() {\n    try {\n      var key = this.state.metadata_key ? this.state.metadata_key : null;\n      if (key !== null) {\n        if (confirm(\"Really delete metadata for '\" + key + \"'\")) {\n          fetch(\"/plugins/metadata/keys/\" + key, {\n            credentials: 'include',\n            method: 'DELETE',\n            headers: {\n              'Content-type': 'application/json'\n            },\n            body: null\n          }).then(r => {\n            if (r.status == 200) {\n              var s = this.state.scope;\n              this.setState({\n                scope: null\n              });\n              this.setState({\n                scope: s,\n                metadata_key: null,\n                metadata_value: ''\n              });\n            } else {\n              throw new Error(\"Server rejected delete request (Error \" + r.status + \")\");\n            }\n          });\n        }\n      } else {\n        throw new Error(\"invalid key value\");\n      }\n    } catch (e) {\n      alert(e.message);\n    }\n  }\n  onClear() {\n    this.changeMetadataValue(JSON.stringify({}, null, 2));\n  }\n  validateMetadataValue(text) {\n    console.log(\"validateMetadataValue(%s)...\", text);\n    if (text) {\n      text = text.trim();\n      var value = JSON.parse(text);\n      if (typeof value === \"object\") {\n        return value;\n      } else {\n        throw new Error(\"metadata value is not a JSON object\");\n      }\n    } else {\n      throw new Error(\"metadata value is null\");\n    }\n  }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MetadataEditor);\n\n//# sourceURL=webpack://pdjr-skplugin-metadata/./public_src/components/MetadataEditor.js?");

/***/ }),

/***/ "./public_src/components/PluginConfigurationPanel.js":
/*!***********************************************************!*\
  !*** ./public_src/components/PluginConfigurationPanel.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"webpack/sharing/consume/default/react/react?76b1\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var reactstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! reactstrap */ \"./node_modules/reactstrap/dist/reactstrap.es.js\");\n/* harmony import */ var _PluginConfigurator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PluginConfigurator */ \"./public_src/components/PluginConfigurator.js\");\n/* harmony import */ var _MetadataEditor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./MetadataEditor */ \"./public_src/components/MetadataEditor.js\");\n\n\n\n\n\n/**\n * props.configuration = the plugin configuration from Signal K.\n * props.save = Signal K callback function which saves configuration.\n */\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (props => {\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Card, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.CardHeader, null, \"Metadata Configuration\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.CardBody, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"div\", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"div\", {\n    style: {\n      float: 'left',\n      width: '44%'\n    }\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_PluginConfigurator__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n    configuration: props.configuration,\n    save: config => props.save(config)\n  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"div\", {\n    style: {\n      float: 'right',\n      width: '54%'\n    }\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_MetadataEditor__WEBPACK_IMPORTED_MODULE_3__[\"default\"], null)))));\n});\n\n//# sourceURL=webpack://pdjr-skplugin-metadata/./public_src/components/PluginConfigurationPanel.js?");

/***/ }),

/***/ "./public_src/components/PluginConfigurator.js":
/*!*****************************************************!*\
  !*** ./public_src/components/PluginConfigurator.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"webpack/sharing/consume/default/react/react?76b1\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var reactstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! reactstrap */ \"./node_modules/reactstrap/dist/reactstrap.es.js\");\n/* harmony import */ var _FormField__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./FormField */ \"./public_src/components/FormField.js\");\n\n\n\nclass PluginConfigurator extends (react__WEBPACK_IMPORTED_MODULE_0___default().Component) {\n  constructor(props) {\n    super(props);\n    this.state = {\n      resourcesProviderId: props.configuration.resourcesProviderId,\n      resourceType: props.configuration.resourceType,\n      startDelay: props.configuration.startDelay,\n      excludePaths: props.configuration.excludePaths,\n      persist: props.configuration.persist,\n      saveButtonDisabled: false,\n      cancelButtonDisabled: false,\n      composeButtonDisabled: false,\n      snapshotButtonDisabled: false\n    };\n    this.save = props.save;\n    this.onChangeResourcesProviderId = this.onChangeResourcesProviderId.bind(this);\n    this.onChangeResourceType = this.onChangeResourceType.bind(this);\n    this.onChangeStartDelay = this.onChangeStartDelay.bind(this);\n    this.onChangeExcludePaths = this.onChangeExcludePaths.bind(this);\n    this.onChangePersist = this.onChangePersist.bind(this);\n  }\n  render() {\n    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Form, {\n      className: \"square rounded border\",\n      style: {\n        padding: '5px'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, {\n      row: true,\n      style: {\n        height: '60px'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FormField__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      type: \"text\",\n      name: \"resources_provider_id\",\n      label: \"Resources provider id\",\n      value: this.state.resourcesProviderId,\n      text: \"\",\n      onChangeCallback: this.onChangeResourcesProviderId\n    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, {\n      row: true,\n      style: {\n        height: '300px'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FormField__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      type: \"text\",\n      name: \"resource_type\",\n      label: \"Metadata resource type\",\n      value: this.state.resourceType,\n      text: \"\",\n      onChangeCallback: this.onChangeResourceType\n    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FormField__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      type: \"text\",\n      name: \"start_delay\",\n      label: \"Start delay\",\n      value: this.state.startDelay,\n      text: \"\",\n      onChangeCallback: this.onChangeStartDelay\n    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FormField__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      type: \"text\",\n      name: \"exclude_paths\",\n      label: \"Exclude paths beginning with\",\n      value: this.state.excludePaths.join(', '),\n      text: \"\",\n      onChangeCallback: this.onChangeExcludePaths\n    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FormField__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      type: \"checkbox\",\n      fieldName: \"persist\",\n      label: \"Persist dynamic changes\",\n      value: this.state.persist,\n      text: \"\",\n      onChangeCallback: this.onChangePersist\n    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.FormGroup, {\n      row: true\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Col, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.ButtonToolbar, {\n      style: {\n        justifyContent: 'space-between'\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.ButtonToolbar, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      size: \"sm\",\n      color: \"primary\",\n      disabled: this.state.saveButtonDisabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onSubmit();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-save\"\n    }), \" Save \"), \"\\xA0\", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      size: \"sm\",\n      color: \"primary\",\n      disabled: this.state.cancelButtonDisabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onCancel();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-ban\"\n    }), \" Cancel \")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.ButtonToolbar, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      size: \"sm\",\n      color: \"danger\",\n      disabled: this.state.composeButtonDisabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onCompose();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-save\"\n    }), \" Compose \"), \"\\xA0\", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(reactstrap__WEBPACK_IMPORTED_MODULE_1__.Button, {\n      size: \"sm\",\n      color: \"danger\",\n      disabled: this.state.snapshotButtonDisabled,\n      onClick: e => {\n        e.preventDefault();\n        this.onSnapshot();\n      }\n    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"i\", {\n      className: \"fa fa-save\"\n    }), \" Snapshot \"))))));\n  }\n  restoreState() {\n    this.setState({\n      resourceType: this.props.configuration.resourceType,\n      startDelay: this.props.configuration.startDelay,\n      excludePaths: this.props.configuration.excludePaths.join(', '),\n      persist: this.props.configuration.persist\n    });\n  }\n  updateButtonStates() {\n    return;\n    var noChange = this.state.resourceType === this.props.configuration.resourceType && this.state.startDelay === this.props.configuration.startDelay && JSON.stringify(this.state.excludePaths.sort()) === JSON.stringify(this.props.configuration.excludePaths.sort()) && this.state.persist === this.props.configuration.persist;\n    this.setState({\n      saveButtonDisabled: noChange,\n      cancelButtonDisabled: noChange\n    });\n  }\n  onChangeResourcesProviderId(s) {\n    this.setState({\n      resourcesProviderId: s\n    });\n  }\n  onChangeResourceType(s) {\n    this.setState({\n      resourceType: s\n    });\n    this.updateButtonStates();\n  }\n  onChangeStartDelay(n) {\n    this.setState({\n      startDelay: n\n    });\n    this.updateButtonStates();\n  }\n  onChangeExcludePaths(s) {\n    this.setState({\n      excludePaths: s.split(/,/).map(v => v.trim()).sort()\n    });\n    this.updateButtonStates();\n  }\n  onChangePersist(b) {\n    this.setState({\n      persist: b\n    });\n    this.updateButtonStates();\n  }\n\n  /** BUTTON HANDLERS ************************************************/\n\n  onSubmit() {\n    this.save(Object.keys(this.props.configuration).reduce((a, k) => {\n      a[k] = this.state[k];\n      return a;\n    }, {}));\n  }\n  onCancel() {\n    this.save(this.props.configuration);\n  }\n\n  /**\n   * Trigger metadata composition by issuing a PUT request on the\n   * '/compose' path. When the composition is complete, restart the\n   * plugin by invalidating its configuration using onCancel().\n   */\n  onCompose() {\n    if (confirm(\"Compose will rebuild metadata from configuration files. New metadata entities may be created and existing metadata entities may be updated. Proceed?\")) {\n      fetch(\"/plugins/metadata/compose\", {\n        credentials: 'include',\n        method: 'PATCH'\n      }).then(r => {\n        switch (r.status) {\n          case 201:\n            /* TODO - make editor pane update */break;\n          case 500:\n            alert(\"Compose request failed (\" + r.status + \")\");\n            break;\n        }\n      });\n      this.onCancel();\n    }\n  }\n\n  /**\n   * Trigger metadata snapshot by issuing a PUT request on the\n   * '/snapshot' path. When the snapshot is complete, restart the\n   * plugin by invalidating its configuration using onCancel().\n   */\n  onSnapshot() {\n    if (confirm(\"Snaphot will capture live Signal K metadata into the current metadata resource. New metadata entities may be created and existing metadata entities may be updated. Proceed?\")) {\n      fetch(\"/plugins/metadata/snapshot\", {\n        credentials: 'include',\n        method: 'PATCH'\n      }).then(r => {\n        switch (r.status) {\n          case 201:\n            /* TODO - make editor pane update */break;\n          case 500:\n            alert(\"Snapshot request failed (\" + r.status + \")\");\n            break;\n        }\n      });\n      this.onCancel();\n    }\n  }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PluginConfigurator);\n\n//# sourceURL=webpack://pdjr-skplugin-metadata/./public_src/components/PluginConfigurator.js?");

/***/ }),

/***/ "./public_src/data/data.js":
/*!*********************************!*\
  !*** ./public_src/data/data.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   contentOptions: () => (/* binding */ contentOptions)\n/* harmony export */ });\nconst contentOptions = [{\n  label: \"Name properties\",\n  options: [{\n    label: \"Display name\",\n    value: {\n      displayName: \"\"\n    }\n  }, {\n    label: \"Long name\",\n    value: {\n      longName: \"\"\n    }\n  }, {\n    label: \"Short name\",\n    value: {\n      shortName: \"\"\n    }\n  }, {\n    label: \"All names\",\n    value: {\n      displayName: \"\",\n      longName: \"\",\n      shortName: \"\"\n    }\n  }]\n}, {\n  label: \"Alarm methods\",\n  options: [{\n    label: \"Alert method\",\n    value: {\n      alertMethod: [\"sound\", \"visual\"]\n    }\n  }, {\n    label: \"Warn method\",\n    value: {\n      warnMethod: [\"sound\", \"visual\"]\n    }\n  }, {\n    label: \"Alarm method\",\n    value: {\n      alarmMethod: [\"sound\", \"visual\"]\n    }\n  }, {\n    label: \"Emergency method\",\n    value: {\n      emergencyMethod: [\"sound\", \"visual\"]\n    }\n  }, {\n    label: \"All methods\",\n    value: {\n      alertMethod: [\"sound\", \"visual\"],\n      warnMethod: [\"sound\", \"visual\"],\n      alarmMethod: [\"sound\", \"visual\"],\n      emergencyMethod: [\"sound\", \"visual\"]\n    }\n  }]\n}, {\n  label: \"Zones\",\n  options: [{\n    label: \"Lower\",\n    value: {\n      zones: [{\n        lower: 0.5,\n        state: \"alert\",\n        message: \"Value above 50%\"\n      }]\n    }\n  }, {\n    label: \"Upper\",\n    value: {\n      zones: [{\n        upper: 0.5,\n        state: \"alert\",\n        message: \"Value below 50%\"\n      }]\n    }\n  }, {\n    label: \"Both\",\n    value: {\n      zones: [{\n        lower: 0.5,\n        state: \"alert\",\n        message: \"Value above 50%\"\n      }, {\n        upper: 0.5,\n        state: \"alert\",\n        message: \"Value below 50%\"\n      }]\n    }\n  }]\n}];\n\n//# sourceURL=webpack://pdjr-skplugin-metadata/./public_src/data/data.js?");

/***/ })

}]);