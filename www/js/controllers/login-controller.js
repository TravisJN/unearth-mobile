angular.module('unearth.loginController', [])
  .controller('LoginController', function ($scope, $state, Authorization) {
    $scope.credentials = {
      email: '',
      password: ''
    };

    $scope.redirectToSignUp = function(){
      $state.go('sign-up');
    }

    $scope.login = function(isValid, credentials) {
      $scope.submitted = true;
      if(isValid) {
        Authorization.login(credentials.email, credentials.password).then( function (isAuthenticated) {
          if (true) {
            $state.go('tab.map');
          } else {
            $state.go('login');
          }
        });
      }
    };
  });
