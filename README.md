# pdjr-skplugin-metadata

Initialise, maintain and preserve Signal K metadata.

## Description

__pdjr-skplugin-metadata__ implements a resource provider based
metadata intialisation and persistence mechanism, and also provides a
simple editor that can be used to create and maintain Signal K
metadata.

The plugin uses the Signal K resource provider as a backing store for
metadata and requires at least one custom resource type (let's call it
the *metadata resource type*) dedicated to metadata persistence.
Each resource in the metadata resource type has a name equivalent to a
Signal K path and a value which specifies the metadata object for this
path.

In a file-system backed resource provider (like the Signal K system
plugin) a resource type is instantiated as a folder and each resource
as a JSON text file.
Supplying metadata to initialise a Signal K key is as straightforward
as placing an appropriately named text file in the resource folder.
Metadata files can be created and maintained by hand using either an
external text editor or the plugin configuration interface.

When the plugin starts, each metadata resource in the metadata resource
type is loaded into the Signal K data store.
Optionally, the plugin can be configured to ensure that any dynamic
change to a metadata value in the Signal K data store also updates
the associated metadata resource.

The plugin implements two tools, 'compose' and 'snapshot' that can
help with establishing and maintaining a collection of metadata
resources.

The compose tool implements a mechanism for generating a metadata
resource from one or more *metadata configuration resource*s through
hierarchical composition.
Metdata resources with names of the form '.*path*[.]' are used by the
compose tool which assumes that a metadata resource called
'.*path*' provides metadata destined for the metadata file called
*path* whilst one called '.*path*.' provides metadata for all metadata
resources that are named as hierarchical descendents of *path*.  

configuration
file* (rather than a file containing metadata that will be injected
into Signal K).
A metadata configuration file named .*path* specifies properties for
the configurationkey identified by *path*.
A metadata configuration file named .*path*. specifies configuray in such files apply to all
hierarchically descendent keys of *path* and are composed into each
applicable terminal key the first time the plugin is executed.

The plugin optionally supports an update tracker which persists dynamic
metadata changes to the repository and a non-destructive snapshot
mechanism which creates metdata keys for all Signal K paths.
Additioanal metadata resource types can be purposed for different
requirements (configuration, snapshotting, prototyping, multi-language
support, whatever), but only one repository can be active at any given
time.


## Hierarchical composition example

My ship has five fluid storage tanks: a waste tank, two fresh water
tanks and two fuel tanks.
I want to support a common alarm annunciation strategy across all
tanks, and common, but different, alert zones for each of the
different fluid types.
Each tank has its own unique collection of names.

The initialisation metadata for my five tanks is organised in the
following way.

<table width='100%'>
<tr><th>File name</th><th>File content</th></tr>
<tr>
<td>.tanks.</td>
<td><pre>
{
  "timeout": 60,
  "alertMethod": [ "visual" ],
  "warnMethod": [ "visual" ],
  "alarmMethod": [ "sound", "visual" ],
  "emergencyMethod": [ "sound", "visual" ]
}
</pre></td>
</tr>
<tr>
<td>.tanks.wasteWater.</td>
<td><pre>
{
  "zones": [
    { "lower": 0.5, "state": "alert", "message": "Waste level above 50%" },
    { "lower": 0.7, "state": "warn", "message": "Waste level above 70%" },
    { "lower": 0.8, "state": "alarm", "message": "Waste level above 80%" },
    { "lower": 0.9, "state": "emergency", "message": "Waste level above 90%" }
  ]
}
</pre></td>
</tr>
<tr>
<td>.tanks.fuel.</td>
<td><pre>
{
  "zones": [
    { "upper": 0.15, "state": "alert", "message": "Fuel level below 15%" },
    { "upper": 0.05, "state": "alert", "message": "Fuel level below 5%" }
  ]
}
</pre></td>
</tr>
<tr>
<td>.tanks.freshWater.</td>
<td><pre>
{
  "zones": [
    { "upper": 0.15, "state": "alert", "message": "Fresh water level below 15%" }
  ]
}
</pre></td>
</tr>
<tr>
<td>.tanks.wasteWater.0.currentLevel</td>
<td><pre>
{
  "displayName": "Waste Tank",
  "shortName": "Waste Tank",
  "longName": "Waste Tank (0)"
}

