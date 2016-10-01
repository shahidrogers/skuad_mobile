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

      }, function(resp) {
        console.log("Error retrieving data from API.");
      });
  };

  //retrieve data
  getData();

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
    $state.go('intro');
  };
});
