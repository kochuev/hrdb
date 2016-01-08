'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Candidates',
    'state': 'candidate.list'
  },
  {
    'title': 'Agency',
    'state': 'entity.agency'
  },
  {
    'title': 'Job Positions',
    'state': 'entity.position'
  },
  {
    'title': 'Origins',
    'state': 'entity.origin'
  }];

  isCollapsed = false;
  //end-non-standard

  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

angular.module('hrDbApp')
  .controller('NavbarController', NavbarController);
