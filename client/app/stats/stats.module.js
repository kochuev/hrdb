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
        url: '/stats',
        component: 'stats',
        //Fixme: make this string work, there is no docs for this 'authenticate'
        // authenticate: 'user',
        resolve: {
          'positions': (Entity) => Entity.getPositions(),
          'agencies': (Entity) => Entity.getAgencies(),
          'origins': (Entity) => Entity.getOrigins()
        }
      })
    });
