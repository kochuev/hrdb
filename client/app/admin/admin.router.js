'use strict';

angular.module('hrDbApp.admin')
  .config(function($stateProvider) {
    $stateProvider
      .state('admin', {
        template: ' <ui-view></ui-view>'
      })
      .state('admin.userlist', {
        url: '/admin/users',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminController',
        controllerAs: 'admin',
        authenticate: 'admin'
      })
      .state('admin.userdetails', {
        url: '/admin/users/:id',
        templateUrl: 'app/admin/userdetails.html',
        controller: 'UserDetailsController',
        controllerAs: 'vm',
        authenticate: 'admin',
        resolve: {
          'userObj': ($http, $stateParams) => {
            // $http returns a promise for the url data
            return $http.get('/api/users/' + $stateParams.id)
          },
        }
      });
  });
