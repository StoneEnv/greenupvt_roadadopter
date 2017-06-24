GreenUp! Road Adopter
-----------------------------
Written as a hack in 2016 to help the town of Richmond, VT, USA prepare for the State's annual Green Up Day event.

The idea was to provide a map where community members could see segments of road that needed to be "greened up" and then make it easy for the community members to "adopt" a segment of road.
Adopted road segments would be cleaned by the community members that adopted them on Green Up Day (honor system!) and the results for how much trash was collected could be fed back into the app.
The map would show road segments that were adopted, not adopted, or adopted-and-reported-on. This would give the community organizer a clearer picture of the impact had already, as well as what areas of town needed more help as planning before the event continued.

Ideally, over time, road segment adoption over years could be shown to suggest what areas of the roads were least addressed and most in need, and also to help inspire future cleanup efforts.

Planned but never implemented was attaching a photo of work done to a road segment.

The Project team consisted only of Nick Floersch. The code was based upon prior work done at Stone Environmental, Inc., and ESRI... although much of what made the Green Up sign-up stuff really cool was custom for the app.

The project is tightly tied to ArcGIS Server. As such this may not be useful in practice for many developers, but it might give you some ideas if you are using ArcGIS Server and AngularJS.

The project was presented to the GreenUp VT organization in 2016 for potential use statewide. However, lacking funding to cover data processing and hosting, the organization (GreenUp) was unable to pursue use of the app further.

--> GETTING STARTED <--

First install NodeJS ... the latest version. With NPM.

Then install the following NPM packages globally:

sudo npm install -g grunt
sudo npm install -g bower
sudo npm install -g pngquant-bin
sudo npm install -g optipng-bin
sudo npm install -g gifsicle

(On Windows, to emulate that "sudo" command, launch the command prompt as an Administrator ... right-click on command prompt icon to get the option.)

Then (not as admin) run "npm install" followed by "bower install" in the project's top level folder.

When that is done, obtain Ruby for your platform, and install Compass Style (http://compass-style.org/install/)

After that you should be able to run "grunt" in the project folder to kick off the built-in web server and see the site. You may need to run it twice to get the SCSS processed properly. If the site looks super un-styled when you run grunt the first time, quite grunt and try again.

--> DATA <--

The app was built based on access to some ArcGIS Server map and feature services.
They should be available here: http://ags.stone-env.net/arcgis/rest/services/greenup_richmond

If someone asked nicely, I could probably put them in a database dump of some sort.
