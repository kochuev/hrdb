'use strict';

(function () {

  const StatsDateFilterComponent = {
    bindings: {
      startDate: '<',
      endDate: '<',
      onDatesChanged: '&'
    },
    templateUrl: 'app/stats/stats-date-filter/stats-date-filter.html',
    controller: class StatsDateFilterComponent {

      onChange() {
        this.onDatesChanged({
          $event: {
            startDate: this.startDate,
            endDate: this.endDate
          }
        });
      }

    }
  };

  angular
      .module('hrDbApp.stats')
      .component('statsDateFilter', StatsDateFilterComponent);

})();
