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

*Metadata* arrays can be presented to the plugin in two ways:

1. Through a __metadata__ property in the plugin configuration file.
   This provides a centralised, static, mechanism for initialising meta
   values.

2. Through __metadata__ values in the Signal K tree.
   The location of these values is defined by entries in the
   configuration file's __includepaths__ array.
   This allows plugins or apps in Signal K to supply meta data in a
   distributed, dynamic, way.

Meta data tends to be static in nature and pervasive in application and
plugins tend to be implemented so that they publish the meta data they
generate or maintain at the start of their execution.
This behaviour allows __pdjr-skplugin-meta-injector__ to synchronise
with dynamic providers of *metadata* by the simple expedient of waiting
for a little on startup to give providers time to publish their
*metadata* to their include path before making an attempt to consume it
for processing.
The duration of this startup delay is set by the value of the
__startdelay__ configuration property.

The startup delay strategy has the added advantage of not requiring
__pdjr-skplugin-meta-injector__ to register for delta updates - it can
simply read the published *metadata* from the tree and move on.

__pdjr-skplugin-meta-injector__ maintains a status notification at
"notifications.plugins.meta.status" which it updates when the
processing of dynamic *metadata* is complete with a notification value
in which
the message property is assigned the value "complete".
If all of the keys in __includepaths__ returned valid *metadata* then
the notification status property will be set to "normal"; any problems
and the status property will be set to "warn". 
    
## Format of a *metadata* array

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

## Supplying dynamic *metadata* to __pdjr-skplugin-meta-injector__

The **includepaths** configuration property introduces an array which
can be populated with Signal K keys referencing locations in the data
store from which *metadata* values can be retrieved.
For example:
``
[
  "notifications.plugins.switchbank.metadata",
  "notifications.plugins.devantech.metadata"
]
```
