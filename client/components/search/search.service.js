'use strict';

angular.module('hrDbApp')
  .factory('Search', function ($http, $q) {
    /**
     * Search by different mongo criterias
     * @param query {Object}
     * @return {Array}
     */
    function search(query) {
      return $http.post('/api/candidates/find', query)
        .then(response => {
          if (response.status == 404) {
            return [];
          } else {
            return response.data;
          }
        });
    }

    // Public API here
    return {

      /**
       * Retrieves possible duplicates by name
       * @param candidate {Object}
       * @return {Promise}
       */
      getPossibleDuplicatesByName(candidate) {
        if (!candidate.lastName)
          return $q.when([]);

        var req = {
          query: {
            firstName: candidate.firstName,
            lastName: candidate.lastName
          }
        };

        if (candidate._id)
          req.query._id  = {'$ne': candidate._id};

        return search(req);
      },

      /**
       * Retrieves possible duplicates by contact details
       * @param candidate {Object}
       * @return {Promise}
       */
      getPossibleDuplicatesByContactDetails(candidate) {
        if (!candidate.email && !candidate.skypeId)
          return $q.when([]);

        var req = {
          query: {
            $or:[
            ]
          }
        };

        if (candidate.email)
          req.query.$or.push({email: candidate.email});
        if (candidate.skypeId)
          req.query.$or.push({skypeId: candidate.skypeId});


        if (candidate._id)
          req.query._id  = {'$ne': candidate._id};

        return search(req);
      }
    };
  });
