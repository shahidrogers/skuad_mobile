angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $http, $state, $ionicPopup, $ionicViewService) {

  $scope.data = {}

  if(window.localStorage['username'] != null){
    //if logged in already, go to categories

    //clear back history stack,
    //prevent other page from coming back here upon back button press
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });

    $state.go('getlocation');
  }

  $scope.login = function(){
    console.log("LOGIN user: " + $scope.data.username + " - PW: " + $scope.data.password);

    //get latest data for location from API
    $http.get('http://floating-peak-63956.herokuapp.com/users/' + $scope.data.username).
      then(function(resp) {
        console.log(resp);
        if(resp.data.password == $scope.data.password){

          window.localStorage['username'] = $scope.data.username;

          //clear back history stack,
          //prevent other page from coming back here upon back button press
          $ionicViewService.nextViewOptions({
              disableAnimate: true,
              disableBack: true
          });

          $state.go('getlocation');
        }
        
      }, function(resp) {
        //if error
        console.log("Error - " + resp);

        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: err.error_message
        });
      });
  };

  $scope.register = function(){
    $state.go('register');
  };
  
})

.controller('RegisterCtrl', function($scope, $state, $http, $ionicPopup, $ionicViewService) {

  $scope.data = {}

  $scope.submit = function(){
    
    var postObject = new Object();
    postObject.name = $scope.data.name;
    postObject.age = $scope.data.age;
    postObject.loc = {};
    postObject.email = $scope.data.email;
    postObject.password = $scope.data.password;

    console.log(postObject);

    var req = {
      method: 'POST',
      url: 'http://floating-peak-63956.herokuapp.com/users',
      data: postObject
    };

    $http(req).success(function(resp) {
      console.log('Success', resp);
      // resp.data contains the result
      /*var alertPopup = $ionicPopup.alert({
        title: 'Request submitted',
        template: resp
      });*/

      //clear back history stack,
      //prevent other page from coming back here upon back button press
      $ionicViewService.nextViewOptions({
          disableAnimate: true,
          disableBack: true
      });

      $state.go('register');

    }).error(function(err) {
      console.error('ERROR', err);
      var alertPopup = $ionicPopup.alert({
        title: 'Registration failed!',
        template: err.error_message
      });
    })
  };
  
})


.controller('IntroCtrl', function($scope, $state) {

  //if fav location has already been selected,
  if(window.localStorage['favLocation'] != null){
    //go to dashboard immediately
    $state.go('tab.dash');
  }

  //go to select location list
  /*$scope.continue = function (){
    //continue to select fav location screen
    $state.go('selectfavlocation');
  };*/

  //go to get location screen
  $scope.continue = function (){
    //continue to select fav location screen
    $state.go('getlocation');
  };
})

.controller('GetLocationCtrl', function($scope, $http, $cordovaGeolocation, $state, $ionicViewService) {

  $scope.lat = null;
  $scope.long = null;
  $scope.resp = null;

  var retrieveClosestDevice = function(longitude, latitude){
    $http.get("http://infinite-dusk-89452.herokuapp.com/devices/nearby/" + longitude + "/" + latitude).
      then(function(response) {
        $scope.resp = response;

        window.localStorage['favLocation'] = $scope.resp.data[0]._id;
        window.localStorage['favLocationName'] = $scope.resp.data[0].name;

      }, function(response) {
        console.log("Error retrieving closest device.");
      });
  }

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    $scope.lat  = position.coords.latitude
    $scope.long = position.coords.longitude
    console.log($scope.lat + '   ' + $scope.long + ' - location retrieved!')
    retrieveClosestDevice($scope.long, $scope.lat);
  }, function(err) {
    console.log(err)
  });

  $scope.continueToDash = function (){

    //temporary - assign location into localStorage
    //store fav location id upon selection
    window.localStorage['favLocation'] = $scope.resp.data[0]._id;
    window.localStorage['favLocationName'] = $scope.resp.data[0].name;

    //clear back history stack,
    //prevent other page from coming back here upon back button press
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });

    //continue to select fav location screen
    $state.go('tab.dash');
  };
})

.controller('DashCtrl', function($scope, $http, $ionicPlatform) {

  //flag for API call - success/fail
  $scope.retrieveSuccess = false;

  //initial data binding
  $scope.location = {name: window.localStorage['favLocationName'],
                      riskPercent:68,
                      riskText:"Moderate risk of mosquito breeding",
                      humidity:0,
                      temp:0,
                      pressure:0,
                      lastUpdatedTime:"-",
                      lastUpdatedDate:"-"};

  var getData = function(){
    //get latest data for location from API
    $http.get("https://infinite-dusk-89452.herokuapp.com/reports/device/" + window.localStorage['favLocation']).
      then(function(resp) {
        console.log(resp);
        $scope.location.temp = resp.data[0].temperature;
        $scope.location.humidity = resp.data[0].humidity;
        $scope.location.pressure = resp.data[0].pressure;
        //convert date string to date object
        var date = new Date(resp.data[0].createdAt);
        //extract data from date object
        $scope.location.lastUpdatedTime = date.getHours() + '' + ('0'+date.getMinutes()).slice(-2);
        $scope.location.lastUpdatedDate = date.getDate() + '/' + (date.getMonth()+1);

        //update API call flag
        $scope.retrieveSuccess = true;

        //play audio effect
        var audio = new Audio('audio/dash-loaded.wav');
        audio.play();
      }, function(resp) {
        console.log("Error retrieving data from closest device.");
      });
  };

  //retrieve data
  getData();

  $scope.refresh = function(){
    getData();
  };
})

.controller('NearbyLocationsCtrl', function($scope, Locations) {
  //return all locations
  $scope.locations = Locations.all();

  console.log('no of locations: ' + $scope.locations.length);

  $scope.playPresenceSound = function(){
    var audio = new Audio('audio/plink.wav');
    audio.play();
  };
})

.controller('SettingsCtrl', function($scope, $state, $window, $ionicHistory) {
  $scope.favLocation = {id: window.localStorage['favLocation'],
                        name: window.localStorage['favLocationName']};

  $scope.changeFavLocation = function (){
    $state.go('selectfavlocation');
  };

  $scope.clearData = function (){
    $window.localStorage.clear();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $state.go('intro');
  };
});
