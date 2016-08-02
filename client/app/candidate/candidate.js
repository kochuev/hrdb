'use strict';

angular.module('hrDbApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('candidate', {
        template: ' <ui-view></ui-view>'
      })
      .state('candidate.list', {
        url: '/',
        templateUrl: 'app/candidate/list.html',
        controller: 'CandidateListController',
        controllerAs: 'vm',
        authenticate: 'user',
        resolve: {
          'agencies': (Entity) => {
            return Entity.getAgencies();
          },
          'positions': (Entity) => {
            return Entity.getPositions();
          },
          'candidatesObj': ($http) => {
            return $http.get('/api/candidates/')
          }
        }
      })
      .state('candidate.new', {
        url: '/candidate/new',
        templateUrl: 'app/candidate/candidate.html',
        controller: 'CandidateController',
        controllerAs: 'vm',
        authenticate: 'user',
        resolve: {
          'candidateObj': () => {
            return {
              data:  {
                visits: [{
                  active: true,
                  general: {'date': new Date()}
                }]
              }
            };
          }
        }
      })
      .state('candidate.details', {
        url: '/candidate/:id',
        templateUrl: 'app/candidate/candidate.html',
        controller: 'CandidateController',
        controllerAs: 'vm',
        authenticate: 'user',
        resolve: {
          'candidateObj': ($http, $stateParams) => {
            // $http returns a promise for the url data
            return $http.get('/api/candidates/' + $stateParams.id)
          },
        }
      });
  });
