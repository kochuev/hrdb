'use strict';

(function() {

  const StatsOriginComponent = {
    bindings: {
      statsByOrigin: '<',
      origins: '<'
    },
    templateUrl: 'app/stats/stats-origin/stats-origin.html'
  };

  angular
      .module('hrDbApp.stats')
      .component('statsOrigin', StatsOriginComponent);

})();
