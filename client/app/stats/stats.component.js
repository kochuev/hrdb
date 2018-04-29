angular
    .module('hrDbApp.stats')
    .component('stats', {
        bindings: {
            positions: '<',
            agencies: '<',
            origins: '<',
            statsByMonth: '<',
            statsByAgency: '<',
            statsByOrigin: '<'
        },
        templateUrl: 'app/stats/stats.html',
        controller: 'StatsController'
    });