(function() {
  // Generate a random Firebase location
  var firebaseUrl = "https://listserve.firebaseio.com/";
  var firebaseRef = new Firebase(firebaseUrl);

  // Create a new GeoFire instance at the random Firebase location
  var geoFire = new GeoFire(firebaseRef);

  /* Uses the HTML5 geolocation API to get the current user's location */
  var getLocation = function() {
    if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
      log("Asking user to get their location");
      navigator.geolocation.getCurrentPosition(geolocationCallback, errorHandler);
    } else {
      log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
    }
  };

  var getCurrentUsers = function() {
    firebaseRef.on('child_added', function(childSnapshot, prevChildKey) {
        var snapshot = childSnapshot.val();
        addPointToMap(snapshot.l[0], snapshot.l[1]);
    });
  }

  var addPointToMap = function(lat, long) {
    log("adding point " + lat + " " + long);
    var pos = new google.maps.LatLng(lat, long);

    var infowindow = new google.maps.InfoWindow({
        position: pos, 
        map: map, 
        content:"You are here!"
    });
    // var marker = new google.maps.Marker({
    //     position: pos, 
    //     map: map, 
    //     title:"You are here!"
    // });
  }

  var randomNumber = function() {
    var num = Math.random() * 100;
    if(Math.random() < 0.5){
      num *= -1;
    }
    return num;
  }

  var addRandomPoint = function() {
    // addPointToMap(randomNumber(), randomNumber());
  }

  /* Callback method from the geolocation API which receives the current user's location */
  var geolocationCallback = function(location) {
    // var latitude = location.coords.latitude;
    // var longitude = location.coords.longitude;

    var latitude = randomNumber();
    var longitude = randomNumber();

    log("Retrieved user's location: [" + latitude + ", " + longitude + "]");

    // addPointToMap(location.coords.latitude, location.coords.longitude);
  
    // for testing
    // addRandomPoint();

    geoFire.set(username, [latitude, longitude]).then(function() {
      log("Current user " + username + "'s location has been added to GeoFire");

      // When the user disconnects from Firebase (e.g. closes the app, exits the browser),
      // remove their GeoFire entry
      firebaseRef.child(username).onDisconnect().remove();

      log("Added handler to remove user " + username + " from GeoFire when you leave this page.");
      log("You can use the link above to verify that " + username + " was removed from GeoFire after you close this page.");
    }).catch(function(error) {
      log("Error adding user " + username + "'s location to GeoFire");
    });
  }

  /* Handles any errors from trying to get the user's current location */
  var errorHandler = function(error) {
    if (error.code == 1) {
      log("Error: PERMISSION_DENIED: User denied access to their location");
    } else if (error.code === 2) {
      log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
    } else if (error.code === 3) {
      log("Error: TIMEOUT: Calculating the user's location too took long");
    } else {
      log("Unexpected error code")
    }
  };

  // Get the current user's location
  getLocation();

  getCurrentUsers();

  /* Logs to the page instead of the console */
  function log(message) {
    var childDiv = document.createElement("div");
    var textNode = document.createTextNode(message);
    childDiv.appendChild(textNode);
    document.getElementById("log").appendChild(childDiv);
  }
})();