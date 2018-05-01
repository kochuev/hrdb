'use strict';

(function() {

  const StatsMonthComponent = {
    bindings: {
      monthlyChart: '<'
    },
    templateUrl: 'app/stats/stats-month/stats-month.html'
  };

  angular
      .module('hrDbApp.stats')
      .component('statsMonth', StatsMonthComponent);

})();