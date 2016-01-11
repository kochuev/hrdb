'use strict';

(function() {

class CandidateListController {

  constructor($http, $state, Modal) {
    this.$http = $http;
    this.Modal = Modal;

    this.state = $state;

    this.candidates = [];

    this.limit = 50;

    this.query = {};
    this.sort = {field: 'lastName', reverse: false};

    $http.get('/api/candidates/').then(response => {
      this.candidates = response.data;
    });

    $http.get('/api/entities/agency').then(response => {
      this.agencies = {};
      for (var i = 0; i < response.data.length; i++)
      {
          this.agencies[response.data[i]._id] =  response.data[i];
      }
    });

  }

  loadMore(amount) {
    this.limit += amount;
  }

  sortParam(field) {
    this.sort.reverse = (this.sort.field === field) ? !this.sort.reverse : false;
    this.sort.field = field;
  }

  removeCandidate(candidate) {
    this.Modal.confirm.delete(() => {
      this.$http.delete('/api/candidates/' + candidate._id).then(() => {
        var index = this.candidates.indexOf(candidate);
        if (index > -1) {
          this.candidates.splice(index, 1);
        }
      });
    })('candidate ' + candidate.firstName + ' ' + candidate.lastName);
  }
}

angular.module('hrDbApp')
  .controller('CandidateListController', CandidateListController);

})();
