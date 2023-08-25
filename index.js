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

const PLUGIN_ID = "metadata";
const PLUGIN_NAME = "pdjr-skplugin-metadata";
const PLUGIN_DESCRIPTION = "Initialise, maintain and preserve Signal K metadata.";
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
    "compose" : {
      "description": "Initialise metadata at next system restart",
      "title": "Initialise metadata",
      "type": Boolean,
      "default": false
    },
    "persist": {
      "description": "Persist updates to the resource provider",
      "title": "Persist updates",
      "type": "boolean",
      "default": false
    },
    "snapshot": {
      "description": "Name of the metadata snaphshot resource type",
      "title": "Snapshot resource type",
      "type": "string",
      "default": "metadata-snapshot"
    }
  },
  "required": [ ]
};
const PLUGIN_UISCHEMA = {};

const SNAPSHOT_STABILIZATION_COUNT = 3;

module.exports = function (app) {
  var plugin = {};
  var initTimer;
  var intervalTimer;

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
    options.compose = (options.compose || plugin.schema.properties.compose.default);
    options.snapshot = (options.snapshot || plugin.schema.properties.snapshot.default);
    options.persist = (options.persist || plugin.schema.properties.persist.default);

    if (createConfiguration) app.savePluginOptions(options, () => { app.debug("saved plugin options") });

    plugin.options = options;

    initTimer = setTimeout(() => {
      try {

        if (options.compose) composeMetadata(options.resourceType, options.excludePaths);

        if (options.persist) persistUpdates(options.resourceType, options.excludePaths);

        if (options.snapshot) takeSnapshotWhenSystemIsStable(options.resourceType, options.excludePaths);

        injectMetadata(options.resourceType, options.excludePaths);

      } catch(e) {
        log.E("internal error (%s)", e.message);
      }
    }, (options.startDelay * 1000));
  }

  plugin.stop = function() {
    clearTimeout(initTimer);
    clearInterval(intervalTimer);
  }

  /**
   * Create metadata files from metadata configuration files.
   * 
   * Metadata configuration files 
   * @param {*} resourceType 
   * @param {*} excludePaths 
   */
  function composeMetadata(resourceType, excludePaths) {
    app.debug("composing metadata in '%s'", resourceType);
    app.resourcesApi.listResources(resourceType, {}).then(metadata => {
      var initialisationKeys = Object.keys(metadata).filter(key => ((key.startsWith(".")) && (!excludePaths.reduce((a,ep) => (a || key.startsWith('.' + ep)), false)))).sort();
      var terminalInitialisationKeys = initialisationKeys.filter(key => (!key.endsWith('.')));
      terminalInitialisationKeys.forEach(terminalInitialisationKey => {
        var terminalKey = terminalInitialisationKey.slice(1);
        var terminalMeta = {};
        initialisationKeys.filter(k => (terminalInitialisationKey.startsWith(k))).forEach(k => { terminalMeta = { ...terminalMeta, ...metadata[k] }; });
        delete terminalMeta["$source"];
        delete terminalMeta["timestamp"];
        app.resourcesApi.setResource(resourceType, terminalKey, terminalMeta).then(() => {
          app.debug("saving metadata resource name '%s'", terminalKey);
        }).catch((e) => {
          app.debug("error saving metadata resource '%s' (%s)", terminalKey, e.message);
        });
      });
    }).catch((e) => {
      app.debug(e.message);
    });
  }

  function injectMetadata(resourceType, excludePaths) {
    app.debug("injecting metadata from '%s'", resourceType);
    app.resourcesApi.listResources(resourceType, {}).then(metadata => {
      var metadataKeys = Object.keys(metadata).filter(key => ((!key.startsWith('.')) && (!excludePaths.reduce((a,ep) => (a || key,startsWith(ep)), false)))).sort();
      if (metadataKeys.length) {
        var delta = new Delta(app, plugin.id);
        metadataKeys.forEach(key => {
          app.debug("injecting metadata for key '%s'", key);
          delta.addMeta(key, metadata[key]);
        });
        delta.commit().clear();
      }
    }).catch(() => {
      app.debug(e.message);
    });
  }

  /**
   * Save any delta updates to metadata that are targetted at paths
   * that are not deselected by excludePaths into resourceType.
   * 
   * @param {*} resourceType 
   * @param {*} excludePaths 
   */
  function persistUpdates(resourceType, excludePaths) {
    app.debug("registering delta input handler");
    app.registerDeltaInputHandler((delta, next) => {
      delta.updates.forEach(update => {
        if (update.meta) {
          update.meta.forEach(meta => {
            if (!excludePaths.reduce((a,p) => (a || meta.path.startsWith(p)), false)) {
              app.debug("persisting a delta update on '%s' to '%s'", meta.path, resourceType);
              app.resourcesApi.setResource(resourceType, meta.path, meta.value).then(() => {
                app.debug("updated resource '%s'", meta.path);
              }).catch((e) => {
                app.debug("error saving resource '%s'", meta.path);
              });
            }
          });
        }
      });
      next(delta);
    });
  }

  /**
   * Wait until the number of available paths on the server that are
   * not excluded by excludePaths is stable and then save all
   * associated metadata to resourceType.
   *  
   * @param {*} resourceType - the resource type where harvested metadata should be saved. 
   * @param {*} excludePaths - paths / path prefixes that should never be saved.
   */
  function takeSnapshotWhenSystemIsStable(resourceType, excludePaths) {
    var availablePathCounts = [];
    intervalTimer = setInterval(() => {
      app.debug("waiting to take snapshot when system is stable...");
      availablePathCounts.push(getAvailablePaths(excludePaths).length);
      if (availablePathCounts.length > SNAPSHOT_STABILIZATION_COUNT) availablePathCounts.shift();
      if ((availablePathCounts.length == SNAPSHOT_STABILIZATION_COUNT) && (availablePathCounts.reduce((a,v) => ((a == 0)?0:((a == v)?v:0)), availablePathCounts[0]))) {
        takeSnapshot(resourceType, excludePaths);
        plugin.options.takeSnapshot = false;
        app.savePluginOptions(plugin.options, () => { app.debug("disabling snapshot trigger")});
        clearInterval(intervalTimer);
      }
    }, 5000);

    function takeSnapshot(resourceType, excludePaths) {
      app.debug("taking snapshot into resource '%s'", resourceType);
      var availablePaths = getAvailablePaths(excludePaths);

      app.resourcesApi.listResources(resourceType, {}).then(metadata => {
        availablePaths.forEach(availablePath => {
          var availablePathMetaValue = (app.getSelfPath(availablePath + ".meta") || {});
          var repositoryMetaValue = (metadata[availablePath] || {});
          var compositeMetaValue = { ...repositoryMetaValue, ...availablePathMetaValue };
          app.debug("saving metadata for '%s' to '%s'", availablePath, resourceType);
          app.resourcesApi.setResource(resourceType, availablePath, compositeMetaValue).then(() => {
            app.debug("saved resource '%s'", availablePath);
          }).catch((e) => {
            app.debug("error saving resource '%s' (%s)", availablePath, e.message);
          });
        });
      }).catch((e) => {
        app.debug("error loading resource list from '%s'", resourceType);
      });
    }

    function getAvailablePaths(excludePaths) {
      return((app.streambundle.getAvailablePaths() || []).filter(path => (!excludePaths.reduce((a,p) => (path.startsWith(p) || a), false))));
    }
 
  }

  return(plugin);
}
