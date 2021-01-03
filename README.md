# signalk-meta

Inject meta data into Signal K.

__signalk-meta__ provides a centralised mechanism for populating the
Signal K data store with meta data describing the data values stored
therein.

The design of the plugin axknowledges
[this discussion](https://github.com/SignalK/specification/blob/master/gitbook-docs/data_model_metadata.md).
in the
[Signal K Specification](https://github.com/SignalK/specification).

The plugin supports centralised (static) and, distributed (dynamic)
update mechanisms.

The style of operation of __signalk-meta__ satisfies the operational
requirements of
[signalk-alarm](https://github.com/preeve9534/signalk-alarm).
 
## Operating principle

__signalk-meta__ accepts meta data in the form of one or more
*metadata* arrays and processes this data into meta values which are
injected into the Signal K tree alongside the data values which they
describe.

*Metadata* arrays can be presented to the plugin in two ways:

1. Through a __metadata__ property in the plugin configuration file.
   This provides a centralised, static, mechanism for initialising meta
   values.

2. Through values in the Signal K tree.
   This allows plugins or apps in Signal K to supply meta data in a
   distributed, dynamic, way.

Meta data tends to be static in nature and pervasive in application and
plugins will tend to be implemented so that they output meta data at
the start of their execution and this raises the possibility of
*metdata* being issued by a plugin before __signalk-meta__ has itself
begun execution.
Not least because meta data plays a critical role in Signal K's alarm
system it is important that this type of data loss be avoided.

To ameliorate these issues __signalk-meta__ maintains the notion of a
*startup delay* - a period after plugin execution during which
processing of distributed *metadata* is deferred, giving peers who
generate meta data the opportunity to place uch data in the Signal K
tree before __signalk-meta__ looks to consume it.

__signalk-meta__ maintains a status notification at
"notifications.plugins.meta.status".
A notification with the message property value "complete" is issued
after distributed *metadata* processing terminates.
    
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
