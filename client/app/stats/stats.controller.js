'use strict';

(function() {

class StatsController {

  constructor($http, $stateParams, Modal, positions, agencies, origins, statsByOrigin, statsByAgency, statsByMonth) {
    this.$http = $http;
    this.Modal = Modal;

    this.statsByOrigin = statsByOrigin.data;
    this.statsByAgency = statsByAgency.data;
    this.position = positions[$stateParams.id];
    this.agencies = agencies;
    this.origins = origins;

    this.monthlyChart = {
      labels: [],
      data: []
    };
    for (let point of statsByMonth.data) {
      this.monthlyChart.labels.push(point.date.toLocaleString(navigator.language, {month: 'short', year: '2-digit'}));
      this.monthlyChart.data.push(point.total);
    }
  }

}

angular.module('hrDbApp.stats')
  .controller('StatsController', StatsController);

})();
