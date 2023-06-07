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
    "fifo": {
      "description": "Pathname of a FIFO on which the plugin should listen for metadata",
      "title": "FIFO pathname",
      "type": "string",
      "default": "/tmp/meta-injector"
    },
    "metadata": {
      "description": "Array of metadata objects",
      "title": "Metadata",
      "type": "array",
      "items": {
        "allOf": [
          { "$ref": "#/definitions/genericMetadata" },
          { "$ref": "#/definitions/specificMetadata" }
        ],
        "properties": {
          "key": { "type": "string" }
        }
      }
    }
  },
  "required": [ ],
  "default": {
    "fifo": "/tmp/meta-injector",
    "metadata": [ ]  
  }
};
const PLUGIN_UISCHEMA = {};

module.exports = function (app) {
  var plugin = {};
  var unsubscribes = [];

  plugin.id = PLUGIN_ID;
  plugin.name = PLUGIN_NAME;
  plugin.description = PLUGIN_DESCRIPTION;
  plugin.schema = PLUGIN_SCHEMA;
  plugin.uiSchema = PLUGIN_UISCHEMA;

  const delta = new Delta(app, plugin.id);
  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.start = function(options) {

    if (Object.keys(options).length === 0) {
      options = plugin.schema.default;
      log.W("using default configuration");
    }

    if (((options.fifo) && (options.fifo.trim() != "")) || ((options.metadata) && (Array.isArray(options.metadata)) && (options.metadata.length > 0))) {
  
      var metaKeyCount = 0;
  
      // Inject meta values derived from any 'metadata' property.
      if (options.metadata) {
        options.metadata.forEach(meta => {
          if ((meta.key) && (!meta.key.endsWith("."))) {
            delta.addMeta(meta.key, getMetaForKey(meta.key, options.metadata));
          }
        });
        metaKeyCount += delta.count();
        delta.commit().clear();
      }

      if (options.fifo) {

        try {
         
          const server = net.createServer((client) => {

            app.debug("client connection open");

            client.on('data', (data) => {
              app.debug("receiving data from client...");
              try {
                var metadata = JSON.parse(data.toString());
                if (Array.isArray(metadata)) {
                  var delta = new Delta(app, plugin.id);
                  metadata.forEach(meta => {
                    if ((meta.key) && (!meta.key.endsWith("."))) {
                      delta.addMeta(meta.key, getMetaForKey(meta.key, metadata));
                    }
                  });
                  metaKeyCount += delta.count();
                  delta.commit().clear();
                  delete delta;
                } else {
                  throw new Error("metadata value is not an array");
                }
              } catch(e) {
                log.E("error parsing FIFO data (%s)", e.message);
              }
            });

            client.on('end', () => {
              log.N("started: listening on '%s' (loaded meta data for %d keys)", options.fifo, metaKeyCount);
              app.debug("client connection closed");
            });

            client.on('error', (e) => {
              app.debug("client connection error (%s)", e.message);
            });

          });
          
          fs.unlinkSync(options.fifo);
          server.listen(options.fifo, () => {
            log.N("started: listening on '%s' (loaded meta data for %d keys)", options.fifo, metaKeyCount);
          });

        } catch(e) {
          app.debug("error %s", e.message);
        }
      } else {
        log.N("stopped: loaded meta data for %d keys", options.fifo, metaKeyCount);
      }
    } else {
      log.N("stopped: nothing configured");
    }
  }

  plugin.stop = function() {
    unsubscribes.forEach(f => f());
    var unsubscribes = [];
  }

  /********************************************************************
   * Return a meta object for <key> by consolidating selected entries
   * in <metadata>.
   */

  function getMetaForKey(key, metadata) {
    var retval = {};
    var copy = metadata.filter(meta => ((meta.key == undefined) || key.startsWith(meta.key)));
    copy.sort((a,b) => { if (a.key == undefined) a.key = "AAA"; if (b.key == undefined) b.key = "AAA"; return((a.key < b.key)?-1:((a.key > b.key)?1:0)); });
    copy.forEach(meta => {
      Object.keys(meta).filter(k => (k != "key")).forEach(k => { retval[k] = meta[k]; });
    });
    return(retval);
  }

  return(plugin);
}