</pre></td>
</tr>
<tr>
<td>.tanks.freshWater.1.currentLevel</td>
<td><pre>
{
  "displayName": "SB Water Tank",
  "shortName": "PS Water Tank",
  "longName": "PS Water Tank (1)"
}
</pre></td>
</tr>
<tr>
<td>.tanks.freshWater.2.currentLevel</td>
<td><pre>
{
  "displayName": "SB Water Tank",
  "shortName": "SB Water Tank",
  "longName": "SB Water Tank (2)"
}
</pre></td>
</tr>
<tr>
<td>.tanks.fuel.3.currentLevel</td>
<td><pre>
{
  "displayName": "SB Fuel Tank",
  "shortName": "SB Fuel Tank",
  "longName": "SB Fuel Tank (3)"
}
</pre></td>
</tr>
<tr>
<td>.tanks.fuel.4.currentLevel</td>
<td><pre>
{
  "displayName": "SB Fuel Tank",
  "shortName": "SB Fuel Tank",
  "longName": "SB Fuel Tank (4)"
}
</pre></td>
</tr>
</table>

## Configuration

The plugin configuration facility provides a graphical interface which
supports plugin configuration and metadata editing.

The plugin configuration itself has the following properties.

<table width="100%">
<tr>
<th>Property&nbsp;name</th>
<th>Property&nbsp;value</th>
<th>Description</th>
</tr>
<tr>
<td>startDelay</td>
<td><pre>4</pre></td>
<td>
Number of seconds to delay plugin start (to allow for resource
provider initialisation).
Optional.
</td>
</tr>
<tr>
<td>resourceType</td>
<td><pre>"metadata"</pre></td>
<td>
Name of the active custom resource type.
Optional.
</td>
</tr>
<tr>
<td>excludePaths</td>
<td><pre>
[
  "design.",
  "network.",
  "notifications.",
  "plugins."
]
</pre></td>
<td>
List of Signal K pathnames or pathname prefixes specifying keys which
should not be processed by the plugin.
Optional.
</td>
</tr>
<tr>
<td>compose</td>
<td><pre>false</pre></td>
<td>
Generate metadata files from metadata configuration files.
Setting this property to true triggers the compositor to build a new
or restore a previously configured metadata collection.
After execution of the compositor the compose property is reset to
false.
Optional.
</td>
</tr>
<tr>
<td>snapshot</td>
<td><pre>false</pre></td>
<td>
Take a snapshot of the Signal K metadata state.
If true, the plugin will wait until the number of available,
unexcluded, data paths becomes stable before saving metadata values for
every key.
After a snapshot has been taken, the snaphot property is rest to false.
Optional.
</td>
</tr>
<tr>
<td>persist</td>
<td><pre>false</pre></td>
<td>
</td>
</td>
</tr>
</table>

Before the plugin can be used you must configure the Signal K resource
provider so that it supports the custom resource types 'metadata' and
'metadata-snapshot' (or whatever alternatives you may have
specified by setting *resourceType* and/or *snapshotResourceType* in
the pluging configuration).

Subsequently any metadata configuration files you place in the resource
provider's metadata folder will be used to initialise system metadata.

## Operation

The plugin has sensible defaults for all configuration properties and
will start immediately after installation, creating a default
configuration file as it does so.

If *putSupport* is set to 'limited' then a PUT handler is installed on
the injected meta paths.

If *putSupport* is set to 'full', then a PUT handler is installed on
all Signal K meta paths.
In this case, the Signal K data store is monitored for dynamic changes
to the collection of available paths and put support added to newly
appearing keys.

## Author

Paul Reeve <*preeve_at_pdjr_dot_eu*>
