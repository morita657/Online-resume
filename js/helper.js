
/*
These are HTML strings. As part of the course, I'll be using JavaScript functions
replace the %data% placeholder text I see in them.
*/
let HTMLheaderName = '<h1 id="name">%data%</h1>';
let HTMLheaderRole = '<span id="role">%data%</span><hr/>';

let HTMLcontactGeneric = '<li class="flex-item"><span class="orange-text">Contacts</span><span class="white-text">%data%</span></li>';
let HTMLmobile = '<li class="flex-item"><span class="orange-text">mobile</span><span class="white-text">%data%</span></li>';
let HTMLemail = '<li class="flex-item"><span class="orange-text">email</span><span class="white-text">%data%</a></span></li>';
let HTMLlinkedin = '<li class="flex-item"><span class="orange-text">LinkedIn</span><span class="white-text">%data%</span></li>';
let HTMLgithub = '<li class="flex-item"><span class="orange-text">github</span><span class="white-text">%data%</a></span></li>';
let HTMLlocation = '<li class="flex-item"><span class="orange-text">location</span><span class="white-text">%data%</span></li>';

let HTMLbioPic = '<img src="%data%" class="biopic">';
let HTMLwelcomeMsg = '<span class="welcome-message" id=".right-green">%data%</span>';

let HTMLskillsStart = '<h3 id="skills-h3">Skills:</h3><ul id="skills" class="flex-box"></ul>';
let HTMLskills = '<li class="flex-item"><span class="white-text">%data%</span></li>';

let HTMLworkStart = '<div class="work-entry"></div>';
let HTMLworkEmployer = '<a href="#">%data%';
let HTMLworkTitle = ' - %data%</a>';
let HTMLworkDates = '<div class="date-text">%data%</div>';
let HTMLworkLocation = '<div class="location-text">%data%</div>';
let HTMLworkDescription = '<p><br>%data%</p>';

let HTMLprojectStart = '<div class="project-entry"></div>';
let HTMLprojectTitle = '<a href="#">%data%</a>';
let HTMLprojectDates = '<div class="date-text">%data%</div>';
let HTMLprojectDescription = '<p><br>%data%</p>';
let HTMLprojectImage = '<img src="%data%">';

let HTMLschoolStart = '<div class="education-entry"></div>';
let HTMLschoolName = '<a href="#">%data%';
let HTMLschoolDegree = ' -- %data%</a>';
let HTMLschoolDates = '<div class="date-text">%data%</div>';
let HTMLschoolLocation = '<div class="location-text">%data%</div>';
let HTMLschoolMajor = '<em><br>Major: %data%</em>';
let HTMLschoolURL = '<a href="#">%data%';

let HTMLonlineClasses = '<h3>Online Classes</h3>';
let HTMLonlineTitle = '<a href="#">%data%';
let HTMLonlineSchool = ' - %data%</a>';
let HTMLonlineDates = '<div class="date-text">%data%</div><br>';
let HTMLonlineURL = '<a href="#">%data%';

let HTMLconnectEmail = '<br><a href="#">%data%</a>';
let HTMLconnectGithub = '<br><a href="#">%data%</a>';
let HTMLconnectSkype = '<br><a href="#">%data%</a>';

let internationalizeButton = '<button>Internationalize</button>';
let googleMap = '<div id="map"></div>';

/*
The next few lines about clicks are for the Collecting Click Locations.
*/
clickLocations = [];

function logClicks(x, y) {
    clickLocations.push({
        x: x,
        y: y
    });
    console.log('x location: ' + x + '; y location: ' + y);
}

$(document).click(function(loc) {
    logClicks(loc.pageX, loc.pageY);
});



/*
This is the fun part. Here's where I generate the custom Google Map for the website.
See the documentation below for more details.
https://developers.google.com/maps/documentation/javascript/reference
*/
let map; // declares a global map variable


/*
Start here! initializeMap() is called when page is loaded.
*/
function initializeMap() {

    let locations;

    let mapOptions = {
        disableDefaultUI: true
    };

    /* 
    For the map to be displayed, the googleMap variable must be
    appended to #mapDiv in resumeBuilder.js. 
    */
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);


    /*
    locationFinder() returns an array of every location string from the JSONs
    written for bio, education, and work.
    */
    function locationFinder() {
        model.init();

        // initializes an empty array
        let locations = [];

        // adds the single location property from bio to the locations array
        for (let bios in model.bio.contacts) {
            locations.push(model.bio.contacts[bios].location);
        }

        // iterates through school locations and appends each location to
        // the locations array
        for (let school in model.education.schools) {
            locations.push(model.education.schools[school].location);
        }

        // iterates through work locations and appends each location to
        // the locations array
        for (let job in model.work.jobs) {
            locations.push(model.work.jobs[job].location);
        }
        return locations;
    }

    /*
    createMapMarker(placeData) reads Google Places search results to create map pins.
    placeData is the object returned from search results containing information
    about a single location.
    */
    function createMapMarker(placeData) {
        // The next lines save location data from the search result object to local variables
        let lat = placeData.geometry.location.lat();
        let lon = placeData.geometry.location.lng();
        let name = placeData.formatted_address; // name of the place from the place service
        let bounds = window.mapBounds; // current boundaries of the map window

        // marker is an object with additional data about the pin for a single location
        let marker = new google.maps.Marker({
            map: map,
            position: placeData.geometry.location,
            title: name
        });

        // infoWindows are the little helper windows that open when I click
        // or hover over a pin on a map. They usually contain more information
        // about a location.
        let infoWindow = new google.maps.InfoWindow({
            content: name
        });

        // On mouse over open the infoWindow
        google.maps.event.addListener(marker, 'mouseover', function() {
            infoWindow.open(map, marker);
        });
        // On mouse out close the infoWindow
        google.maps.event.addListener(marker, 'mouseout', function() {
            infoWindow.close(map, marker);
        });
        // this is where the pin actually gets added to the map.
        // bounds.extend() takes in a map location object
        bounds.extend(new google.maps.LatLng(lat, lon));
        // fit the map to the new marker
        map.fitBounds(bounds);
        // center the map
        map.setCenter(bounds.getCenter());
    }

    /*
    callback(results, status) makes sure the search returned results for a location.
    If so, it creates a new map marker for that location.
    */
    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            createMapMarker(results[0]);
        }
    }

    /*
    pinPoster(locations) takes in the array of locations created by locationFinder()
    and fires off Google place searches for each location
    */
    function pinPoster(locations) {

        // creates a Google place search service object. PlacesService does the work of
        // actually searching for location data.
        let service = new google.maps.places.PlacesService(map);

        // Iterates through the array of locations, creates a search object for each location
        for (let place in locations) {

            // the search request object
            let request = {
                query: locations[place]
            };

            // Actually searches the Google Maps API for location data and runs the callback
            // function with the search results after each search.
            service.textSearch(request, callback);
        }
    }

    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();

    // locations is an array of location strings returned from locationFinder()
    locations = locationFinder();

    // pinPoster(locations) creates pins on the map for each location in
    // the locations array
    pinPoster(locations);

}

/*
Uncomment the code below when I're ready to implement a Google Map!
*/

// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function(e) {
    //Make sure the map bounds get updated on page resize
    map.fitBounds(mapBounds);
});
