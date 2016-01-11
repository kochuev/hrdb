'use strict';

(function() {

class CandidateController {

  constructor($filter, $http, $state, $stateParams, $scope, Modal, candidateObj) {
    this.$filter = $filter;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;

    this.spinner = false;

    this.candidate = candidateObj.data;

    this.removeVisit = Modal.confirm.delete((index) => {
      this.candidate.visits.splice(index, 1);
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

    if (this.$state.is('candidate.new')) {
      this.$http.post('/api/candidates', this.candidate).then(response => {
        if (backToList)
          this.$state.go('candidate.list');
        else
          this.$state.go('candidate.details', {id: response.data._id});
      });
    } else if (this.$state.is('candidate.details')) {
      this.$http.put('/api/candidates/' + this.$stateParams.id, this.candidate).then(() => {
        if (backToList)
          this.$state.go('candidate.list');
        else
          this.spinner = false;
      });
    }
  }

  addVisit() {
    this.candidate.visits.push({
      general: {
        'date': new Date()
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
    //console.log(this.$filter('hasOpenVisits')(this.candidate.visits));
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

}

angular.module('hrDbApp')
  .controller('CandidateController', CandidateController);
})();
