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
    "persist": {
      "description": "Persist updates to the resource provider",
      "title": "Persist updates",
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

  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.start = function(options, restartPlugin) {

    // Make a plugin.options object by merging options with defaults.
    // Having it at plugin level makes it globally available.
    plugin.options = {};
    plugin.options.startDelay = (options.startDelay || plugin.schema.properties.startDelay.default);
    plugin.options.resourceType = (options.resourceType || plugin.schema.properties.resourceType.default);
    plugin.options.excludePaths = (options.excludePaths || plugin.schema.properties.excludePaths.default);
    plugin.options.persist = (options.persist || plugin.schema.properties.persist.default);

    app.savePluginOptions(plugin.options, () => {

      // This timer delay is necessary because the resources-provider
      // doesn't return a Promise during initialisation. Maybe it can
      // be eliminated if this bug is fixed. 
      initTimer = setTimeout(() => {
        log.N("connected to '%s' resource type", plugin.options.resourceType);

        app.resourcesApi.listResources(plugin.options.resourceType, {}).then(metadata => {
  
          var metadataKeys = Object.keys(metadata)
          .filter(key => (key.trim().length > 0)).sort()
          .filter(key => ((!key.startsWith('.')) && (!plugin.options.excludePaths.reduce((a,ep) => (a || key.startsWith(ep)), false))));
          if (metadataKeys.length > 0) {
            var delta = new Delta(app, plugin.id);
            metadataKeys.forEach(key => {
              app.debug("setting metadata for key '%s' (%s)", key, metadata[key]);
              delta.addMeta(key, metadata[key]);
            });
            delta.commit().clear();
          }

          if (plugin.options.persist) {
            app.debug("installing metadata delta update handler");
            persistUpdates(plugin.options.resourceType, plugin.options.excludePaths);
          }

	  composeMetadata(plugin.options.resourceType, plugin.options.excludePaths, (e) => {
		console.log(e.message);
	  });

        }).catch((e) => {
          log.E("cannot connect to '%s' resource (%s)", plugin.options.resourceType, e.message);            app.debug(e.message);
        });
      }, (plugin.options.startDelay * 1000));
    });
  };

  plugin.stop = function() {
    clearTimeout(initTimer);
    clearInterval(intervalTimer);
  }

  plugin.registerWithRouter = function(router) {
    router.get('/keys/', expressGetKeys);
    router.get('/keys/:key', expressGetKeysKey);
    router.get('/paths/', expressGetPaths);
    router.get('/paths/:key', expressGetPaths/Key);
    router.put('/keys/:key', expressPutKeysKey);
    router.put('/compose', expressPutCompose);
    router.put('/snapshot', expressPutSnapshot);
  }

  plugin.getOpenApi = function() { require("./openApi"); }

  /**
   * Create metadata files from metadata configuration files.
   * 
   * Metadata configuration files 
   * @param {*} resourceType 
   * @param {*} excludePaths 
   */
  function composeMetadata(resourceType, excludePaths, callback) {
    app.resourcesApi.listResources(resourceType, {}).then(metadata => {
      var initialisationKeys = Object.keys(metadata).filter(key => ((key.length > 0) && (key.startsWith(".")) && (!excludePaths.reduce((a,ep) => (a || key.startsWith('.' + ep)), false)))).sort();
      var terminalInitialisationKeys = initialisationKeys.filter(key => (!key.endsWith('.')));
      composeTerminalKeys(resourceType, terminalInitialisationKeys, initialisationKeys, metadata, callback);
    }).catch((e) => {
      callback(e);
    })

    function composeTerminalKeys(resourceType, terminalInitialisationKeys, initialisationKeys, metadata, callback) {
      if (terminalInitialisationKeys.length == 0) {
        callback();
      } else {
        var terminalInitialisationKey = terminalInitialisationKeys.shift();
        var terminalKey = terminalInitialisationKey.slice(1);
        var terminalMeta = {};
        initialisationKeys.filter(k => (terminalInitialisationKey.startsWith(k))).forEach(k => { terminalMeta = { ...terminalMeta, ...metadata[k] }; });
        delete terminalMeta["$source"];
        delete terminalMeta["timestamp"];
        app.resourcesApi.setResource(resourceType, terminalKey, terminalMeta).then(() => {
          app.debug("compose: saved metadata resource '%s' to resource type '%s'", terminalKey, resourceType);
          composeTerminalKeys(resourceType, terminalInitialisationKeys, initialisationKeys, metadata, callback);
        }).catch((e) => {
          callback(e);
        });
      }
    }
      
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
  function takeSnapshotWhenSystemIsStable(resourceType, excludePaths, callback) {
    var availablePathCounts = [];
    intervalTimer = setInterval(() => {
      app.debug("snapshot: waiting until system is stable...");
      availablePathCounts.push(getActivePaths().length);
      if (availablePathCounts.length > SNAPSHOT_STABILIZATION_COUNT) availablePathCounts.shift();
      if ((availablePathCounts.length == SNAPSHOT_STABILIZATION_COUNT) && (availablePathCounts.reduce((a,v) => ((a == 0)?0:((a == v)?v:0)), availablePathCounts[0]))) {
        takeSnapshot(resourceType, excludePaths, callback);
        clearInterval(intervalTimer);
      }
    }, 5000);

    function takeSnapshot(resourceType, excludePaths, callback) {
      app.debug("snapshot: taking snapshot into resource type '%s'", resourceType);

      app.resourcesApi.listResources(resourceType, {}).then(metadata => {
        var availablePaths = getAvailablePaths(excludePaths).filter(path => (path.length > 0));
        takeSnapshotOfKey(resourceType, availablePaths, metadata, callback);
      }).catch((e) => {
        callback(e);
      });
        
      function takeSnapshotOfKey(resourceType, availablePaths, metadata, callback) {
        if (availablePaths.length == 0) {
          callback();
        } else {
          var availablePath = availablePaths.shift();
          var liveMetaValue = (app.getSelfPath(availablePath + ".meta") || {});
          var repositoryMetaValue = (metadata[availablePath] || {});
          var compositeMetaValue = { ...repositoryMetaValue, ...liveMetaValue };
          app.debug("snapshot: saving resource '%s' to resource type '%s' (%s)", availablePath, resourceType, compositeMetaValue);
          delete compositeMetaValue["$source"];
          delete compositeMetaValue["timestamp"];
          app.resourcesApi.setResource(resourceType, availablePath, compositeMetaValue).then(() => {
            app.debug("snapshot: saved resource '%s' to resource type '%s'", availablePath, resourceType);
            takeSnapshotOfKey(resourceType, availablePaths, metadata, callback);
          }).catch((e) => {
            callback(e);
          });
        };
      }
    }
  }

  /********************************************************************
   * Express handlers...
   */
  
  /**
   * Handler for GET /metadata/keys. Returns a list of metadata keys.
   */
  expressGetKeys = function(req,res) {
    getKeys((keys) => {
      if (keys !== null) {
        res.status(200).send({ "req": req.originalUrl, "keys": keys });
      } else {
        res.status(500).send({ "req": req.originalUrl, "keys": [] });
      }
    });

    function getKeys(callback) {
      app.resourcesApi.listResources(plugin.options.resourceType, {}).then(metadata => {
        callback(Object.keys(metadata).filter(key => key.length > 0).filter(key => (!plugin.options.excludePaths.reduce((a,ep) => (a || key.startsWith(ep)), false))).sort());
      }).catch((e) => {
        callback(null);
      })
    }
  }

  /**
   * Handler for GET /metadata/keys/key. Return the metadata value for
   * a single key.
   */
  expressGetKeysKey = function(req,res) {
    getKeysKey(req.params.key, (metadata) => {
      if (metadata !== null) {
        // Status 200. Success.
        res.status(200).send({ "req": req.originalUrl, "key": req.params.key, "value": metadata });
      } else {
        // Status 404. Key does not exist.
        res.status(404).send({ "req": req.originalUrl, "key": req.params.key, "value": {} });
      }
    })

    function getKeysKey(key, callback) {
      app.resourcesApi.getResource(plugin.options.resourceType, key).then(metadata => {
        callback(metadata);
      }).catch((e) => {
        callback(null);
      })
    }
  }

  /**
   * Handler for GET /metadata/paths. Return a list of Signal K paths
   * that have associated metadata.
   */
  expressGetPaths = function(req,res) {
    try {
      var keys = app.streambundle.getAvailablePaths();
      if (keys !== null) {
        res.status(200).send({ "req": req.originalUrl, "keys": keys.filter(path => (path.trim().length > 0)).filter(path => (!plugin.options.excludePaths.reduce((a,p) => (path.startsWith(p) || a), false))) });
      } else {
        throw new Error("error getting available paths");
      }
    } catch(e) {
      res.status(500).send({ "req": req.originalUrl, "keys": [] });
    }
  }

  /**
   * Handler for GET /paths/key. Return the metadata value for a
   * Signal K key.
   */
  expressGetPathsKey = function(req,res) {
    try {
      var metadata = app.getSelfPath(req.params.key + ".meta")
      if (metadata !== null) {
        res.status(200).send({ "req": req.originalUrl, "key": req.params.key, "value": metadata });
      } else {
        throw new Error("error getting metadata for key");
      }
    } catch(e) {
      res.status(404).send({ "req": req.originalUrl, "key": req.params.key, "value": {} });
    };
  }

  /**
   * Handler for PUT /keys/key. Set the metadata value for a single
   * key.
   */
  expressPutKeysKey = function(req,res) {
    var metadata = req.body;
    app.debug("processing PUT request to update %s (%s)", req.params.key, JSON.stringify(req.body));

    if (Object.keys(metadata).length == 0) {
      app.resourcesApi.deleteResource(plugin.options.resourceType, req.params.key).then(() => {
        res.sendStatus(200);
      }).catch((e) => {
        res.sendStatus(500);
      });
    } else {
      app.resourcesApi.setResource(plugin.options.resourceType, req.params.key, metadata).then(() => {
        res.sendStatus(201);
      }).catch((e) => {
        res.sendStatus(500);
      });
    }
  }

  /**
   * Handler for PUT /compose.
   */
  expressPutCompose = function(req,res) {
    app.debug("processing PUT request for compose");

    composeMetadata(plugin.options.resourceType, plugin.options.excludePaths, (e) => {
      res.sendStatus((e)?500:201);
    });
  }

  /**
   * Handler for PUT /snapshot.
   */
  expressPutSnapshot = function(req,res) {
    app.debug("processing PUT request for snapshot");

    takeSnapshotWhenSystemIsStable(plugin.options.resourceType, plugin.options.excludePaths, (e) => {
      res.sendStatus((e)?500:201);
    });
  }

  return(plugin);
}
