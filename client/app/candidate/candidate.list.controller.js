'use strict';

(function() {

class CandidateListController {

  constructor($http, $state, Modal) {
    var vm = this;
    this.$http = $http;
    this.Modal = Modal;

    vm.state = $state;

    vm.candidates = [];

    vm.limit = 50;

    vm.query = {};
    vm.sort = {field: 'lastName', reverse: false};

    $http.get('/api/candidates/').then(response => {
      vm.candidates = response.data;
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
