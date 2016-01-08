'use strict';

angular.module('hrDbApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('entity', {
        template: ' <ui-view></ui-view>'
      })
      .state('entity.agency', {
        url: '/agency',
        params: {entity: 'agency', title: 'Agencies'},
        templateUrl: 'app/entity/entity.html',
        controller: 'EntityController',
        controllerAs: 'vm',
        authenticate: 'user'
      })
      .state('entity.position', {
        url: '/position',
        params: {entity: 'position', title: 'Job positions'},
        templateUrl: 'app/entity/entity.html',
        controller: 'EntityController',
        controllerAs: 'vm',
        authenticate: 'user'
      })
      .state('entity.origin', {
        url: '/origin',
        params: {entity: 'origin', title: 'How candidates got to know about us'},
        templateUrl: 'app/entity/entity.html',
        controller: 'EntityController',
        controllerAs: 'vm',
        authenticate: 'user'
      });
  });
