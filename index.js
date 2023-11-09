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

const _ = require('lodash');
const Log = require('signalk-liblog/Log.js');
const Delta = require('signalk-libdelta/Delta.js');

const PLUGIN_ID = 'metadata';
const PLUGIN_NAME = 'pdjr-skplugin-metadata';
const PLUGIN_DESCRIPTION = 'Initialise, maintain and preserve Signal K metadata.';
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
    "resourcesProviderId": {
      "title": "Resources provider id",
      "description": "Id of the resources provider to be used by the plugin",
      "type": "string",
      "default": "resources-provider"
    },
    "resourceType": {
      "title": "Metadata resource type",
      "description": "Name of the resource type used to persist metadata",
      "type": "string",
      "default": "metadata"
    },
    "startDelay": {
      "title": "Start delay",
      "description": "Defer plugin start by this many seconds allow resource provider to initialise",
      "type": "number",
      "default": 4
    },
    "excludePaths": {
      "title": "Exclude paths",
      "description": "Paths or path prefixes that should be ignored by the alarm manager",
      "type": "array",
      "items": { "type": "string" },
      "default": [ "design.", "network.", "notifications.", "plugins." ]
    },
    "persist": {
      "title": "Persist updates",
      "description": "Whether or not to persist updates to the resource provider",
      "type": "boolean",
      "default": false
    }
  },
  "required": [ ]
};
const PLUGIN_UISCHEMA = {};

const SNAPSHOT_STABILIZATION_COUNT = 3;

const FETCH_RESPONSES = {
  200: "OK",
  201: "Created",
  207: "Multi-Status",
  400: "Bad Request",
  404: "Not Found",
  503: "Service Unavailable (try again later)",
  500: "Internal Server Error"
};

