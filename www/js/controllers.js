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
    $http.get('http://floating-peak-63956.herokuapp.com/users/' + $scope.data.username.toLowerCase()).
      then(function(resp) {
        console.log(resp);
        if(resp.data.password == $scope.data.password){

          window.localStorage['username'] = $scope.data.username.toLowerCase();

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

.controller('GetLocationCtrl', function($scope, $http, $cordovaGeolocation, $state, $ionicViewService) {

  $scope.lat = null;
  $scope.long = null;
  $scope.resp = null;
  $scope.username = window.localStorage['username'];

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    $scope.lat  = position.coords.latitude;
    $scope.long = position.coords.longitude;
    //print to console
    console.log($scope.lat + '   ' + $scope.long + ' - location retrieved!');
    //save to local storage
    window.localStorage['lat'] = position.coords.latitude;
    window.localStorage['long'] = position.coords.longitude;

  }, function(err) {
    console.log(err);
  });

  $scope.continueBasketball = function (){

    window.localStorage['category'] = 'basketball';

    //clear back history stack,
    //prevent other page from coming back here upon back button press
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });

    //continue to select fav location screen
    $state.go('tab.dash');
  };

  $scope.continueFootball = function (){

    window.localStorage['category'] = 'football';

    //clear back history stack,
    //prevent other page from coming back here upon back button press
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });

    //continue to select fav location screen
    $state.go('tab.dash');
  };

  $scope.continueCycling = function (){

    window.localStorage['category'] = 'cycling';

    //clear back history stack,
    //prevent other page from coming back here upon back button press
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });

    //continue to select fav location screen
    $state.go('tab.dash');
  };

  $scope.continueRunning = function (){

    window.localStorage['category'] = 'running';

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

  var latLng = new google.maps.LatLng(window.localStorage['lat'], window.localStorage['long']);
 
  var mapOptions = {
    center: latLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}]
  };
 
  $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  $scope.activities = []; 

  var getData = function(){
    //get latest data for location from API

     $http.get("http://floating-peak-63956.herokuapp.com/activities/nearby/" + window.localStorage['category'] + '/' + window.localStorage['long'] + '/' + window.localStorage['lat']).
      then(function(resp) {
        $scope.activities = resp.data;
        
      }, function(resp) {
        console.log("Error retrieving data.");
      });
  };

  //retrieve data
  getData();

  $scope.refresh = function(){
    getData();
  };
})

.controller('ProfileCtrl', function($scope, $state, $window, $ionicHistory) {
  $scope.favLocation = {id: window.localStorage['favLocation'],
                        name: window.localStorage['favLocationName']};

  $scope.changeFavLocation = function (){
    $state.go('selectfavlocation');
  };

  $scope.clearData = function (){
    $window.localStorage.clear();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $state.go('login');
  };
});
