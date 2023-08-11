# pdjr-skplugin-meta-injector

Inject meta data into Signal K.

## Description

Signal K's default approach to metadata initialisation leverages the
general-purpose defaults mechanism which processes delta updates
from the initialisation file ```baseDeltas.json```.
As the volume of metadata required for initialisation increases the
maintenance of a single initialisation file rapidly becomes unwieldy
and error-prone.

__pdjr-skplugin-meta-injector__ provides an alternative approach for
metadata initialisation based on snippets served by the system resource
provider from a custom resource repository.

For a file system backed resource provider, each snippet will be the
content of a JSON text file in the resource folder associated with the
metadata resource type.
A database backed resource provider might persist metadata snippets as
records in database.

Using the Signal K default file system backed resource provider a
metadata initialisation resource consists of a folder of text files.
A text file named '*path*' contains either metadata properties for a
single terminal key whilst a file named '*path*.' contains metadata
properties that should applied to all terminal keys below *path* in
the Signal K data hierarchy.

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
<td><pre>"metadata"</pre></td>
<td>Name of the custom resource type used to persist and maintain metadata values.</td>
</tr>
<tr>
<td>putSupport</td>
<td>string</td>
<td><pre>"none"</pre></td>
<td>
Scope of meta path put handler installation:
<p>
<ul>
<li>"none" says do not install a put handler on any meta path;</li>
<li>"limited" says only install on the meta path of keys that are already configured in the resource provider;</li>
<li>"full" says install on the meta path of all Signal K keys.</li>
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
<td>Signal K pathnames or pathname prefixes specifying keys which should not be supported by a put handler.</td>
</tr>
</table>

Before the plugin can be used for metadata initialisation you must
configure the Signal K resource provider so that it supports the custom
resource type 'metadata' (or whatever alternative you may have
specified by setting *resourceType* in the pluging configuration).

Subsequently any metadata configuration files you place in the resource
provider's repository folder will be used to initialise system
metadata.

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
