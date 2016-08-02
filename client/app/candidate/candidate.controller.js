'use strict';

(function() {

class CandidateController {

  constructor($filter, $http, $state, $stateParams, $scope, $q, Modal, Search, candidateObj) {
    this.$filter = $filter;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.Search = Search;
    this.$q = $q;

    this.spinner = false;

    this.personInfoForm = null;

    this.candidate = candidateObj.data;

    this.candidateMayExistsAs = [];

    this.removeVisit = Modal.confirm.delete((index) => {
      this.candidate.visits.splice(index, 1);
    });

    this.onStateChangeOff = $scope.$on('$stateChangeStart', (event, toState, toParams) => {
        if (this.isDirty()) {
          event.preventDefault();
          Modal.confirm.pageLeave(() => {
            this.onStateChangeOff();
            this.$state.go(toState, toParams);
          })('You have unsaved changes');
        }
    });

    $scope.$watch(() => this.candidate.visits, () => {
      this.candidate.visits.sort((a,b) => {
        if (a.general.date > b.general.date)
          return 1;
        else if (a.general.date < b.general.date)
          return -1;
        else
          return 0;
      });
    }, true);
  }

  save(backToList) {
    this.spinner = true;
    this.candidateMayExistsAs = null;

    if (this.$state.is('candidate.new')) {
      this.$http.post('/api/candidates', this.candidate).then(response => {
        this.setPristine();
        if (backToList)
          this.$state.go('candidate.list');
        else
          this.$state.go('candidate.details', {id: response.data._id});
      });
    } else if (this.$state.is('candidate.details')) {
      this.$http.put('/api/candidates/' + this.$stateParams.id, this.candidate).then(response => {
        this.setPristine();
        if (backToList) {
          this.$state.go('candidate.list');
        } else {
          this.candidate = response.data;
          this.spinner = false;
        }
      });
    }
  }

  checkIfCandidateMayExist() {
    var allIdFieldsAreEmpty = ['lastName', 'email', 'skypeId'].every(elm => !this.candidate[elm]);
    var allIdFieldsArePristine = ['firstName', 'lastName', 'email', 'skypeId'].every(elm => this.personInfoForm[elm].$pristine);

    if (allIdFieldsAreEmpty || allIdFieldsArePristine) {
      this.candidateMayExistsAs = [];
      return;
    }

    this.$q
      .all([this.Search.getPossibleDuplicatesByName(this.candidate), this.Search.getPossibleDuplicatesByContactDetails(this.candidate)])
      .then(possibleDuplicates => {
        return _.flatten(possibleDuplicates);
      })
      .then(possibleDuplicatesFlat => {
        return _.uniq(possibleDuplicatesFlat, elm => elm._id);
      })
      .then(possibleDuplicatesUniq => {
        this.candidateMayExistsAs = possibleDuplicatesUniq;
      });

  }

  addVisit() {
    this.candidate.visits.push({
      general: {
        'date': new Date()
      },
      skype: {
        planned: false
      },
      office: {
        planned: false
      },
      proposal: {
        done: false
      },
      active: true,
      closed: false
    });
  }

  rejectVisit(visit) {
    visit.closed = 'rejected';
  }

  hireVisit(visit) {
    visit.closed = 'hired';
  }

  reopenVisit(visit) {
    visit.closed = false;
  }

  hasOpenVisits() {
    return this.$filter('hasOpenVisits')(this.candidate.visits);
  }

  isValid() {
    if (this.personInfoForm.$invalid)
      return false;

    for (var i = 0; i < this.candidate.visits.length; i++ ) {
      if (this.candidate.visits[i].isValid === undefined || !this.candidate.visits[i].isValid())
        return false;
    }

    return true;
  }

  isDirty() {
    if (this.personInfoForm.$dirty)
      return true;

    for (var i = 0; i < this.candidate.visits.length; i++ ) {
      if (this.candidate.visits[i].isDirty === undefined || this.candidate.visits[i].isDirty())
        return true;
    }

    return false;
  }

  setPristine() {
    this.personInfoForm.$setPristine();
    for (var i = 0; i < this.candidate.visits.length; i++ ) {
      if (this.candidate.visits[i].setPristine !== undefined)
        this.candidate.visits[i].setPristine()
    }

  }

}

angular.module('hrDbApp')
  .controller('CandidateController', CandidateController);
})();
