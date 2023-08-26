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
      "description": "Take a snapshot of system metadata to the resource provider",
      "title": "Take snapshot",
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
  var intervalTimer;

  plugin.id = PLUGIN_ID;
  plugin.name = PLUGIN_NAME;
  plugin.description = PLUGIN_DESCRIPTION;
  plugin.schema = PLUGIN_SCHEMA;
  plugin.uiSchema = PLUGIN_UISCHEMA;
  plugin.options = null;

  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.start = function(options, restartPlugin) { 
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

    if (options.compose === true) {
      app.debug("composing metadata in resourse type '%s'", options.resourceType);
      composeMetadata(options.resourceType, options.excludePaths);
      plugin.options.compose = false;
      app.savePluginOptions(plugin.options, () => {
        app.debug("setting 'compose' configuration property to false");
        app.debug("restarting plugin");
        restartPlugin();
      });  
    } else if (options.snapshot === true) {
      app.debug("taking snapshot into resource type '%s'", options.resourceType);
      takeSnapshotWhenSystemIsStable(options.resourceType, options.excludePaths);
      plugin.options.snapshot = false;
      app.savePluginOptions(plugin.options, () => {
        app.debug("setting 'snapshot' configuration property to false");
        app.debug("restarting plugin");
        restartPlugin();
      });
    } else {

      app.resourcesApi.listResources(options.resourceType, {}).then(metadata => {
        log.N("connected to '%s' resource", options.resourceType);
  
        var metadataKeys = Object.keys(metadata).filter(key => ((!key.startsWith('.')) && (!options.excludePaths.reduce((a,ep) => (a || key,startsWith(ep)), false)))).sort();
        if (metadataKeys.length > 0) {
          var delta = new Delta(app, plugin.id);
          metadataKeys.forEach(key => {
            app.debug("setting metadata for key '%s'", key);
            delta.addMeta(key, metadata[key]);
          });
          delta.commit().clear();
        }

        if (options.persist) {
          app.debug("installing metadata delta update handler");
          persistUpdates(options.resourceType, options.excludePaths);
        }
      }).catch(() => {
        log.E("cannot connect to '%s' resource".options.resoureType);
        app.debug(e.message);
      });

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
    app.resourcesApi.listResources(resourceType, {}).then(metadata => {
      var initialisationKeys = Object.keys(metadata).filter(key => ((key.length > 0) && (key.startsWith(".")) && (!excludePaths.reduce((a,ep) => (a || key.startsWith('.' + ep)), false)))).sort();
      var terminalInitialisationKeys = initialisationKeys.filter(key => (!key.endsWith('.')));
      terminalInitialisationKeys.forEach(terminalInitialisationKey => {
        var terminalKey = terminalInitialisationKey.slice(1);
        var terminalMeta = {};
        initialisationKeys.filter(k => (terminalInitialisationKey.startsWith(k))).forEach(k => { terminalMeta = { ...terminalMeta, ...metadata[k] }; });
        delete terminalMeta["$source"];
        delete terminalMeta["timestamp"];
        app.resourcesApi.setResource(resourceType, terminalKey, terminalMeta).then(() => {
          app.debug("compose: saved metadata resource '%s' to resource type '%s'", terminalKey, resourceType);
        }).catch((e) => {
          app.debug("compose: error saving resource '%s' to resource type '%s' (%s)", terminalKey, resourceType, e.message);
        });
      });
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
    app.registerDeltaInputHandler((delta, next) => {
      delta.updates.forEach(update => {
        if (update.meta) {
          update.meta.forEach(meta => {
            if (!excludePaths.reduce((a,p) => (a || meta.path.startsWith(p)), false)) {
              app.resourcesApi.setResource(resourceType, meta.path, meta.value).then(() => {
                app.debug("persist: saving delta update on resource '%s' to resource type '%s'", meta.path, resourceType);
              }).catch((e) => {
                app.debug("persist: error saving resource '%s' to resource type '%s'", meta.path, resourceType);
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
   * not excluded by excludePaths is stable and then merge metadata
   * from all active paths with any available value in the resource
   * repository. Properties from the active path will overwrite
   * corresponding properties in the resource.
   *  
   * @param {*} resourceType - the resource type where harvested metadata should be saved. 
   * @param {*} excludePaths - paths / path prefixes that should never be saved.
   */
  function takeSnapshotWhenSystemIsStable(resourceType, excludePaths) {
    var availablePathCounts = [];
    intervalTimer = setInterval(() => {
      app.debug("snapshot: waiting to take snapshot when system is stable...");
      availablePathCounts.push(getAvailablePaths(excludePaths).length);
      if (availablePathCounts.length > SNAPSHOT_STABILIZATION_COUNT) availablePathCounts.shift();
      if ((availablePathCounts.length == SNAPSHOT_STABILIZATION_COUNT) && (availablePathCounts.reduce((a,v) => ((a == 0)?0:((a == v)?v:0)), availablePathCounts[0]))) {
        takeSnapshot(resourceType, excludePaths);
        clearInterval(intervalTimer);
      }
    }, 5000);

    function takeSnapshot(resourceType, excludePaths) {
      app.debug("snapshot: taking snapshot into resource type '%s'", resourceType);
      var availablePaths = getAvailablePaths(excludePaths);

      app.resourcesApi.listResources(resourceType, {}).then(metadata => {
        availablePaths.filter(path => (path.length > 0)).forEach(availablePath => {
          var liveMetaValue = (app.getSelfPath(availablePath + ".meta") || {});
          var repositoryMetaValue = (metadata[availablePath] || {});
          var compositeMetaValue = { ...repositoryMetaValue, ...liveMetaValue };
          app.debug("snapshot: saving resource '%s' to resource type '%s' (%s)", availablePath, resourceType, compositeMetaValue);
          app.resourcesApi.setResource(resourceType, availablePath, compositeMetaValue).then(() => {
            app.debug("snapshot: saved resource '%s' to resource type '%s'", availablePath, resourceType);
          }).catch((e) => {
            app.debug("snapshot: error saving resource '%s' to reosurce type '%s' (%s)", availablePath, resourceType, e.message);
          });
        });
      }).catch((e) => {
        app.debug("snapshot: error loading resource list from resource type '%s' (%s)", resourceType, e.message);
      });
    }

    function getAvailablePaths(excludePaths) {
      return((app.streambundle.getAvailablePaths() || []).filter(path => (!excludePaths.reduce((a,p) => (path.startsWith(p) || a), false))));
    }
 
  }

  return(plugin);
}
