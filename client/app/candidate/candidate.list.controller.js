'use strict';

(function() {

class CandidateListController {

  constructor($http, $state, $scope, $cookies, Modal, candidatesObj, agencies, positions, appConfig) {
    this.$http = $http;
    this.$cookies = $cookies;
    this.Modal = Modal;

    this.state = $state;

    this.candidates = candidatesObj.data;
    this.agencies = agencies;
    this.positions = positions;
    this.appConfig = appConfig;

    // Limit
    this.limit = this.$cookies.get('list.limit');
    if (!this.limit)
        this.limit = this.appConfig.listPageSize;

    $scope.$watch(() => this.limit, () => {
      this.$cookies.put('list.limit', this.limit);
    });

    // Query filter
    this.query = this.$cookies.getObject('list.query');
    if (!this.query)
        this.query = {};

    $scope.$watch(() => this.query, () => {
      this.$cookies.putObject('list.query', this.query);
    }, true);

    //Sorting
    this.sort = this.$cookies.getObject('list.sort');
    if (!this.sort) {
      this.sort = {
        field: this.sortByLastVisitDate,
        reverse: true
      };
    }

    $scope.$watch(() => this.sort, () => {
      this.$cookies.putObject('list.sort', this.sort);
    }, true);

  }

  removeFilters() {
    this.query = {};

    this.limit = this.appConfig.listPageSize;

    this.sort = {
      field: this.sortByLastVisitDate,
      reverse: true
    };
  }

  sortByLastVisitDate(candidate) {
    if  (candidate.lastVisitDate)
      return candidate.lastVisitDate.getTime();
    else
      return 0;
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
