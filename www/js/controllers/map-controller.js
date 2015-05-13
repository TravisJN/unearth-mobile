angular.module('unearth.mapController', [])
  .controller('MapController', function($scope, $interval, Waypoints) {
    var coordinateObject = {
      latitude: null,
      longitude: null
    };
    var coordinateArray = [];
    var sendWaypointsObject = {waypoints: []};
    var allWaypoints = [];

    var layer = L.TileLayer.maskCanvas({
     radius: 25,               // Radius in pixels or in meters of transparent circles (see useAbsoluteRadius)
     useAbsoluteRadius: true,  // True: r in meters, false: r in pixels
     color: '#00000',          // The color of the fog layer
     opacity: 0.8,             // Opacity of the fog area
     noMask: false,            // True results in normal (filled) circled, false is for transparent circles
     lineColor: '#A00'         // Color of the circle outline if noMask is true
    });

    // Creates a map in the div #map
    L.mapbox.accessToken = mapboxAccessToken;
    var map = L.mapbox.map('map', mapboxLogin);

    var dataSent = false;
    var accuracy;
    // Watches GPS position and POST waypoints to database every time position updates
    navigator.geolocation.watchPosition(function(position) {
      accuracy = position.coords.accuracy;
      //if(accuracy < 10) {
        coordinateArray.push(position.coords.latitude);
        coordinateArray.push(position.coords.longitude);
        sendWaypointsObject.waypoints.push(coordinateArray.slice());
        coordinateArray = [];
      //}

      // Prevents transmission of empty waypoint data to server

      $interval(function() {
        if(dataSent === false && sendWaypointsObject.waypoints.length > 0) {
          console.log('sendWaypointsObject: ', sendWaypointsObject);
          Waypoints.sendWaypoints(sendWaypointsObject, function() {
            dataSent = true;
          });
        }
      }, 8000);

      if(dataSent === true) {
        sendWaypointsObject.waypoints = [];
        dataSent = false;
      }
    }, function(error){console.log(error)}, {maximumAge: 60000, timeout: 10000, enableHighAccuracy: true});

    var getInterval = $interval(function() {
        // GET waypoints array from server on app load and display fog overlay
        Waypoints.getWaypoints(function(waypointData) {
          console.log('waypointData: ', waypointData, '  Accuracy: ', accuracy);
          if(waypointData.waypoints.length > 0) {
            map.removeLayer(layer);
            // Creates fog layer with user's waypoints as transparent "holes" in the fog
            layer.setData(waypointData.waypoints);
            map.addLayer(layer);
          }
        });
      }, 10000);    // Makes GET request for waypoints every 30 seconds

    //getInterval();

      $scope.$on("$destroy", function (event) {
        $interval.cancel(getInterval);
      });
  });
