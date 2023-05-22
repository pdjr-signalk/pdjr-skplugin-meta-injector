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

const bacon = require('baconjs');
const fs = require('fs');
const net = require('net');
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
  }
};
const PLUGIN_UISCHEMA = {};
const PLUGIN_NOTIFICATION_KEY = "notifications.plugins." + PLUGIN_ID + ".notification";

const OPTIONS_DEFAULT = {
  "fifo": "/tmp/meta-injector",
  "metadata": [ ]
};

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
      options = OPTIONS_DEFAULT;
      app.savePluginOptions(options, () => { log.N("installing default configuration", false); });
    }

    var totalKeyCount = 0;

    // Inject meta values derived from any metadata entry in options.
    if ((options.metadata) && (Array.isArray(options.metadata))) {
      options.metadata.forEach(meta => {
        if ((meta.key) && (!meta.key.endsWith("."))) {
          delta.addMeta(meta.key, getMetaForKey(meta.key, options.metadata));
        }
      });
      log.N("injecting meta data from plugin configuration (%d keys)", delta.count());
      totalKeyCount += delta.count();
      delta.commit().clear();
    }

    if ((options.fifo) && (options.fifo != "")) {
      if (fs.existsSync(options.fifo)) fs.unlinkSync(options.fifo);
      var serverSocket = net.createServer();
      serverSocket.listen(options.fifo, () => { log.N("listening on FIFO socket '%s'", options.fifo); });
      serverSocket.on('connection', (s) => {
        s.on('data', (data) => {
          var metadata = JSON.parse(data);
          var delta = new Delta(app, plugin.id);
          metadata.forEach(meta => {
            if ((meta.key) && (!meta.key.endsWith("."))) {
              delta.addMeta(meta.key, getMetaForKey(meta.key, metadata));
            }
          });
          log.N("injecting meta data received over FIFO (%d keys)", delta.count());
          totalKeyCount += delta.count();
          delta.commit().clear();
        });
	s.on('end', () => {
          s.destroy();
        });
      });
    }
    (new Delta(app, plugin.id)).addValue(PLUGIN_NOTIFICATION_KEY, { "message": "complete", "state": "normal", "method": [] }).commit().clear();
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
