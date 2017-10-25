'use strict';

angular.module('hrDbApp.stats')
  .config(function($stateProvider) {
    $stateProvider
      .state('stats', {
        template: ' <ui-view></ui-view>'
      })
      .state('stats.list', {
        url: '/stats',
        templateUrl: 'app/stats/list.html',
        controller: 'StatsListController',
        controllerAs: 'vm',
        authenticate: 'user',
        resolve: {
          'positions': (Entity) => {
            return Entity.getPositions();
          },
        }
      })
      .state('stats.details', {
        url: '/stats/:id',
        templateUrl: 'app/stats/stats.html',
        controller: 'StatsController',
        controllerAs: 'vm',
        authenticate: 'user',
        resolve: {
          'agencies': (Entity) => {
            return Entity.getAgencies();
          },
          'positions': (Entity) => {
            return Entity.getPositions();
          },
          'origins': (Entity) => {
            return Entity.getOrigins();
          },
          'statsByAgency': ($http, $stateParams) => {
            return $http.get('/api/candidates/stats/agency/' + $stateParams.id);
          },
          'statsByOrigin': ($http, $stateParams) => {
            return $http.get('/api/candidates/stats/origin/' + $stateParams.id);
          },
          'statsByMonth': ($http, $stateParams) => {
            return $http.get('/api/candidates/stats/month/' + $stateParams.id);
          },
        }
      });
  });
