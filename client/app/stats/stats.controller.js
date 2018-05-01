'use strict';

(function() {

  class StatsController {
    constructor() {

      this.monthlyChart = {
        labels: [],
        data: []
      };
      for (let point of this.statsByMonth.data) {
        this.monthlyChart.labels.push(point.date.toLocaleString(navigator.language, {
          month: 'short',
          year: '2-digit'
        }));
        this.monthlyChart.data.push(point.total);
      }

      this.statsByAgency = this.statsByAgency.data;
      this.statsByOrigin = this.statsByOrigin.data;


    }

  }

  angular.module('hrDbApp.stats')
      .controller('StatsController', StatsController);

})();
