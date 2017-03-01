var config = {
    apiKey: "AIzaSyDDM6-1n5gqa9MrNlwn26tC7MssL4LLHBA",
    authDomain: "welenda-4c4d9.firebaseapp.com",
    databaseURL: "https://welenda-4c4d9.firebaseio.com",
    storageBucket: "welenda-4c4d9.appspot.com",
    messagingSenderId: "328580281132"
};

firebase.initializeApp(config);
database = firebase.database();

var app = angular.module('welendaApp', ['auth.services']);

app.controller('HomeCtrl', function($scope, Auth) {
    $scope.RegTxt = "Register";
    
    if (Auth.isLoggedIn()){
      $scope.username = Auth.getUser().name;
      $scope.isLoggedIn = true;  
    }else{
      $scope.isLoggedIn = false;
    }
    
    $scope.logoutUser = function() {
        if (confirm("Do you want to logout?")) {
            Auth.logout();
            location.reload();
        }
    }
});

app.controller('AuthCtrl', function($scope, Auth) {
    $scope.submitFormRegister = function(user) {
        if (user == undefined || user.email == undefined || user.name == undefined ||
            user.password == undefined || user.rePassword == undefined ){
            alert('Please fill out all the fields.');
        }
        else if (user.password != user.rePassword){
            alert('Passwords do not match.');
        }
        else {
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
             .then(function(result) {        
                //$state.go('app.login');
                
                // save user to the database
                database.ref('users/' + result.uid).set({
                  "email": user.email,          
                  "name": user.name,
                });
                
                alert('You have successfully registered. Now login using email and password');
        
             }, function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'weak-password') {
                  alert('The password is too weak.');
                } 
                else if (errorCode == 'invalid-email')
                {
                  alert('email address is not valid.');
                }
                else if (errorCode == 'email-already-in-use')
                {
                  alert('Already exists an account with the given email address.');
                }
                else {  
                  alert(errorMessage);
                }
            }); 
        }
    };
    
    $scope.submitFormLogin = function(user) {
       if (user.loginEmail == undefined || user.loginPassword == undefined ){
          alert('Please enter email/password');
       }
       else{
          firebase.auth().signInWithEmailAndPassword(user.loginEmail, user.loginPassword)
          .then(function(result) {
            firebase.database().ref('/users/' + result.uid).once('value')
                .then(function(userresult) {
                    
                    Auth.setUser(result.uid, userresult.val().name);   
                    window.location.href = "index.html";
                })
          }, function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'wrong-password') {
              alert('Wrong password.');
            }if (errorCode === 'invalid-email') {
              alert('Email address is not valid.');
            }if (errorCode === 'user-disabled') {
              alert('Given email has been disabled.');
            }if (errorCode === 'user-not-found') {
              alert('No user corresponding to the given email.');
            } else {
              alert(errorMessage);
            }
          });  
       }
   };
});

angular.module('auth.services', [])
.factory('Auth', function () {
   return {
      setUser: function (userId, name) {
         _user = { "userId" : userId, "name": name };
         window.localStorage['session'] = JSON.stringify(_user);
      },
      isLoggedIn: function () {
         return window.localStorage['session'] ? true : false;
      },
      getUser: function () {
         return JSON.parse(window.localStorage['session']);
      },
      logout: function () {
         window.localStorage.removeItem("session");
         _user = null;
      }
   }
});

