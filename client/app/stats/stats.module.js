'use strict';

angular
    .module('hrDbApp.stats', [
      'hrDbApp',
      'hrDbApp.auth',
      'ui.router',
      'chart.js'
    ])
    .config(function ($stateProvider) {
      $stateProvider.state({
        name: 'stats',
        url: '/stats?startDate&endDate&positions',
        params: {
          positions: {
            array: true
          },
          startDate: {
            array: false
          },
          endDate: {
            array: false
          }
        },
        component: 'stats',
        //Fixme: make this string work
        // authenticate: 'user',
        resolve: {
          'positions': (Entity) => Entity.getPositions(),
          'agencies': (Entity) => Entity.getAgencies(),
          'origins': (Entity) => Entity.getOrigins(),
          'statsByMonth': (StatsService, $stateParams) => StatsService.getStatsByMonth($stateParams),
          'statsByAgency': (StatsService, $stateParams) => StatsService.getStatsByAgency($stateParams),
          'statsByOrigin': (StatsService, $stateParams) => StatsService.getStatsByOrigin($stateParams)
        }
      })
    });
