'use strict';

angular.module('hrDbApp', [
    'hrDbApp.auth',
    'hrDbApp.admin',
    'hrDbApp.stats',
    'hrDbApp.constants',
    'hrDbApp.metaphone',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'btford.socket-io',
    'ui.router',
    'ui.bootstrap',
    'validation.match',
    'ngFileUpload',
    'angularSpinner',
    'angularMoment'
  ])
  .config(function ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .config(function ($httpProvider) {

    var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

    function convertDateStringsToDates(input) {
      // Ignore things that aren't objects.
      if (typeof input !== "object") return input;

      for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        // TODO: Improve this regex to better match ISO 8601 date strings.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
          // Assume that Date.parse can parse ISO 8601 strings, or has been shimmed in older browsers to do so.
          var milliseconds = Date.parse(match[0]);
          if (!isNaN(milliseconds)) {
            input[key] = new Date(milliseconds);
          }
        } else if (typeof value === "object") {
          // Recurse into object
          convertDateStringsToDates(value);
        }
      }
    }

    $httpProvider.defaults.transformResponse.push(function (responseData) {
      convertDateStringsToDates(responseData);
      return responseData;
    });
  })
  .run(amMoment => {
    amMoment.changeLocale('en', {
      longDateFormat : {
        LTS  : 'HH:mm:ss',
        LT   : 'HH:mm',
        L    : 'MM.DD.YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY HH:mm',
        LLLL : 'dddd, MMMM D, YYYY HH:mm'
      }
    });
  });

