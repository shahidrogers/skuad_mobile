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

.controller('DashCtrl', function($scope, $state, $http, $ionicPlatform) {

  $scope.category = window.localStorage['category'].toUpperCase();

  $scope.activities = []; 

  var getData = function(){
    //get latest data for location from API

     $http.get("http://floating-peak-63956.herokuapp.com/activities/nearby/" + window.localStorage['category'] + '/' + window.localStorage['long'] + '/' + window.localStorage['lat']).
      then(function(resp) {
        $scope.activities = resp.data;
        console.log(resp.data);
        
      }, function(resp) {
        console.log("Error retrieving data.");
      });
  };

  //retrieve data
  getData();

  $scope.refresh = function(){
    getData();
  };

  $scope.createNewActivity = function(){
    $state.go('tab.newactivity');
  };
})

.controller('ActivityCtrl', function($scope, $state, $stateParams, $http, $window, $ionicHistory) {
  
  console.log($stateParams.activityId);

  $scope.comments = null;
  $scope.data = {};
  $scope.isJoined = false;
  

  //get activity details
  $http.get("http://floating-peak-63956.herokuapp.com/activities/" + $stateParams.activityId).
      then(function(resp) {
        $scope.activity = resp.data;
        console.log(resp.data);
        
      }, function(resp) {
        console.log("Error retrieving data.");
      });

  //check if joined
  $http.get("http://floating-peak-63956.herokuapp.com/participants/checkIsJoined/" + $stateParams.activityId + "/" + window.localStorage['username']).
      then(function(resp) {
        if(resp.data.length == 0){
          console.log("nil");
          $scope.isJoined = false;
          console.log($scope.isJoined);
        } else {
          console.log("yes");
          $scope.isJoined = true;
          console.log($scope.isJoined);
        }
        
      }, function(resp) {
        console.log("Error retrieving data.");
      });

  //get comments
  var loadComments = function(){
    $http.get("http://floating-peak-63956.herokuapp.com/comments/" + $stateParams.activityId).
      then(function(resp) {
        if(resp.data.length != 0){
          $scope.comments = resp.data;
        }
        console.log(resp.data);
        
      }, function(resp) {
        console.log("Error retrieving data.");
      });
    }

  loadComments();

  $scope.submitComment = function(){
    
    var postObject = new Object();
    postObject.userId = window.localStorage['username'];
    postObject.activityId = $stateParams.activityId;
    postObject.comment = $scope.data.text;

    console.log(postObject);

    var req = {
      method: 'POST',
      url: 'http://floating-peak-63956.herokuapp.com/comments',
      data: postObject
    };

    $http(req).success(function(resp) {
      console.log('Success', resp);
      // resp.data contains the result
      /*var alertPopup = $ionicPopup.alert({
        title: 'Request submitted',
        template: resp
      });*/

      //reload comments
      loadComments();

    }).error(function(err) {
      console.error('ERROR', err);
      var alertPopup = $ionicPopup.alert({
        title: 'Registration failed!',
        template: err.error_message
      });
    })
  };

  $scope.joinActivity = function(){
    var postObject = new Object();
    postObject.userId = window.localStorage['username'];
    postObject.activityId = $stateParams.activityId;
    console.log(postObject);

    var req = {
      method: 'POST',
      url: 'http://floating-peak-63956.herokuapp.com/participants',
      data: postObject
    };

    $http(req).success(function(resp) {
      console.log('Success', resp);
      // resp.data contains the result
      $scope.isJoined = true;

    }).error(function(err) {
      console.error('ERROR', err);
      var alertPopup = $ionicPopup.alert({
        title: 'Registration failed!',
        template: err.error_message
      });
    })
  }

  $scope.unjoinActivity = function(){
    $http.delete("http://floating-peak-63956.herokuapp.com/participants/checkIsJoined/" + $stateParams.activityId + "/" + window.localStorage['username']).
      then(function(resp) {
        if(resp.data.length == 0){
          console.log("nil");
          $scope.isJoined = false;
          console.log($scope.isJoined);
        } else {
          console.log("yes");
          $scope.isJoined = true;
          console.log($scope.isJoined);
        }
      }, function(resp) {
        console.log("Error retrieving data.");
      });
    
  }

})

.controller('SetGoalCtrl', function($scope, $state, $window, $ionicHistory) {

})

.controller('HistoryCtrl', function($scope, $http, $state, $window, $ionicHistory) {
  //$scope.history = {};
  $scope.list = [];

  $http.get("http://floating-peak-63956.herokuapp.com/participants/byUser/" + window.localStorage['username']).
    then(function(resp) {
      if(resp.data != []){
        $scope.history = resp.data;

        angular.forEach($scope.history, function(value,key){
          $http.get("http://floating-peak-63956.herokuapp.com/activities/" + value.activityId).
          then(function(resp) {
            if(resp.data.length != 0){
              $scope.list.push(resp.data);
            }
            console.log(resp.data);
            
          }, function(resp) {
            console.log("Error retrieving data.");
          });
        });
      }
      console.log(resp.data);
      
    }, function(resp) {
      console.log("Error retrieving data.");
    });

})

.controller('NewActivityCtrl', function($scope, $cordovaDatePicker, $ionicPopup, $http, $state, $window, $ionicHistory) {
  $scope.data = {};
  $scope.categories = ["Running", "Cycling", "Basketball", "Football"];
  $scope.data.category = $scope.categories[0];
  $scope.levels = ["Beginner", "Intermediate", "Professional"];
  $scope.data.level = $scope.levels[0];

  $scope.submit = function(){
    var postObject = new Object();
    postObject.name = $scope.data.name;
    postObject.description = $scope.data.description;
    postObject.category = $scope.data.category.toLowerCase();
    postObject.difficulty = $scope.data.level;
    postObject.createdBy = window.localStorage['username'];
    postObject.bookingAt = new Date(new Date().getTime()+(24*60*60*1000));
    postObject.imgURL = 'http://static.asiawebdirect.com/m/kl/portals/kuala-lumpur-ws/homepage/kl-top10s/10-attraction-subang-jaya/allParagraphs/010/top10Set/04/image/800-subang-ria-park.jpg';
    postObject.loc = {
      coordinates: [101.5851192, 3.0567333],
      type: "Point"
    }
    postObject.locName = "PJS 7"
    console.log(postObject);

    var req = {
      method: 'POST',
      url: 'http://floating-peak-63956.herokuapp.com/activities',
      data: postObject
    };

    $http(req).success(function(resp) {
      console.log('Success', resp);
      // resp.data contains the result
      $ionicHistory.goBack();

    }).error(function(err) {
      console.error('ERROR', err);
      var alertPopup = $ionicPopup.alert({
        title: 'Create activity failed!',
        template: err.error_message
      });
    })
  }
})

.controller('ProfileCtrl', function($scope, $state, $window, $ionicHistory) {
  $scope.data = {username: window.localStorage['username']};

  $scope.changeFavLocation = function (){
    $state.go('selectfavlocation');
  };

  $scope.clearData = function (){
    $window.localStorage.clear();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $state.go('login');
  };

  $scope.setgoal = function (){
    $state.go('setgoal');
  };

  $scope.viewgoal = function (){
    $state.go('viewgoal');
  };
})



.controller('ViewGoalCtrl', function($scope, $state, $window, $ionicHistory) {

});
