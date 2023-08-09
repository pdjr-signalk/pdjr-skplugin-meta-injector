# pdjr-skplugin-meta-injector

Inject meta data into Signal K.

## Description

Signal K's default approach to metadata initialisation leverages the
general-purpose defaults mechanism which processes delta updates
from the initialisation file ```baseDeltas.json```.
As a way of initialising metadata across multiple keys this approach
rapidly becomes unwieldy and verbose.

__pdjr-skplugin-meta-injector__ provides an alternative approach for
metadata initialisation which is based on the idea of multiple metadata
containers which are part of a custom resource type served by the
system resource provider.
For a file system backed resource provider, each container will be a
JSON text file located in the resource folder associated with the
metadata resource type, but a database backed resource provider might
persist metadata containers as records in database.

The remainder of this document assumes a file system backed provision
and in this scheme the meta initialisation data consists of a folder
of text files where each file contains either the metadata for a single
key or some metadata properties that should applied to all keys below
some point in the Signal K path hierarchy.

By way of illustration, my ship has five fluid storage tanks: a waste
tank, two fresh water tanks and two fuel tanks.
I want to support a common annunciation strategy across all tanks,
and common, but different, alert zones for the different fluid types.

My metadata resource folder contains the following files.

<table>
<tr>
<td>tanks.</td>
<td><pre>
{
  "timeout": 60,
  "warnMethod": [
    "visual"
  ],
  "alertMethod": [
    "visual"
  ],
  "alarmMethod": [
    "sound",
    "visual"
  ],
  "emergencyMethod": [
    "sound",
    "visual"
  ]
}
</pre></td>
</tr>
</table>
```
```tanks.wasteWater.```
```tanks.fuel.```
```tanks.freshWater.```
```tanks.wasteWater.0.currentLevel```
```tanks.freshWater.1.currentLevel```
```tanks.freshWater.2.currentLevel```
```tanks.fuel.3.currentLevel```
```tanks.fuel.4.currentLevel```



The plugin also supports a PUT-based meta-data editing scheme which
can be used to manage objects in the repository or to create new
repository content.
I use this in one of my webapp configuration pages to allow a user
to graphically update the alarm zone settings associated with fluid
tanks.
See "Using the PUT interface" below for more detail.

The design of the plugin acknowledges the Signal K specification
discussions on 
[Metadata](https://github.com/SignalK/specification/blob/master/gitbook-docs/data_model_metadata.md).

### Tank metadata example

I supply metaddata for my tanks using two text files that are served by
the built-in Signal K resources provider.
The resources provider is configured to support the custom 'metadata'
resource type and this results in the creation of a resource repository
folder called '''plugin-config-data/resources-provider/resources/metadata'''.

Into this repository folder I place one file ```tanks.``` which provides
metadata that is common to all keys in the tanks hierarchy (the trailing
period in the filename indicates this breadth of application).
```
{
  "timeout": 60,
  "warnMethod": [ "visual" ],
  "alertMethod": [ "visual" ],
  "alarmMethod": [ "sound", "visual" ],
  "emergencyMethod": [ "sound", "visual" ]
}
```
Each of my tanks then has its own file which provides specific metadata
for each tank.
The file for my waste tank ```tanks.wasteWater.0.currentLevel``` looks
like this.
```
{
  "displayName": "Tank 0 (Waste)",
  "longName": "Tank 0 (Waste)",
  "shortName": "Tank 0",
  "zones": [
    {
      "lower": 0.5,
      "state": "warn",
      "message": "Tank 0 (Waste) level above 50%"
    },
    {
      "lower": 0.7,
      "state": "alert",
      "message": "Tank 0 (Waste) level above 70%"
    },
    {
      "lower": 0.8,
      "state": "alarm",
      "message": "Tank 0 (Waste) level above 80%"
    },
    {
      "lower": 0.9,
      "state": "emergency",
      "message": "Tank 0 (Waste) level above 90%"
    }
  ]
}
```
The metadata applied to the waste tank key is derived from a merge of
the properties contained in the two resources files.

### Using the PUT interface

The plugin's PUT handler can be disabled, installed on just those
keys that were initialised by the plugin, or installed on all terminal
keys in the Signal K data store, subject to user-defined path
exclusions (no need for metadata on a notification, for example).
The PUT handler is installed on the path '*key*.meta'

PUT requests received by the PUT handler are treated as requests for
updates to files in the resource provider repository and thus offer a
mechanism for persisting meta data changes across system re-boots.

A PUT request must supply a value which is an object consisting of zero
or more properties destined for inclusion in current metadata.
An object with zero properties is interpreted as a request to delete
the current metadata and any associated resource file.
Otherwise, the properties supplied in the put request are merged with
any existing metadata (overwriting any existing properties of the same
name) to produce a new metadata object which is saved as the Signal K
meta property value and persisted through the resources provider into
the resource repository.

## Configuration

The plugin configuration has the following properties.

| Property name   | Value type | Value default | Description |
| :-------------- | :--------- | :------------ | :---------- |
| resourceType    | string     | 'metadata'    | The name of the resource type used for metadata values. |
| putSupport      | string     | 'limited'     | Scope of meta path put handler installation (one of 'none', 'limited' or 'full'). |
| excludeFromInit | [string]   | (see below)   | Signal K paths which should not be initialised with metadata. |
| excludeFromPut  | [string]   | (see below)   | Signal K paths which should not be supported by a put handler. |

*resourceType* names the resource collection that will be used to
retrieve and persist metadata.
This value must name a resource type in Signal K's resource provider
service.

*putSupport* specifies the scope of installation of a resource aware
PUT handler on Signal K meta paths.
'none' says do not install on any meta path; 'limited' says only
install on meta paths already configured in the resource provider;
'full' says install on all Signal K (meta) keys.

*excludeFromInit* is a list of Signal K paths or path prefixes which
will be excluded from meta data initialisation.

*excludeFromPut* is a list of Signal K paths or path prefixes which
will be excluded from put handler support.

Both *excludeFromInit* and *excludeFromPut* default to:
```
[ "design.", "network.", "notifications.", "plugins." ]
```

The default configuration will allow the plugin to load meta data from
the system resources provider during system initialisation, but before
this can happen the Signal K resource provider must be configured to
support the plugin's custom *resourceType* and subsequently the
metadata resources that you wish to provide must be installed in the
provider repository.

### Configuring the Signal K resource provider

From the Signal K Dashboard, navigate to
'''Server->Plugin config->Resource provider (built-in)'''
and add *resourceType* (usually 'metadata') as a custom resource type.

This will create the folder
'''plugin-config-data/resources-provider/resources/*resourceType*'''
in the Signal K home directory and it is into this folder that you
should place your metadata resource files.

### Metadata resources files

Each metadata resource file is a text file containing the JSON
specification of a metadata object.
The name of a text file can specify either a terminal path in the
Signal K store (i.e. a key value) or a non-terminal path identified
by a trailing period('.').

Metadata for a key is constructed by merging all relevant non-terminal
and the terminal path data: properties in more specific paths will
overwrite properties of the same name from more general paths.

For example, I specify the metadata for the key
```tanks.wasteWater.0.currentLevel``` in two resources files,
```tanks.``` and ```tanks.wasteWater.0.currentLevel```.

The ```tanks.``` resources file (which will be applied to all keys
in the ```tanks.`` hierarchy) looks like this.
```
{
  "timeout": 60,
  "warnMethod": [ "visual" ],
  "alertMethod": [ "visual" ],
  "alarmMethod": [ "sound", "visual" ],
  "emergencyMethod": [ "sound", "visual" ]
}
```
The ```tanks.wasteWater.0.currentLevel``` resources file looks like
this.
```
{
  "displayName": "Tank 0 (Waste)",
  "longName": "Tank 0 (Waste)",
  "shortName": "Tank 0",
  "zones": [
    {
      "lower": 0.5,
      "state": "warn",
      "message": "Tank 0 (Waste) level above 50%"
    },
    {
      "lower": 0.7,
      "state": "alert",
      "message": "Tank 0 (Waste) level above 70%"
    },
    {
      "lower": 0.8,
      "state": "alarm",
      "message": "Tank 0 (Waste) level above 80%"
    },
    {
      "lower": 0.9,
      "state": "emergency",
      "message": "Tank 0 (Waste) level above 90%"
    }
  ]
}
```
The metadata applied to the waste tank key will be derived from a merge
of these two resources files.

## Operation

On startup, the plugin immediately injects all data from the metadata
resource type into the Signal K tree (unless it is restricted by
*excludeFromInit*).

If *putSupport* is set to 'limited' then a PUT handler is installed on
the injected meta paths.

If *putSupport* is set to 'full', then a PUT handler is installed on
all Signal K meta paths.
In this case, the Signal K data store is monitored for dynamic changes
to the collection of available paths and put support added to newly
appearing keys.

## Author

Paul Reeve <*preeve_at_pdjr_dot_eu*>