module.exports = function (app) {
  var plugin = {};
  var initTimer;
  var intervalTimer;
  var RESOURCE_BUSY = false;

  plugin.id = PLUGIN_ID;
  plugin.name = PLUGIN_NAME;
  plugin.description = PLUGIN_DESCRIPTION;
  plugin.schema = PLUGIN_SCHEMA;
  plugin.uiSchema = PLUGIN_UISCHEMA;

  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.start = function(options, restartPlugin) {

    // Make a plugin.options object by merging options with defaults.
    // Having options available at plugin level makes them globally
    // available within the app.
    plugin.options = {};
    plugin.options.resourcesProviderId = (options.resourcesProviderId || plugin.schema.properties.resourcesProviderId.default);
    plugin.options.startDelay = (options.startDelay || plugin.schema.properties.startDelay.default);
    plugin.options.resourceType = (options.resourceType || plugin.schema.properties.resourceType.default);
    plugin.options.excludePaths = (options.excludePaths || plugin.schema.properties.excludePaths.default);
    plugin.options.persist = (options.persist || plugin.schema.properties.persist.default);
    app.savePluginOptions(plugin.options, () => {});

    // This timer delay is necessary because the resources-provider
    // doesn't return a Promise during initialisation. Maybe it can
    // be eliminated if this bug is fixed. 
    initTimer = setTimeout(() => {
      log.N("connected to '%s' resource type", plugin.options.resourceType);
      app.resourcesApi.listResources(plugin.options.resourceType, {}, plugin.options.resourcesProviderId).then(metadata => {
        injectMetadata(metadata);
        if (plugin.options.persist) {
          app.debug("installing metadata delta update handler");
          installPersistHandler(plugin.options.resourceType, plugin.options.excludePaths);
        }
      }).catch((e) => {
        log.E("unable to retrieve resource list for resource '%s' (%s)", plugin.options.resourceType, e.message);
      });
    }, (plugin.options.startDelay * 1000));
  }

  plugin.stop = function() {
    clearTimeout(initTimer);
    clearInterval(intervalTimer);
  }

  plugin.registerWithRouter = function(router) {
    router.get('/metadata', (req,res) => handleExpress(req, res, expressGetMetadata));
    router.put('/metadata', (req,res) => handleExpress(req, res, expressPutMetadata));
    router.get('/metadata/:key', (req,res) => handleExpress(req, res, expressGetMetadatum));
    router.put('/metadata/:key', (req,res) => handleExpress(req, res, expressPutMetadatum))
    router.delete('/metadata/:key', (req,res) => handleExpress(req, res, expressDeleteMetadatum));
    router.patch('/update', (req,res) => handleExpress(req, res, expressUpdate));
  }

  plugin.getOpenApi = () => require('./resources/openApi.json'); 

  function injectMetadata(metadata) {
    var metadataKeys = Object.keys(metadata).filter(key => isValidKey(key)).filter(key => (!key.startsWith('.'))).sort();
    if (metadataKeys.length > 0) {
      var delta = new Delta(app, plugin.id);
      metadataKeys.forEach(key => {
        metadata[key]['$source'] = `plugin:${plugin.id}`;
        app.debug("setting metadata for key '%s' (%s)", key, metadata[key]);
        delta.addMeta(key, metadata[key]);
      });
      delta.commit().clear();
    }
  }
  
  /**
   * Create metadata files from metadata configuration files.
   * 
   * Metadata configuration files 
   * @param {*} resourceType 
   * @param {*} excludePaths 
   */
  function composeMetadata(resourceType, excludePaths, callback) {
    app.debug("compose: updating metadata in resource type '%s'", resourceType);
    app.resourcesApi.listResources(resourceType, {}, plugin.options.resourcesProviderId).then(metadata => {
      var initialisationKeys = Object.keys(metadata).filter(key => ((key.length > 0) && (key.startsWith(".")) && (!excludePaths.reduce((a,ep) => (a || key.startsWith('.' + ep)), false)))).sort();
      var terminalInitialisationKeys = initialisationKeys.filter(key => (!key.endsWith('.')));
      composeTerminalKeys(resourceType, terminalInitialisationKeys, initialisationKeys, metadata, undefined, (e) => {
        if (e === undefined) {
          app.debug("compose: completed successfully");
        } else {
          app.debug("compose: failed (last error '%s'", e.message);
        }
        callback(e);
      });
    }).catch((e) => {
      callback(e);
    })

    function composeTerminalKeys(resourceType, terminalInitialisationKeys, initialisationKeys, metadata, lasterror, callback) {
      if (terminalInitialisationKeys.length === 0) {
        callback(lasterror);
      } else {
        var terminalInitialisationKey = terminalInitialisationKeys.shift();
        var terminalKey = terminalInitialisationKey.slice(1);
        var terminalMeta = {};
        initialisationKeys.filter(k => (terminalInitialisationKey.startsWith(k))).forEach(k => { terminalMeta = { ...terminalMeta, ...metadata[k] }; });
        delete terminalMeta["$source"];
        delete terminalMeta["timestamp"];
        app.resourcesApi.setResource(resourceType, terminalKey, terminalMeta, plugin.options.resourcesProviderId).then(() => {
          ;
        }).catch((e) => {
          lasterror = new Error("cannot save metadata to resource key '" + terminalKey + "'");
        });
        composeTerminalKeys(resourceType, terminalInitialisationKeys, initialisationKeys, metadata, lasterror, callback);
      }
    }   
  }

  /**
   * Register a delta update handler that will persist changes to
   * metadata handled by the plugin.
   * 
   * @param {*} resourceType 
   * @param {*} excludePaths 
   */
  function installPersistHandler(resourceType, excludePaths) {
    app.registerDeltaInputHandler((delta, next) => {
      delta.updates.forEach(update => {
        if (update.meta) {
          update.meta.forEach(meta => {
            if (isValidKey(meta.path)) {
              app.resourcesApi.setResource(resourceType, meta.path, meta.value, plugin.options.resourcesProviderId).then(() => {
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
      availablePathCounts.push(activeKeys(app.streambundle.getAvailablePaths()).length);
      if (availablePathCounts.length > SNAPSHOT_STABILIZATION_COUNT) availablePathCounts.shift();
      if ((availablePathCounts.length == SNAPSHOT_STABILIZATION_COUNT) && (availablePathCounts.reduce((a,v) => ((a == 0)?0:((a == v)?v:0)), availablePathCounts[0]))) {
        takeSnapshot(resourceType, excludePaths, callback);
        clearInterval(intervalTimer);
      }
    }, 5000);
  }

  function activeKeys(keys) {
    return((keys || []).filter(k=>((k.length > 0) && (!plugin.options.excludePaths.reduce((a,ep) => (a || k.startsWith(ep)), false)))).sort());
  }

  function takeSnapshot(resourceType, excludePaths, callback) {
    app.debug("snapshot: updating metadata in resource type '%s'", resourceType);

    app.resourcesApi.listResources(resourceType, {}, plugin.options.resourcesProviderId).then(metadata => {
      var availablePaths = activeKeys(app.streambundle.getAvailablePaths());
      takeSnapshotOfKey(resourceType, availablePaths, metadata, undefined, (e) => {
        if (e === undefined) {
          app.debug("snapshot: completed successfully");
        } else {
          app.debug("snapshot: failed (last error '%s')", e.message);
        }
        callback(e);        
      });
    }).catch((e) => {
      callback(e);
    });
        
    function takeSnapshotOfKey(resourceType, availablePaths, metadata, lasterror, callback) {
      if (availablePaths.length == 0) {
        callback(lasterror);
      } else {
        var availablePath = availablePaths.shift();
        var liveMetaValue = (app.getSelfPath(availablePath + ".meta") || {});
        var repositoryMetaValue = (metadata[availablePath] || {});
        var compositeMetaValue = { ...repositoryMetaValue, ...liveMetaValue };
        delete compositeMetaValue["$source"];
        delete compositeMetaValue["timestamp"];
        app.resourcesApi.setResource(resourceType, availablePath, compositeMetaValue, plugin.options.resourcesProviderId).then(() => {
          ;
        }).catch((e) => {
          lasterror = new Error("cannot save metadata to resource key '" + availablePath + "'");
        });
        takeSnapshotOfKey(resourceType, availablePaths, metadata, lasterror, callback);
      };
    }
  }

  /********************************************************************
   * Express handlers...
   */

  handleExpress = function(req, res, handler) {
    app.debug(`processing ${req.method} request on '${req.path}`);
    handler(req, res);
  }
  
  expressGetMetadata = function(req, res) {
    app.resourcesApi.listResources(plugin.options.resourceType, {}, plugin.options.resourcesProviderId).then((metadata) => {
      var result = (Object.keys(metadata).sort() || []).reduce((a,key) => {
        if (isValidKey(key)) a[key] = metadata[key];
        return(a);
      }, {});
      expressSend(res, 200, result, req.path);
    }).catch((e) => {
      expressSend(res, 500, null, req.path);
    })
  }

  expressPutMetadata = function(req, res) {
    if (!RESOURCE_BUSY) {
      RESOURCE_BUSY = true;
      if (_.isObject(req.body)) {
        var keys = Object.keys(req.body);
        _putMetadata(keys, req.body, (e) => {
          res.location(req.baseUrl + req.path);
          RESOURCE_BUSY = expressSend(res, (e)?400:200, null, req.path);
        });
      } else {
        expresSend(res, 403, null, req.path);
      }
    } else {
      expressSend(res, 503, null, req.path);
    }
  }

  _putMetadata = function(keys, metadata, callback) {
    if (keys.length === 0) {
      callback();
    } else {
      var key = keys.shift();
      console.log(`>>> saving ${key}`);
      app.resourcesApi.setResource(plugin.options.resourceType, key, metadata[key], plugin.options.resourcesProviderId).then(() => {
        _putMetadata(keys, metadata, callback);
      }).catch((e) => {
        console.log(e);
        callback(e);
      });
    }
  }

  expressGetMetadatum = function(req, res) {
    if (isValidKey(req.params.key)) {
      app.resourcesApi.getResource(plugin.options.resourceType, req.params.key, plugin.options.resourcesProviderId).then(metadata => {
        expressSend(res, 200, metadata, req.path);
      }).catch((e) => {
        expressSend(res, 404, null, req.path);
      })
    } else {
      expressSend(res, 400, null, req.path);
    }
  }

  expressPutMetadatum = function(req, res) {
    if (!RESOURCE_BUSY) {
      RESOURCE_BUSY = true;
      if ((isValidKey(req.params.key)) && (_.isObject(req.body))) {
        app.resourcesApi.setResource(plugin.options.resourceType, req.params.key, req.body, plugin.options.resourcesProviderId).then(() => {
          res.location(req.baseUrl + req.path);
          RESOURCE_BUSY = expressSend(res, 200, null, req.path);
        }).catch((e) => {
          RESOURCE_BUSY = expressSend(res, 404, null, req.path);
        });
      } else {
        RESOURCE_BUSY = expressSend(res, 400, null, req.path);
      }
    } else {
      expressSend(res, 503, null, req.path);
    }
  }

  expressDeleteMetadatum = function(req, res) {
    if (!RESOURCE_BUSY) {
      RESOURCE_BUSY = true;
      if (isValidKey(req.params.key)) {
        app.resourcesApi.deleteResource(plugin.options.resourceType, req.params.key, plugin.options.resourcesProviderId).then(() => {
          RESOURCE_BUSY = expressSend(res, 200, null, req.path);
        }).catch((e) => {
          RESOURCE_BUSY = expressSend(res, 500, null, req.path);
        });
      } else {
        RESOURCE_BUSY = expressSend(res, 400, null, req.path);
      }
    } else {
      expressSend(res, 503, null, req.path);
    }
  }

  expressUpdate = function(req,res) {
    if (!RESOURCE_BUSY) {
      RESOURCE_BUSY = true;
      composeMetadata(plugin.options.resourceType, plugin.options.excludePaths, (e) => {
        if (e === undefined) {
          RESOURCE_BUSY = expressSend(res, 200, null, req.path);
        } else {
          RESOURCE_BUSY = expressSend(res, 500, null, req.path);
        }
      });
    } else {
      expressSend(res, 503, null, req.path);
    }
  }

  expressSend = function(res, code, body = null, debugPrefix = null) {
    res.status(code).send((body)?body:((FETCH_RESPONSES[code])?FETCH_RESPONSES[code]:null));
    if (debugPrefix) app.debug("%s: %d %s", debugPrefix, code, ((body)?JSON.stringify(body):((FETCH_RESPONSES[code])?FETCH_RESPONSES[code]:null)));
    return(false);
  }

  isValidKey = function(key) {
    return((key) && (key.trim().length > 0) && (!plugin.options.excludePaths.reduce((a,ep) => (a || (key.startsWith('.')?key.slice(1):key).startsWith(ep)), false)));
  }

  return(plugin);
}
