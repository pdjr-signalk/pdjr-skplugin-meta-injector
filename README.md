# pdjr-skplugin-metadata

Initialise, maintain and preserve Signal K metadata.

## Description

__pdjr-skplugin-meta-injector__ implements a repository-based metadata
persistence scheme which supports metadata intialisation, editing of
metadata across all Signal K paths and the peristence of dynamic
changes to the system's metadata resource.

The plugin uses the Signal K resource provider as a metadata repository
manager and at any one time operates within the context of a single
resource type.
Multiple metadata resource types can be purposed for different consumer
requirements, for instance, multi-language support.

For a file system backed resource provider, the metadata managed by
the plugin is simply a collection of JSON text files stored in the
resource folder associated with a particular metadata resource type.
Within this resource folder, a text file named '*path*' contains
metadata properties for the specified Signal K key whilst a file
named '*path*.' (note the trailing period) contains metadata
properties that apply to all terminal keys below *path* in the
Signal K data hierarchy.
You can see an example of this hierarchical decomposition mechanism
below.

The plugin optionally supports an update tracker which persists dynamic
metadata changes to the repository and a snapshot mechanism which saves
all system metadata to some resource type.

The plugin configuration interface includes a simple metadata editor
which allows syntax guided and syntax free editing of metadata.

## Hierarchical decomposition example

My ship has five fluid storage tanks: a waste tank, two fresh water
tanks and two fuel tanks.
I want to support a common alarm annunciation strategy across all
tanks, and common, but different, alert zones for each of the
different fluid types.
Each tank has its own unique collection of names.

The metadata for my five tanks is organised in the following way.

<table width='100%'>
<tr><th>File name</th><th>File content</th></tr>
<tr>
<td>tanks.</td>
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
<td>tanks.wasteWater.</td>
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
<td>tanks.fuel.</td>
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
<td>tanks.freshWater.</td>
<td><pre>
{
  "zones": [
    { "upper": 0.15, "state": "alert", "message": "Fresh water level below 15%" }
  ]
}
</pre></td>
</tr>
<tr>
<td>tanks.wasteWater.0.currentLevel</td>
<td><pre>
{
  "displayName": "Waste Tank",
  "shortName": "Waste Tank",
  "longName": "Waste Tank (0)"
}

</pre></td>
</tr>
<tr>
<td>tanks.freshWater.1.currentLevel</td>
<td><pre>
{
  "displayName": "SB Water Tank",
  "shortName": "PS Water Tank",
  "longName": "PS Water Tank (1)"
}
</pre></td>
</tr>
<tr>
<td>tanks.freshWater.2.currentLevel</td>
<td><pre>
{
  "displayName": "SB Water Tank",
  "shortName": "SB Water Tank",
  "longName": "SB Water Tank (2)"
}
</pre></td>
</tr>
<tr>
<td>tanks.fuel.3.currentLevel</td>
<td><pre>
{
  "displayName": "SB Fuel Tank",
  "shortName": "SB Fuel Tank",
  "longName": "SB Fuel Tank (3)"
}
</pre></td>
</tr>
<tr>
<td>tanks.fuel.4.currentLevel</td>
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
Name of the custom resource type used to persist and metadata values.
Optional.
</td>
</tr>
<tr>
<td>excludePaths</td>
<td>[string]</td>
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
This restriction will apply even if metadata for an excluded key is
available in the resource provider repository.
Optional.
</td>
</tr>
<tr>
<td>persistUpdates</td>
<td>boolean</td>
<td><pre>false</pre></td>
<td>
Persist updates to metatdata to the resource provider.
Delta updates to metadata are merged and saved to the resource provider.
Optional.
</td>
</tr>
<tr>
<td>snaphotResourceType</td>
<td><pre>"metadata-snapshot"</pre></td>
<td>
Name of the custom resource type used to persist a metadata snapshot.
Optional.
</td>
</tr>
<tr>
<td>takeSnaphot</td>
<td><pre>false</pre></td>
<td>
Whether or not to take a snapshot of the Signal K metadata state into
<em>snapshotResourceType</em>.
If true, the plugin will wait until the number of available,
unexcluded, data paths becomes stable before saving available metadata
values.
After a snapshot has been taken, this property value will automatically
be reverted to false to prevent redundant repeated snapshots consuming
system resources.
If you wish to take another, subsequent, snapshot then you must set the
property to true and restart the plugin.
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
