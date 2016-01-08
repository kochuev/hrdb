'use strict';

angular.module('hrDbApp.auth', [
  'hrDbApp.constants',
  'hrDbApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
