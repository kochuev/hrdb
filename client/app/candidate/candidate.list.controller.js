'use strict';

(function() {

class CandidateListController {

  constructor($http, $state, $scope, $cookies, $filter, Modal, candidatesObj, agencies, positions, appConfig) {
    this.$http = $http;
    this.$cookies = $cookies;
    this.$filter = $filter;
    this.$scope = $scope;
    this.Modal = Modal;

    this.state = $state;

    this.candidates = candidatesObj.data;

    for(let candidate of this.candidates) {
      candidate.lastNameMFN = metaphone(translit(candidate.lastName));
      candidate.firstNameMFN = metaphone(translit(candidate.firstName));
    }

    this.filteredCandidates = this.candidates;
    this.filteredCandidatesLength = this.filteredCandidates.length;
    this.agencies = agencies;
    this.positions = positions;
    this.appConfig = appConfig;

    this.initFilters();
  }

  initFilters() {
    var defaultFilter = this.getDefaultFilter();

    // restoring filter from cookie
    this.filter = this.$cookies.getObject('list.filter');

    // Setting defaults
    if (this.filter) {
      this.filter.limit = this.filter.limit ? this.filter.limit : defaultFilter.limit;
      this.filter.query = this.filter.query ? this.filter.query : defaultFilter.query;
      this.filter.sort = this.filter.sort ? this.filter.sort : defaultFilter.sort;
    } else {
      this.filter = defaultFilter;
    }

    var filterCandidates = () => {
      this.$cookies.putObject('list.filter', this.filter);

      var query = angular.copy(this.filter.query);
      if (query.firstName) {
        query.firstNameMFN = metaphone(translit(query.firstName));
        query.firstName = undefined;
      }
      if (query.lastName) {
        query.lastNameMFN = metaphone(translit(query.lastName));
        query.lastName = undefined;
      }

      this.filteredCandidates = this.$filter('filter')(this.candidates, query);
      this.filteredCandidates = this.$filter('orderBy')(this.filteredCandidates, this.filter.sort.field, this.filter.sort.reverse);
      this.filteredCandidatesLength = this.filteredCandidates.length;
      this.filteredCandidates = this.$filter('limitTo')(this.filteredCandidates, this.filter.limit);
    }

    // Applying filters
    this.$scope.$watch(() => this.filter, filterCandidates , true);
    this.$scope.$watch(() => this.candidates.length, filterCandidates , true);
  }

  removeFilters() {
    this.filter = this.getDefaultFilter();
  }

  getDefaultFilter() {
    var defaultFilter = {};

    defaultFilter.query = {};
    defaultFilter.limit = this.appConfig.listPageSize;
    defaultFilter.sort = {
      field: 'lastVisitDate.getTime()',
      reverse: true
    };

    return defaultFilter;
  }

  loadMore(amount) {
    this.filter.limit += amount;
  }

  sortParam(field) {
    this.filter.sort.reverse = (this.filter.sort.field === field) ? !this.filter.sort.reverse : false;
    this.filter.sort.field = field;
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
