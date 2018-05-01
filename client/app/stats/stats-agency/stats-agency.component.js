'use strict';

(function() {

  const StatsAgencyComponent = {
    bindings: {
      statsByAgency: '<',
      agencies: '<'
    },
    templateUrl: 'app/stats/stats-agency/stats-agency.html'
  };

  angular
      .module('hrDbApp.stats')
      .component('statsAgency', StatsAgencyComponent);

})();