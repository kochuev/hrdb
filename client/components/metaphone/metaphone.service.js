'use strict';

angular.module('hrDbApp.metaphone')
  .factory('Metaphone', function (appConfig, Translit, metaphoneLib) {

    // Public API here
    return {
      process(str) {
        return metaphoneLib(Translit.process(str));
      }
    };
  });
