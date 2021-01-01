# signalk-meta

Inject meta data into Signal K.

__signalk-meta__ provides a centralised mechanism for populating the
Signal K data store with meta data describing the data values stored
therein.

The Signal K specification
[discusses meta data in some depth](https://github.com/SignalK/specification/blob/master/gitbook-docs/data_model_metadata.md).

## Specifying meta values

__signalk-meta__ takes one or more *metadata* arrays as input and
processes these into meta values which it injects into the Signal K
data store.

A *metadata* array is simply a collection of objects containing
properties which will become the properties of one or more derived
meta values.

The one property which breaks this rule is the **key** property
which serves to identify the scope of application of its peer
properties and which never itself becomes part of a meta value.

The **key** property is slightly magical: it supplies either a
terminal path to which ts peer properties should be applied, or a
partial path (terminating in a period ('.')) which indicates that
its peer properties should be incorporated in the meta values applied
to subordinate terminal paths.

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

## Supplying metadata to __signalk-meta__

metadata arrays can be supplied to __signalk-meta__ in two ways.

The plugin configuration file can explicitly define a metadata array
though its **metadata** property allowing the user to specify a
'central database' of meta values.

Additionally or alternatively, the plugin configuration can specify
zero or more keys which reference metadata values as items in its
**includepaths** array property.
This 'distributed database' option allows, a peer process (most likely
another plugin) to generate and update metadata arrays that can be
dynamically consumed by __signalk-meta__.

