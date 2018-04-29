'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Candidates',
    'state': 'candidate.list'
  },
  {
    'title': 'Statistics',
    'state': 'stats'
  }];

  menuAdmin = [{
    'title': 'Agencies',
    'state': 'entity.agency'
  },
  {
    'title': 'Job Positions',
    'state': 'entity.position'
  },
  {
    'title': 'Origins',
    'state': 'entity.origin'
  },
  {
    'title': 'Admin',
    'state': 'admin.userlist'
  }];

  isCollapsed = true;
  //end-non-standard

  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

angular.module('hrDbApp')
  .controller('NavbarController', NavbarController);
