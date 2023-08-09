/**
 * Copyright 2020 Paul Reeve <preeve@pdjr.eu>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const net = require('node:net');
const Log = require("./lib/signalk-liblog/Log.js");
const Delta = require("./lib/signalk-libdelta/Delta.js");

const PLUGIN_ID = "meta-injector";
const PLUGIN_NAME = "pdjr-skplugin-meta-injector";
const PLUGIN_DESCRIPTION = "Inject meta data into Signal K";
const PLUGIN_SCHEMA = {
  "definitions": {
    "key": {
      "type": "object",
      "properties": {
        "key": {
          "type": "string"
        }
      }
    },
    "genericMetadata": {
      "title": "Metadata for a value",
      "description": "Common meta properties for numeric data values",
      "type": "object",
      "properties": {
        "description": {
          "type": "string"
        },
        "units": {
          "type": "string"
        },
        "displayName": {
          "type": "string"
        },
        "longName": {
          "type": "string"
        },
        "shortName": {
          "type": "string"
        },
        "timeout": {
          "type": "number"
        },
        "displayScale": {
          "type": "object",
          "properties": {
            "lower": {
              "type": "number"
            },
            "upper": {
              "type": "number"
            },
            "type": {
              "type": "string"
            }
          }
        },
        "alertMethod": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "sound",
              "visual"
            ]
          }
        },
        "warnMethod": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "sound",
              "visual"
            ]
          }
        },
        "alarmMethod": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "sound",
              "visual"
            ]
          }
        },
        "emergencyMethod": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "sound",
              "visual"
            ]
          }
        },
        "zones": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "lower": {
                "type": "number"
              },
              "upper": {
                "type": "number"
              },
              "state": {
                "type": "string",
                "enum": [
                  "nominal",
                  "normal",
                  "alert",
                  "warn",
                  "alarm",
                  "emergency"
                ]
              },
              "message": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "specificMetadata": {
      "type": "object",
      "properties": {
        "displayFormat": {
          "type": "object",
          "properties": {
            "color": {
              "type": "string",
              "title": "Use this color for rendering data"
            },
            "factor": {
              "type": "number",
              "title": "Multiply all data values by this factor",
              "exclusiveMinimum": 0
            },
            "places": {
              "type": "number",
              "title": "Restrict data value to this many decimal places",
              "minimum": 0
            }
          }
        }
      }
    }
  },
  "type": "object",
  "properties": {
    "startDelay": {
      "description": "Start delay to allow resource provider initialisation",
      "title": "Start delay in seconds",
      "type": "number",
      "default": 4
    },
    "resourceType": {
      "description": "Name of the metadata resource type",
      "title": "Resource type",
      "type": "string",
      "default": "metadata"
    },
    "putSupport": {
      "description": "Scope of PUT support",
      "title": "PUT support",
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "enum": [ "none", "limited", "full" ]
      },
      "default": [ "limited" ]
    },
    "excludeFromInit": {
      "description": "Paths to exclude from metadata initialisation",
      "title": "Paths to exclude from metadata initialisation",
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": [ "design.", "network.", "notifications.", "plugins." ]
    },
    "excludeFromPut": {
      "description": "Paths to exclude from PUT support",
      "title": "Paths to exclude from PUT support",
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": [ "design.", "network.", "notifications.", "plugins." ]
    }
  },
  "required": [ ]
};
const PLUGIN_UISCHEMA = {};

module.exports = function (app) {
  var plugin = {};
  var initTimer;
  var putInterval;
  var pathsWithPutHandlers = [];

  plugin.id = PLUGIN_ID;
  plugin.name = PLUGIN_NAME;
  plugin.description = PLUGIN_DESCRIPTION;
  plugin.schema = PLUGIN_SCHEMA;
  plugin.uiSchema = PLUGIN_UISCHEMA;
  plugin.options = null;

  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.start = function(options) {
    
    options.startDelay = (options.startDeley || plugin.schema.properties.startDelay.default);
    options.resourceType = (options.resourceType || plugin.schema.properties.resourceType.default);
    options.putSupport = (options.putSupport || plugin.schema.properties.putSupport.default);
    options.excludeFromInit = (options.excludeFromInit || plugin.schema.properties.excludeFromInit.default);
    options.excludeFromPut = (options.excludeFromPut || plugin.schema.properties.excludeFromPut.default);
    plugin.options = options;

    initTimer = setTimeout(() => {
      try {
        initialiseMetadata(options.resourceType, options.excludeFromInit);

        switch (options.putSupport[0]) {
          case 'none':
            app.debug("skipping PUT handler installation because of configuration setting");
            break;
          case 'limited':
            app.debug("installing PUT handlers on meta paths initialised by resource provider");
            app.resourcesApi.listResources(options.resourceType, {}).then(metadata => {
              Object.keys(metadata)
              .filter(key => ((!key.endsWith(".")) && ((!options.excludeFromPut.reduce((a,ep) => (a || key.startsWith(ep)), false)))))
              .forEach(terminalKey => {
                var terminalMetaKey = terminalKey + ".meta";
                app.debug("installing put handler on '%s'", terminalMetaKey);
                app.registerActionHandler('vessels.self', terminalMetaKey, putHandler, plugin.id);
              });
            }).catch((e) => {
              app.debug("error recovering resource list");
            });
            break;
          case 'full':
            app.debug("installing PUT handlers on all meta paths");
            putInterval = setInterval(() => {
              app.streambundle.getAvailablePaths()
              .filter(path => ((!options.excludeFromPut.reduce((a,ep) => (a || path.startsWith(ep)), false))))
              .filter(path => (!pathsWithPutHandlers.includes(path)))
              .forEach(path => {
                app.debug("installing put handler on '%s'", path + ".meta");
                pathsWithPutHandlers.push(path);
                app.registerActionHandler('vessels.self', path + ".meta", putHandler, plugin.id);
              });
            }, 5000);
            break;
          default:
            log.E("configuration error: property 'putSupport' has an invalid value")
            break;
        }

      } catch(e) {
        log.E("unable to initialise metadata (%s)", e.message);
      }
    }, (options.startDelay * 1000));
  }
    

  plugin.stop = function() {
    clearTimeout(initTimer);
    clearInterval(putInterval);
  }

  function initialiseMetadata(resourceType, excludePaths) {
    app.resourcesApi.listResources(resourceType, {}).then(metadata => {
      var metadataKeys = Object.keys(metadata).sort();
      var terminalKeys = metadataKeys.filter(key => ((!key.endsWith(".")) && ((!excludePaths.reduce((a,ep) => (a || key.startsWith(ep)), false)))));
      if (terminalKeys.length > 0) {
        var delta = new Delta(app, plugin.id);
        terminalKeys.forEach(terminalKey => {
          var terminalMeta = {};
          metadataKeys.filter(k => terminalKey.startsWith(k)).forEach(k => { terminalMeta = { ...terminalMeta, ...metadata[k] }; });
          delete terminalMeta["$source"];
          if ((Object.keys(terminalMeta)).length > 0) {
            app.debug("injecting metadata for %s", terminalKey);
            delta.addMeta(terminalKey, terminalMeta);
          } else {
            app.debug("declining to inject empty metadata for %s", terminalKey);
          }
        });
        delta.commit().clear();
      }
    });
  }

  function installPutHandlers() {

  }

  /**
   * Update/create a metadata resource.
   * 
   * <path> must be a meta path for the resource to be updated. The
   * '.meta' path suffix will be stripped to yield a key suitable for
   * use with the metadata resource model.
   * 
   * <value> should be an object containing properties destined for the
   * resource specified by <path>. Properties in <value> will be merged
   * with any existing metadata resource for <path> and the resulting
   * object saved back into the metadata resource.
   * 
   * @param {*} context 
   * @param {*} path - the meta path whose data should be created/updated.
   * @param {*} value - a metadata object whose properties should update any existing metadata resource.
   * @param {*} callback 
   * @returns 
   */
  function putHandler(context, path, value, callback) {
    console.log("DDDDDDD");
    var matches;

    if ((matches = path.match(/^(.*)\.meta$/)) && (matches.length == 2)) {
      var resourceName = matches[1];
      var resourceValue;
      var delta = new Delta(app, plugin.id);

      if (Object.keys(value).length == 0) {
        delta.addMeta(resourceName, value).commit().clear();
        app.resourcesApi.deleteResource(plugin.options.resourceType, resourceName).then(() => {
          callback({ state: "COMPLETED", statusCode: 200 });
        }).catch((e) => {
          callback({ state: "COMPLETED", statusCode: 400, message: "resource delete failed" });
        });
      } else {
        app.resourcesApi.getResource(plugin.options.resourceType, resourceName).then(resourceValue => {
          resourceValue = { ...resourceValue, ...value };
          delta.addMeta(resourceName, resourceValue).commit().clear();
          app.resourcesApi.setResource(plugin.options.resourceType, "sss", resourceValue).then(result => {
            callback({ "state": "COMPLETED", "statusCode": 200, "message": "resource update successful" });
          }).catch((e) => {
            callback({ "state": "COMPLETED", "statusCode": 400, "message": "resource update failed" });
          });
        }).catch((e) => {
          resourceValue = value;
          //delta.addMeta(path, resourceValue).commit().clear();
          app.resourcesApi.setResource(plugin.options.resourceType, resourceName, resourceValue).then(result => {
            callback({ state: "COMPLETED", statusCode: 200, message: "resource creation successful" });
          }).catch((e) => {
            callback({ state: "COMPLETED", statusCode: 400, message: "resource creation failed" });
          });
        });
      }
      return({ state: "PENDING" });
    } else {
      return({ state: "COMPLETED", statusCode: 400, message: "invalid resource path" });
    }
  }

  return(plugin);
}
