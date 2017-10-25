'use strict';

(function() {

class UserDetailsController {
  constructor(User, Modal, $http, $scope, $state, userObj) {
    this.Modal = Modal;
    this.User = User;
    this.$state = $state;
    this.user = userObj.data;
    this.user.changePasswordFlag = false;
    this.user.limitedPositionsFlag = this.user.positionsAccess && this.user.positionsAccess.length > 0;

    this.success = false;

    $scope.$watch(() => this.user.limitedPositionsFlag, () => {
      if (!this.user.limitedPositionsFlag) {
        this.user.positionsAccess = [];
      }
    });

    $http.get('/api/entities/position').then(response => {
      this.positions = response.data;
    });

  }

  togglePositionsSelection(positionId) {
    let pos = this.user.positionsAccess.indexOf(positionId);
    if (pos === -1) {
      this.user.positionsAccess.push(positionId);
    } else {
      this.user.positionsAccess.splice(pos,1);
    }
  }

  saveUser(form) {
    this.submitted = true;

    if (form.$valid) {
      this.User.update(this.user).$promise
        .then(() => {
          // Account created, redirect to home
          this.$state.go('admin.userlist');
          this.success = true;
        })
        .catch(err => {
          err = err.data;
          this.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });
    }
  }

  // delete(user) {
  //   this.Modal.confirm.delete(() => {
  //     user.$remove();
  //     this.users.splice(this.users.indexOf(user), 1);
  //   })(user.name);
  // }
  //
  // toggleActivation(user) {
  //   user.$toggleActivation();
  //   user.active = !user.active;
  // }
}

angular.module('hrDbApp.admin')
  .controller('UserDetailsController', UserDetailsController);

})();
