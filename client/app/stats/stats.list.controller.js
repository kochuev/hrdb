'use strict';

(function() {

class StatsListController {

  constructor(positions, Auth) {
    let positionsAccess = Auth.getCurrentUser().positionsAccess;
    if (Auth.hasRole("admin") || positionsAccess === undefined || positionsAccess.length === 0) {
      this.positions = positions;
    } else {
      this.positions = [];
      for (let pos of positionsAccess) {
        if (positions[pos] !== undefined) {
          this.positions.push(positions[pos]);
        }
      }
    }
  }

}

angular.module('hrDbApp.stats')
  .controller('StatsListController', StatsListController);

})();
