'use strict';

angular.module('hrDbApp')
  .directive('visit', () => ({
    templateUrl: 'components/visit/visit.html',
    scope: {},
    bindToController: {
      visit: '=',
      candidateName: '@'
    },
    restrict: 'E',
    controller: 'VisitController',
    controllerAs: 'vm'
  }));
