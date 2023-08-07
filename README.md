# pdjr-skplugin-meta-injector

Inject meta data into Signal K.

## Description

__pdjr-skplugin-meta-injector__ is a resource provider based utility
which injects metadata resources into the Signal K data store.
The plugin also implements a PUT-based update mechanism which allows
programmatic modification and persistence of metadata resources.

The plugin sources metadata from the default Signal K resource
provider and all that is necessary to start using the plugin is to
dump some JSON text files containing the required metadata into
the 
The simplest mechanism for setting this up is to use the file-system
based provider that is part of recent versions of Signal K
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

The plugin configuration has the following properties.

| Property name | Value type | Value default | Description |
| :------------ | :--------- | :------------ | :---------- |
| resourceType  | string     | 'metadata'    | The name of the resource type used for metadata values. |
| supportPut    | boolean    | true          | Install put handler on configure metadata paths. |

In most cases, the plugin itself will require no configuration, but the
Signal K resource provider must be configured to support the plugin's
custom *resourceType*.

From the Signal K Dashboard, navigate to
'''Server->Plugin config->Resource provider (built-in)'''
and add *resourceType* (usually 'metadata') as a custom resource type.

This will create the folder
'''plugin-config-data/resources-provider/resources/*resourceType*'''
in the Signal K home directory and it is into this folder that you
should place your metadata resource files (see below)

The plugin provides some basic support for maintaining metadata
resources by adding a PUT handler to the terminal meta keys defined
by the resources collection.
This allows, for example, a configuration interface to update metadata
values by PUTing a metadata object which will be merged with the
object defined by the corresponding terminal resource file.  

### Metadata resources files

Each metadata resource file is a text file containing the JSON
specification of a metadata object.
The name of a text file can specify either a terminal path in the
Signal K store (i.e. a key value) or a non-terminal path identified
by a trailing period('.').

Metadata for a key is constructed by merging all of the non-terminal
path data and the terminal path data: properties in more specific
paths will overwrite properties of the same name from more general
paths.

For example, I specify the metadata for the terminal (key) path
```tanks.wasteWater.0.currentLevel``` in two resources files,
```tanks.``` and ```tanks.wasteWater.0.currentLevel```.

The ```tanks.``` resources file content will be applied to all keys
in the ```tanks.`` hierarchy and it looks like this.
```
{
  "timeout": 60,
  "warnMethod": [ "visual" ],
  "alertMethod": [ "visual" ],
  "alarmMethod": [ "sound", "visual" ],
  "emergencyMethod": [ "sound", "visual" ]
}
```
The ```tanks.wasteWater.0.currentLevel``` resources file content 
applies to just this key and looks like this.
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

On startup, the plugin immediately injects data from the metadata
resource type into the Signal K tree.

## Author

Paul Reeve <*preeve_at_pdjr_dot_eu*>
