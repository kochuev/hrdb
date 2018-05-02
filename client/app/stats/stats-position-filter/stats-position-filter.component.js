'use strict';

(function () {

  const StatsPositionFilterComponent = {
    bindings: {
      selectedPositionsIds: '<',
      positionsAvailable: '<',
      onPositionsSelectionChange: '&'
    },
    templateUrl: 'app/stats/stats-position-filter/stats-position-filter.html',
    controller: class StatsPositionFilterComponent {

      $onInit() {
        this.positionsAvailableIds = this.getPositionsIds(this.positionsAvailable);
      }

      onChange() {
        this.onPositionsSelectionChange({
          $event: {
            selectedPositionsIds: this.selectedPositionsIds
          }
        });
      }

      getPositionsIds(positions) {
        if (typeof positions === 'object' && positions !== null) {
          return Object.keys(positions);
        } else {
          return [];
        }
      }

    }
  };

  angular
      .module('hrDbApp.stats')
      .component('statsPositionFilter', StatsPositionFilterComponent);

})();
