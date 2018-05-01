'use strict';

(function () {

  const StatsService = class {
    constructor($http) {
      'ngInject';
      this.$http = $http;
    }

    getStatsByMonth($stateParams) {
      return this.$http.get('/api/stats/visits-by-month/'
          + this._composeQueryString($stateParams));
    }

    getStatsByAgency($stateParams) {
      return this.$http.get('/api/stats/visits-by-agency/'
          + this._composeQueryString($stateParams));
    }

    getStatsByOrigin($stateParams) {
      return this.$http.get('/api/stats/visits-by-origin/'
          + this._composeQueryString($stateParams));
    }

    //TODO: refactor this method
    _composeQueryString($stateParams) {

      let queryStringParts = [];

      if ($stateParams.startDate) {
        queryStringParts.push('startDate=' + $stateParams.startDate);
      }

      if ($stateParams.endDate) {
        queryStringParts.push('endDate=' + $stateParams.endDate);
      }

      if ($stateParams.positions) {
        $stateParams.positions
            .map(position => 'positions[]=' + position)
            .forEach(queryStringPart => {
              queryStringParts.push(queryStringPart);
            });
      }

      return queryStringParts.length ? '?' + queryStringParts.join('&') : '';
    }
  };

  angular
      .module('hrDbApp.stats')
      .service('StatsService', StatsService);

})();
