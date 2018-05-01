'use strict';

(function () {

  const StatsService = class {
    constructor($http) {
      'ngInject';
      this.$http = $http;
    }

    //TODO: implement this method
    _composeQueryString($stateParams) {

      let queryStringParts = [];

      if ($stateParams.startDate) {
        queryStringParts.push('startDate=' + $stateParams.startDate);
      }

      if ($stateParams.endDate) {
        queryStringParts.push('endDate=' + $stateParams.endDate);
      }

      if ($stateParams.positions) {
        $stateParams
            .positions.split(',')
            .map(position => 'positions=' + position)
            .forEach(queryStringPart => {
              queryStringParts.push(queryStringPart);
            });
      }
      console.log(queryStringParts.length ? '?' + queryStringParts.join('&') : '');

      return queryStringParts.length ? '?' + queryStringParts.join('&') : '';
    }

    getStatsByMonth($stateParams) {
      return this.$http.get('/api/stats/visits-by-month/' + this._composeQueryString($stateParams));
    }

    getStatsByAgency($stateParams) {
      return this.$http.get('/api/stats/visits-by-agency/' + this._composeQueryString($stateParams));
    }

    getStatsByOrigin($stateParams) {
      return this.$http.get('/api/stats/visits-by-origin/' + this._composeQueryString($stateParams));
    }
  };

  angular
      .module('hrDbApp.stats')
      .service('StatsService', StatsService);

})();


