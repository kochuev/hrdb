'use strict';

angular.module('modalMock', [])
  .factory('Modal', function() {
    return {
      confirm: {
        delete: function (cb = angular.noop) {
          return () => {
            cb()
          }
        },
        pageLeave: function (cb = angular.noop) {
          return () => {
            cb()
          }
        }
      }
    };
  });
