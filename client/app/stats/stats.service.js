'use strict';

(function () {

  const StatsService = class {
    constructor($http) {
      'ngInject';
      this.$http = $http;
    }

    getStatsByMonth(params) {
      return this.$http.get('/api/stats/visits-by-month/'
          + this._composeQueryString(params));
    }

    getStatsByAgency(params) {
      return this.$http.get('/api/stats/visits-by-agency/'
          + this._composeQueryString(params));
    }

    getStatsByOrigin(params) {
      return this.$http.get('/api/stats/visits-by-origin/'
          + this._composeQueryString(params));
    }

    _composeQueryString(params) {

      let queryStringParts = [];

      if (params.startDate) {
        queryStringParts.push('startDate=' + params.startDate);
      }

      if (params.endDate) {
        queryStringParts.push('endDate=' + params.endDate);
      }

      if (params.positions) {
        params.positions
            .map(position => 'positions[]=' + position)
            .forEach(param => {
              queryStringParts.push(param);
            });
      }

      return queryStringParts.length ? '?' + queryStringParts.join('&') : '';
    }
  };

  angular
      .module('hrDbApp.stats')
      .service('StatsService', StatsService);

})();
