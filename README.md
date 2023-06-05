# pdjr-skplugin-meta-injector

Inject meta data into Signal K.

## Background

I have some general-purpose displays which draw their configuration
(data type, units, display name, etc.) from Signal K meta data and
I therefore needed some way to inject appropriate meta data into
Signal K...

## Description

__pdjr-skplugin-meta-injector__ provides a mechanism for injecting
meta data into the Signal K data store.
The design of the plugin acknowledges the Signal K specification
discussions on 
[Metadata](https://github.com/SignalK/specification/blob/master/gitbook-docs/data_model_metadata.md).

The plugin accepts meta data in the form of a *metadata* array each
entry of which consists of a full or partial key and associated meta
data properties.
The characteristics of *metadata* are discussed below.

The plugin allows meta data to be specified in its configuration file
and also provides an optional meta data injection service on a Unix
FIFO.

## Configuration

The plugin includes the following embedded default configuration.
```
{
  "fifo": "/tmp/meta-injector",
  "metadata": [
  ]
}
```

The plugin configuration has the following properties.

| Property | Default.             | Description |
| :------- | :------------------- | :---------- |
| fifo     | '/tmp/meta-injector' | Optional string property specifying a file name on which the plugin should listen for *metadata*. |
| metadata | []                   | Optional array property specifying a *metadata* array. |

The plugin will attempt to open the filename specified by any 'fifo'
property value as a Unix FIFO which will accept a *metadata* array as a
JSON data stream.

The 'metadata' array property can be used to specify a *metadata* array
as part of the plugin configuration.

### Format of a *metadata* array

A *metadata* array is simply a collection of objects containing
properties which will become the properties of one or more derived
meta values.

Each object should normally contain a **key** property which serves to
identify the scope of application of its fellow properties but which
never itself becomes part of a meta value.
If the **key** property is not specified then properties defined in
the object will be included in all issued meta objects (it is hard to
see how this 'feature' might be of any use).

The **key** property is slightly magical: it supplies either a
terminal path to which peer properties should be applied, or a
partial path (terminating in a period ('.')) which indicates that
thr specified peer properties should be incorporated in the meta
values applied to all subordinate terminal paths

The following metadata example explicitly generates meta data for
two switch state values:
```
[
  {
    "key": "electrical.switches.bank.0.1.state",
    "description": "Binary switch state (0 = OFF, 1 = ON)",
    "displayName": "Anchor light relay"
  },
  {
    "key": "elecrical.switches.bank.0.2.state",
    "description": "Binary switch state (0 = OFF, 1 = ON)",
    "displayName": "Steaming light relay"
  }
]
```
And this does the same thing a little more elegantly:
```
[
  {
    "key": "electrical.switches.",
    "description": "Binary switch state (0 = OFF, 1 = ON)",
  },
  {
    "key": "electrical.switches.bank.0.1.state",
    "displayName": "Anchor light relay"
  }
  {
    "key": "electrical.switches.bank.0.2.state",
    "displayName": "Steaming light relay"
  }
]
```

## Operation

On startup, the plugin immediately processes any 'metadata' array
property defined in its configuration file.

Subsequently, if the configuration file includes a 'fifo' property
specifying a file name, then the plugin begins listening on the
specified FIFO path for JSON encoded *metadata* arrays which may
supplied by a peer process.

The data received over FIFO is subject to very little validation,
so take care if you choose to use this feature.

## Author

Paul Reeve <*preeve_at_pdjr_dot_eu*>
