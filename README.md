# pdjr-skplugin-meta-injector

Inject meta data into Signal K.

__pdjr-skplugin-meta-injector__ provides a centralised mechanism for
populating the Signal K data store with meta data describing the data
values stored therein.

The design of the plugin acknowledges the Signal K specification
discussions on 
[Metadata](https://github.com/SignalK/specification/blob/master/gitbook-docs/data_model_metadata.md).

The plugin supports centralised (static) and, distributed (dynamic)
update mechanisms.
 
## Operating principle

__pdjr-skplugin-meta-injector__ accepts meta data in the form of one or
more *metadata* arrays and processes this data into meta values which
are injected into the Signal K tree alongside the data values which
they describe.

*Metadata* arrays can be presented to the plugin through either a
__metadata__ property defined in the plugin configuration file or
as values of some arbitrary key or keys defined in the cnfiguration
file's __includepaths__ array.

After a server start, __pdjr-skplugin-meta-injector__ delays scanning
any defined __includepaths__ for a user-defined time period set by the
configuration file's __startdelay__ property.
This delay gives those applications which proved values for the
__includepaths__ keys an opportunity to generate the *metadata* objects
that the plugin will consume.

Once all the __includepaths__ *metadata* has been processed, the plugin
issues a notification on
'notifications.plugins.pdjr-skplugin-meta-injector.status' 
to indicate that it has completed its task.

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
terminal path to which ts peer properties should be applied, or a
partial path (terminating in a period ('.')) which indicates that
its peer properties should be incorporated in the meta values applied
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
    "startdelay": 10000,
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
          { "lower": 0.70, "state": "warn", "message": "Tank 0 (Waste) level approaching automatic pump-out threshold" },
          { "lower": 0.80, "state": "alert", "message": "Tank 0 (Waste) level approaching capacity" },
          { "lower": 0.90, "state": "alarm", "message": "Tank 0 (Waste) overflow imminent" }
        ]
      }
    ],
    "includepaths": [
      "notifications.plugins.pdjr-skplugin-switchbank.metadata",
      "notifications.plugins.pdjr-skplugin-devantech.metadata"
    ]
  }
}
```
