# pdjr-skplugin-meta-injector

Inject meta data into Signal K.

## Description

Signal K's default approach to metadata initialisation leverages the
general-purpose defaults mechanism which processes delta updates
from the initialisation file ```baseDeltas.json```.
As the volume of metadata required for initialisation increases this
approach rapidly becomes unwieldy and error-prone.

__pdjr-skplugin-meta-injector__ provides an alternative approach for
metadata initialisation based on multiple metadata containers which
are part of a custom resource type served by the system resource
provider.

For a file system backed resource provider, each container will be a
JSON text file located in the resource folder associated with the
metadata resource type.
A database backed resource provider might persist metadata containers
as records in database.

My own system uses the Signal K default file system backed resource
provider and my metadata initialisation resource consists of a folder
of text files, each containing either the metadata properties for a
single terminal key or some metadata properties that should applied to
all keys below some point in the Signal K path hierarchy.

By way of illustration, my ship has five fluid storage tanks: a waste
tank, two fresh water tanks and two fuel tanks.
I want to support a common alarm annunciation strategy across all
tanks, and common, but different, alert zones for each of the
different fluid types.
Of course, each tank has its own unique collection of names.

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

In addition to metadata initialisation,  the plugin also supports a
PUT-based meta-data editing scheme which can be used to manage objects
in the repository or to create new repository content.
I use this in one of my webapp configuration pages to allow a user
to graphically update the alarm zone settings associated with fluid
tanks.
See "Using the PUT interface" below for more detail.


## Configuration

The plugin configuration has the following properties.

<table width="100%">
<tr>
<th>Property&nbsp;name</th>
<th>Value&nbsp;type</th>
<th>Value&nbsp;default</th>
<th>Description</th>
</tr>
<tr>
<td>startDelay</td>
<td>number</td>
<td><pre>5</pre></td>
<td>Number of seconds to delay plugin start (to allow for resource provider initialisation).</td>
</tr>
<tr>
<td>resourceType</td>
<td>string</td>
<td><pre>'metadata'</pre></td>
<td>Name of the custom resource type used to persist and maintain metadata values.</td>
</tr>
<tr>
<td>putSupport</td>
<td>string</td>
<td><pre>'limited'</pre></td>
<td>
Scope of meta path put handler installation:
<br>
<ul>
<li>'none' says do not install a put handler on any meta path;</li>
<li>'limited' says only install on the meta path of keys that are already configured in the resource provider;</li>
<li>'full' says install on the meta path of all Signal K keys.</li>
</ul>
</td>
</tr>
<tr>
<td>excludeFromInit</td>
<td>[string]</td>
<td><pre>
[
  "design.",
  "network.",
  "notifications.",
  "plugins."
]
</pre></td>
<td>Signal K pathnames or pathname prefixes specifying keys which should not be initialised with metadata (even if metadata for them is available from the resource provider).</td>
</tr>
<tr>
<td>excludeFromPut</td>
<td>[string]</td>
<td><pre>
[
  "design.",
  "network.",
  "notifications.",
  "plugins."
]
</pre></td>
<td>Signal K pathnames or pathname prefixes specifying keys which should not be supported by a put handler.
</td>
</tr>
</table>

A *putSupport* value of 'none' says do not install a put handler on any
meta path; 'limited' says only install on the meta path of keys that
are already configured in the resource provider; 'full' says install on
the meta path of all Signal K keys.

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
specification of some metadata properties.
The name of a text file can specify either a terminal path in the
Signal K store (i.e. a key value) or a non-terminal path identified
by a trailing period('.').

Metadata for a key is constructed by merging all relevant non-terminal
and the terminal path data: properties in more specific paths will
overwrite properties of the same name from more general paths.

See the resource file examples in the [Description](#description)
section above.

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
