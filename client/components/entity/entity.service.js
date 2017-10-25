'use strict';

angular.module('hrDbApp')
  .factory('Entity', function ($http, $q) {
    var entityCache = [];

      /**
       * Return all kinds of entities
       * @param entity {String}
       * @return {Array}
       */
    function getEntities(entity) {
        var deferred = $q.defer();
        deferred.resolve(entityCache[entity]);
        return deferred.promise
          .then(entities => {
            if (entities !== undefined) {
              return entities;
            } else {
              return $http.get('/api/entities/' + entity)
                .then(response => {
                  entityCache[entity] = {};
                  for (var i = 0; i < response.data.length; i++) {
                    entityCache[entity][response.data[i]._id] = response.data[i];
                  }
                  return entityCache[entity];
                });
            }
          })
          ;
    }

    // Public API here
    return {
      /**
       * Retrieves all agencies
       * @return {Promise}
       */
      getAgencies() {
        return getEntities('agency');
      },
      /**
       * Retrieves all positions
       * @return {Promise}
       */
      getPositions() {
        return getEntities('position');
      },
      /**
       * Retrieves all origins
       * @return {Promise}
       */
      getOrigins() {
        return getEntities('origin');
      }
    };
  });
