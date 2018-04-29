'use strict';

(function () {

    const StatsService = class {
        constructor($http) {
            'ngInject';
            this.$http = $http;
        }

        //TODO: implement this method
        _composeQueryString($stateParams){
            return '?startDate=01-01-2001&positions=5ae5c885d72d006ee2cbed3c';
        }

        getStatsByMonth($stateParams){
            return this.$http.get('/api/stats/visits-by-month/' + this._composeQueryString($stateParams));
        }

        getStatsByAgency($stateParams){
            return this.$http.get('/api/stats/visits-by-agency/' + this._composeQueryString($stateParams));
        }

        getStatsByOrigin($stateParams){
            return this.$http.get('/api/stats/visits-by-origin/' + this._composeQueryString($stateParams));
        }
    };

    angular
        .module('hrDbApp.stats')
        .service('StatsService', StatsService);

})();


