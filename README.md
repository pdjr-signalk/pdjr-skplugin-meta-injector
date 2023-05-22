# pdjr-skplugin-meta-injector

Inject meta data into Signal K.

__pdjr-skplugin-meta-injector__ provides a service for populating
the Signal K data store with meta data describing the data values
stored therein.

The design of the plugin acknowledges the Signal K specification
discussions on 
[Metadata](https://github.com/SignalK/specification/blob/master/gitbook-docs/data_model_metadata.md).

The plugin allows meta data for any keys to be specified in its
configuration file and also provides an optional meta injection service
on a Unix FIFO that can be used by any peer process.
 
## Operating principle

__pdjr-skplugin-meta-injector__ accepts meta data in the form of a
*metadata* array (see below).
Each entry in the metadata array consists of a full or partial key
and associated meta data.
The plugin consolidates meta data for each full key entry and writes
it into the Signal K tree as a "meta" entry under each full key.

The plugin configuration file can include a single "metadata" array
property which will be processed immediately that the plugin is
started.

Immediately after processing any configuration file metadata, the
plugin begins listening on a Unix FIFO path defined by the
configuration file "fifo" property.

A peer process, usually, but not necessarily, another Signal K
plugin can write a metadata array as JSON text to the FIFO for
injection into the Signal K tree at any time.

### Format of a *metadata* array

A *metadata* array is simply a collection of objects containing
properties which will become the properties of one or more derived
meta values.

Each object should normally contain a **key** property which serves
to identify the scope of application of its peer properties and which
never itself becomes part of a meta value.
If the **key** property is not specified then object properties will
be included in all issued meta objects (it is hard to see how this
'feature' might be of any use). 

The **key** property is slightly magical: it supplies either a
terminal path to which peer properties should be applied, or a
partial path (terminating in a period ('.')) which indicates that
peer properties should be incorporated in the meta values applied
to all subordinate terminal paths.

The following metadata example explicitly generates meta data for
two switch state values:
```
[
  {
    key: "electrical.switches.bank.0.1.state",
    description: "Binary switch state (0 = OFF, 1 = ON)",
    displayName: "Anchor light relay"
  },
  {
    key: "electrical.switches.bank.0.2.state",
    description: "Binary switch state (0 = OFF, 1 = ON)",
    displayName: "Steaming light relay"
  }
]
```
And this does the same thing a little more elegantly:
```
[
  {
    key: "electrical.switches.",
    description: "Binary switch state (0 = OFF, 1 = ON)",
  },
  {
    key: "electrical.switches.bank.0.1.state",
    displayName: "Anchor light relay"
  }
  {
    key: "electrical.switches.bank.0.2.state",
    displayName: "Steaming light relay"
  }
]
```

## Reference configuration
```
{
  "enabled": true,
  "enableLogging": false,
  "enableDebug": false,
  "configuration": {
    "fifo": "/tmp/meta-injector",
    "metadata": [
      {
        "key": "tanks.",
        "description": "Current tank level 0 - 100%",
        "units": "ratio",
        "timeout": 60,
        "alertMethod": [ "visual" ],
        "warnMethod": [ "visual" ],
        "alarmMethod": [ "sound", "visual" ],
        "emergencyMethod": [ "sound", "visual" ]
      },
      {
        "key": "tanks.wasteWater.0.currentLevel",
        "displayFormat": { "color": "#00FFFF", "factor": 1000, "places": 0 },
        "displayName": "Tank 0 (Waste)",
        "longName": "Tank 0 (Waste)",
        "shortName": "Tank 0",
        "zones": [
          {
            "lower": 0.70,
            "state": "warn",
            "message": "Tank 0 (Waste) level approaching automatic pump-out threshold"
          },
          {
            "lower": 0.80,
            "state": "alert",
            "message": "Tank 0 (Waste) level approaching capacity"
          },
          {
            "lower": 0.90,
            "state": "alarm",
            "message": "Tank 0 (Waste) overflow imminent"
          }
        ]
      }
    ]
  }
}
```
