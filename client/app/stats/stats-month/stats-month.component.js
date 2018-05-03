'use strict';

(function () {

  const StatsMonthComponent = {
    bindings: {
      monthlyChart: '<'
    },
    templateUrl: 'app/stats/stats-month/stats-month.html',
    controller: class StatsMonthComponent {
      constructor() {
        this.isDataAvailable = this.checkIfDataAvailable();
      }

      $onChanges() {
        this.isDataAvailable = this.checkIfDataAvailable();
      }

      checkIfDataAvailable() {
        return (this.monthlyChart
            && this.monthlyChart.data
            && this.monthlyChart.data.length);
      }
    }
  };

  angular
      .module('hrDbApp.stats')
      .component('statsMonth', StatsMonthComponent);

})();
