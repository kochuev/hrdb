(function(angular, undefined) {
'use strict';

angular.module('hrDbApp.constants', [])

.constant('appConfig', {
  userRoles:['guest','user','admin'],
  listPageSize: 2
})

;
})(angular);
