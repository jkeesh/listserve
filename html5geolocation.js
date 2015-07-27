(function() {
  // Generate a random Firebase location
  var firebaseUrl = "https://listserve.firebaseio.com/locations";
  var firebaseRef = new Firebase(firebaseUrl);
  var curUserLatitude, curUserLongitude;

  var childRef;

  var allPoints = {};

  // Create a new GeoFire instance at the random Firebase location
  // var geoFire = new GeoFire(firebaseRef);

  /* Uses the HTML5 geolocation API to get the current user's location */
  var getLocation = function() {
    if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
      log("Asking user to get their location");
      navigator.geolocation.getCurrentPosition(geolocationCallback, errorHandler);
    } else {
      log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
    }
  };

  firebaseRef.on('child_changed', function(childSnapshot, prevChildKey) {
    // update the info window to contain the new name of the user
    allPoints[childSnapshot.key()].infowindow.setContent(childSnapshot.val().name);
  });

  var getCurrentUsers = function() {
    firebaseRef.on('child_added', function(childSnapshot, prevChildKey) {
        var snapshot = childSnapshot.val();
        console.log(snapshot);
        addPointToMap(snapshot.latitude, snapshot.longitude, snapshot.name, childSnapshot.key());

        addUser(snapshot.name);
    });
  }

  var addPointToMap = function(lat, long, name, key) {
    log("adding point " + lat + " " + long);
    var pos = new google.maps.LatLng(lat, long);

    var circleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: pos,
      radius: 100000
    };
    // Add the circle for this city to the map.
    var circle = new google.maps.Circle(circleOptions);



    var infowindow = new google.maps.InfoWindow({
        content: name
    });
    var marker = new google.maps.Marker({
        position: pos, 
        map: map, 
        title: name
    });
    google.maps.event.addListener(marker, 'click', function() {
      console.log("hi");
      infowindow.open(map, marker);
    });


    allPoints[key] = {
      circle: circle,
      infowindow: infowindow,
      marker: marker
    }
  }

  var randomNumber = function() {
    var num = Math.random() * 70;
    if(Math.random() < 0.5){
      num *= -1;
    }
    return num;
  }

  var addRandomPoint = function() {
    // addPointToMap(randomNumber(), randomNumber());
  }

  var updateUsername = function(username) {
    if(!username || !curUserLatitude || !curUserLongitude){
      return;
    }

    childRef.set({
      name: username,
      latitude: curUserLatitude,
      longitude: curUserLongitude
    });
  }

  /* Callback method from the geolocation API which receives the current user's location */
  var geolocationCallback = function(location) {
    var latitude = location.coords.latitude;
    var longitude = location.coords.longitude;

    latitude = latitude.toFixed(2);
    longitude = longitude.toFixed(2);

    // comment in for random lat/long
    // var latitude = randomNumber();
    // var longitude = randomNumber();

    curUserLatitude = latitude;
    curUserLongitude = longitude;

    log("Retrieved user's location: [" + latitude + ", " + longitude + "]");

    // addPointToMap(location.coords.latitude, location.coords.longitude);
  
    // for testing
    // addRandomPoint();

    // geoFire.set(username, [latitude, longitude]).then(function() {
    //   log("Current user " + username + "'s location has been added to GeoFire");

    //   // When the user disconnects from Firebase (e.g. closes the app, exits the browser),
    //   // remove their GeoFire entry
    //   firebaseRef.child(username).onDisconnect().remove();

    //   log("Added handler to remove user " + username + " from GeoFire when you leave this page.");
    //   log("You can use the link above to verify that " + username + " was removed from GeoFire after you close this page.");
    // }).catch(function(error) {
    //   log("Error adding user " + username + "'s location to GeoFire");
    // });

    childRef = firebaseRef.push();

    childRef.set({
      name: username,
      latitude: latitude,
      longitude: longitude
    });

    // when the user disconnects, remove it
    childRef.onDisconnect().remove()

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

  function addUser(user) {
    var childDiv = document.createElement("div");
    var textNode = document.createTextNode(user);
    childDiv.appendChild(textNode);
    document.getElementById("log").appendChild(childDiv);    
  }

  /* Logs to the page instead of the console */
  function log(message) {
    // var childDiv = document.createElement("div");
    // var textNode = document.createTextNode(message);
    // childDiv.appendChild(textNode);
    // document.getElementById("log").appendChild(childDiv);
  }

  // // CREATE A REFERENCE TO FIREBASE
  var messagesUrl = "https://listserve.firebaseio.com/messages";
  var messagesRef = new Firebase(messagesUrl);

  // // REGISTER DOM ELEMENTS
  var messageField = $('#messageInput');
  var nameField = $('#nameInput');
  var messageList = $('#example-messages');

  var username = "anon";

  // LISTEN FOR KEYPRESS EVENT
  messageField.keypress(function (e) {
    if (e.keyCode == 13) {
      //FIELD VALUES
      username = nameField.val();
      var message = messageField.val();

      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      messagesRef.push({name:username, text:message});
      messageField.val('');
    }
  });

  nameField.keyup(function (e) {
      username = nameField.val();
      // setUserStatus('online');

      updateUsername(username);
  });

  // Add a callback that is triggered for each chat message.
  messagesRef.limitToLast(10).on('child_added', function (snapshot) {
    //GET DATA
    var data = snapshot.val();
    var username = data.name || "anonymous";
    var message = data.text;

    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
    var messageElement = $("<li>");
    var nameElement = $("<strong class='example-chat-username'></strong>")
    nameElement.text(username);
    messageElement.text(message).prepend(nameElement);

    //ADD MESSAGE
    messageList.append(messageElement)

    //SCROLL TO BOTTOM OF MESSAGE LIST
    messageList[0].scrollTop = messageList[0].scrollHeight;
  });


})();