'use strict';

angular
    .module('hrDbApp.stats', [
      'hrDbApp',
      'hrDbApp.auth',
      'ui.router',
      'chart.js',
      'ui.select',
      'daterangepicker'
    ])
    .config(function ($stateProvider) {
      $stateProvider.state({
        name: 'stats',
        url: '/stats',
        component: 'stats',
        authenticate: 'user',
        resolve: {
          'positions': (Entity) => Entity.getPositions(),
          'agencies': (Entity) => Entity.getAgencies(),
          'origins': (Entity) => Entity.getOrigins()
        }
      })
    });
