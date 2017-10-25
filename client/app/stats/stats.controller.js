'use strict';

(function() {

class StatsController {

  constructor($http, $scope, $filter, Modal, positions, agencies, origins, statsByOrigin, statsByAgency, statsByMonth) {
    this.$http = $http;
    this.$filter = $filter;
    this.$scope = $scope;
    this.Modal = Modal;

    this.statsByOrigin = statsByOrigin.data;
    this.statsByAgency = statsByAgency.data;
    this.positions = positions;
    this.agencies = agencies;
    this.origins = origins;

    this.monthlyChart = {
      labels: [],
      data: []
    };
    for (let point of statsByMonth.data) {
      this.monthlyChart.labels.push(point._id.month + "." + point._id.year);
      this.monthlyChart.data.push(point.total);
    }
  }

}

angular.module('hrDbApp.stats')
  .controller('StatsController', StatsController);

})();
