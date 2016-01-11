'use strict';

angular.module('hrDbApp')
  .filter('hasOpenVisits', function() {
    return function(input) {
      input = input || [];
      for (var i = 0; i < input.length; i++) {
        if (input[i].closed === false || input[i].closed === undefined)
          return true;
      }
      return false;
    };
  });
