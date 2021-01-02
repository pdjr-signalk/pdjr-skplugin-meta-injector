# signalk-meta

Inject meta data into Signal K.

__signalk-meta__ provides a centralised mechanism for populating the
Signal K data store with meta data describing the data values stored
therein.

The Signal K specification
[discusses meta data in some depth](https://github.com/SignalK/specification/blob/master/gitbook-docs/data_model_metadata.md).

The plugin supports centralised, distributed, static and dynamic
update mechanisms and integrates with the centralised alarm system
implemented by
[signalk-alarm](https://github.com/preeve9534/signalk-alarm).
 
## Operating principle

__signalk-meta__ accepts meta data in the form of one or more
*metadata* arrays and processes this into meta values which are
injected into the Signal K tree alongside the data values which
they describe.

*Metadata* arrays can be presented to the plugin in two ways:

1. Through a __metadata__ property in the plugin configuration file.
   This provides a centralised, static, mechanism for initialising meta
   values.

2. Through values in the Signal K tree.
   This allows plugins or apps in Signal K to supply meta data in a
   distributed, dynamic, way.

Since meta data tends to be static in nature plugins will tend to be
implemented so that they output meta data at the start of their
execution and this raises the possibility of *metdata*  being issued by
a plugin before __signalk-meta__ has itself begun execution.
Further, meta data in Signal K is an integral part of the system's
support for alarm management and alarm handling systems may need to
have confidence that meta data is in place before they attempt to
initialise. 

To ameliorate these issues __signalk-meta__ maintains the notion of a
*service interval* - a period in which the plugin will accept
*metadata* and at the end of which the plugin can signal that meta data
is placed and alarm system operation can commence.

__signalk-meta__ maintains a status notification at
"notifications.plugins.meta.status": the message
property of this value is set to "ready" at the start of its
*service interval* and to "complete" at the end of this period.
The duration of *service interval* is defined in the plugin
configuration.
    
## Format of a *metadata* array

A *metadata* array is simply a collection of objects containing
properties which will become the properties of one or more derived
meta values.
Each object must additionally contain a **key** property which serves
to identify the scope of application of its peer properties and which
never itself becomes part of a meta value.

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

## Supplying dynamic *metadata* to __signalk-meta__

The **includepaths** configuration property introduces an array which
can be populated with Signal K keys referencing a location in the data
store which should be monitored for the appearance of *metadata*
values.
For example:
``
[
  "notifications.plugins.switchbank.metadata",
  "notifications.plugins.devantech.metadata"
]
```
