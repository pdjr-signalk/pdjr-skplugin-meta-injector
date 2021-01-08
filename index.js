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
const Log = require("./lib/signalk-liblog/Log.js");
const Schema = require("./lib/signalk-libschema/Schema.js");
const Delta = require("./lib/signalk-libdelta/Delta.js");

const PLUGIN_ID = "pdjr-skplugin-meta-injector";
const PLUGIN_SCHEMA_FILE = __dirname + "/schema.json";
const PLUGIN_UISCHEMA_FILE = __dirname + "/uischema.json";
const PLUGIN_NOTIFICATION_KEY = "notifications.plugins." + PLUGIN_ID + ".notification";

module.exports = function (app) {
  var plugin = {};
  var unsubscribes = [];

  plugin.id = PLUGIN_ID;
  plugin.name = 'Meta data injector';
  plugin.description = 'Inject meta data into Signal K';

  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.schema = function() {
    var schema = Schema.createSchema(PLUGIN_SCHEMA_FILE);
    return(schema.getSchema());
  };

  plugin.uiSchema = function() {
    var schema = Schema.createSchema(PLUGIN_UISCHEMA_FILE);
    return(schema.getSchema());
  }

  plugin.start = function(options) {

    // Inject meta values derived from any metadata entry in options.
    if (options.metadata) {
      var delta = new Delta(app, plugin.id);
      options.metadata.forEach(meta => {
        if ((meta.key) && (!meta.key.endsWith("."))) {
          delta.addMeta(meta.key, getMetaForKey(meta.key, options.metadata));
        }
      });
      log.N("injecting meta data from plugin configuration (%d keys)", delta.count());
      delta.commit().clear();
    }

    // If we are expecting remote metadata, then give producers time to
    // generate it.
    if (options.includepaths) {
      bacon.later(options.startdelay || 10000, 1).onValue(v => {
        options.includepaths.forEach(path => {
          var metadata = app.getSelfPath(path + ".value");
          if (metadata) {
            var delta = new Delta(app, plugin.id);
            metadata.forEach(meta => {
              if ((meta.key) && (!meta.key.endsWith("."))) {
                delta.addMeta(meta.key, getMetaForKey(meta.key, metadata));
              }
            });
            log.N("injecting meta data from '%s' (%d keys)", path, delta.count());
            delta.commit().clear();
          }
        });
        // Issue a notification to indicate that the plugin has finished.
        log.N("notifying end of service interval");
        (new Delta(app, plugin.id)).addValue(PLUGIN_NOTIFICATION_KEY, { "message": "complete", "state": "normal", "method": [] }).commit().clear();
      });
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
