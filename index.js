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
    "excludePaths": {
      "description": "Paths to exclude from metadata processing",
      "title": "Paths to exclude from metadata processing",
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": [ "design.", "network.", "notifications.", "plugins." ]
    },
    "persistUpdates": {
      "description": "Persist updates to the resource provider",
      "title": "Persist updates",
      "type": "boolean",
      "default": false
    },
    "snapshotResourceType": {
      "description": "Name of the metadata snaphshot resource type",
      "title": "Snapshot resource type",
      "type": "string",
      "default": "metadata-snapshot"
    },
    "takeSnapshot": {
      "title": "Take snaphot",
      "type": "boolean",
      "default": false
    }
  },
  "required": [ ]
};
const PLUGIN_UISCHEMA = {};

const SNAPSHOT_STABILIZATION_COUNT = 3;

module.exports = function (app) {
  var plugin = {};
  var initTimer;

  plugin.id = PLUGIN_ID;
  plugin.name = PLUGIN_NAME;
  plugin.description = PLUGIN_DESCRIPTION;
  plugin.schema = PLUGIN_SCHEMA;
  plugin.uiSchema = PLUGIN_UISCHEMA;
  plugin.options = null;

  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.start = function(options) { 
    var createConfiguration = (Object.keys(options).length == 0);
    
    options.startDelay = (options.startDeley || plugin.schema.properties.startDelay.default);
    options.resourceType = (options.resourceType || plugin.schema.properties.resourceType.default);
    options.excludePaths = (options.excludePaths || plugin.schema.properties.excludePaths.default);
    options.snapshotResourceType = (options.resourceType || plugin.schema.properties.snapshotResourceType.default);
    options.takeSnapshot = (options.takeSnapshot || plugin.schema.properties.takeSnapshot.default);
    options.persistUpdates = (options.persistUpdates || plugin.schema.properties.persistUpdates.default);

    if (createConfiguration) app.savePluginOptions(options, () => { app.debug("saved plugin options") });

    plugin.options = options;

    initTimer = setTimeout(() => {
      try {

        initialiseMetadata(options.resourceType, options.excludePaths);

        if (options.persistUpdates) persistUpdates(options.resourceType, options.excludePaths);

        if (options.takeSnapshot) takeSnapshotWhenSystemIsStable(options.snapshotResourceType, options.excludePaths);

      } catch(e) {
        log.E("internal error (%s)", e.message);
      }
    }, (options.startDelay * 1000));
  }

  plugin.stop = function() {
    clearTimeout(initTimer);
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
        log.N("initialised %d keys from '%s' resource", delta.count(), resourceType);
        delta.commit().clear();
      }
    }).catch(() => {
      log.E("cannot contact resource provider");
    });
  }

  function persistUpdates(resourceType, excludePaths) {
    app.registerDeltaInputHandler((delta, next) => {
      delta.updates.forEach(update => {
        update.values.forEach(value => {
          var matches;
          if ((matches = value.path.match(/(.*)\.meta/)) && (matches.length == 2)) {
            if (excludePaths.reduce((a,p) => (a || matches[1].startsWith(p)), false)) {
              app.resourcesApi.setResource(resourceType, matches[1], value.value).then(() => {
                app.debug("updated resource '%s'", matches[1]);
              }).catch((e) => {
                app.debug("error saving resource '%s'", matches[1]);
              });
            }
          }
        });
      });
      next(delta);
    });
  }

  /**
   * Wait until the number of available paths on the server stabilises
   * and then save all available metadata to resourceType.
   *  
   * @param {*} resourceType 
   * @param {*} excludePaths 
   */
  function takeSnapshotWhenSystemIsStable(resourceType, excludePaths) {
    var availablePathCounts = [];
    app.on('serverevent', (e) => {
      if (options.takeSnapshot) {
        if ((e.type) && (e.type == "SERVERSTATISTICS") && (e.data.numberOfAvailablePaths)) {
          availablePathCounts.push(getAvailablePaths(excludePaths).length);
          if (availablePathCounts.length > SNAPSHOT_STABILIZATION_COUNT) availablePathCounts.shift();
          if ((availablePathCounts.length == SNAPSHOT_STABILIZATION_COUNT) && (availablePathCounts.reduce((a,v) => ((a == 0)?0:((a == v)?v:0)), availablePathCounts[0]))) {
            takeSnapshot(resourceType, excludePaths);
            options.takeSnapshot = false;
            savePluginOptions(options, () => { app.debug("saving config with takeSnapshot disabled")});
          }
        }
      }
    });

    function takeSnapshot(resourceType, excludePaths) {
      var snapshotPaths = getAvailablePaths(excludePaths);
      snapshotPaths.forEach(path => {
        var metaPath = (path + ".meta");
        var metaValue = app.getSelfPath(metaPath);
        if ((metavalue) && (Object.keys(metavalue).count > 0)) {
          app.resourcesApi.setResource(resourceType, metaPath, metaValue).then(() => {
            app.debug("saved resource '%s'", metaPath);
          }).catch((e) => {
            app.debug("error saving resource '%s'", metaPath);
          });
        }
      });
    }

    function getAvailablePaths(excludePaths) {
      return((app.streambundle.getAvailablePaths() || []).filter(path => (excludePaths.reduce((a,p) => (path.startsWith(p) || a), false))));
    }
 
  }

  return(plugin);
}
