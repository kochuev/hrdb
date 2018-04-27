'use strict';

describe('Controller: CandidateListController', function() {

  // load the controller's module
  beforeEach(module('hrDbApp'));
  beforeEach(module('stateMock'));
  beforeEach(module('socketMock'));
  beforeEach(module('modalMock'));

  var scope;
  var CandidateListController;
  var state;
  var $httpBackend;
  var Modal;

  var agencies;
  var positions;
  var candidatesObj;


  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $controller, $rootScope, $state, _Modal_, _$cookies_) {
    $httpBackend = _$httpBackend_;
    Modal = _Modal_;
    scope = $rootScope.$new();
    state = $state;
    agencies = [{_id: '1', name: 'Global Recruiting'},{_id: '2', name: 'Happy Recruiting'}];
    positions = [{_id: '1', name: 'PHP developer'},{_id: '2', name: 'Sales Manager'}];
    candidatesObj = {data: [
      {
        _id: '1',
        pending: 1,
        lastVisitDate: new Date(2016, 6, 6),
        _lastVisitPosition: '1',
        _lastVisitAgency: '2',
        interviewStatus: ['cv'],
        firstName: 'Alex',
        lastName: 'Alexandrov'
      },
      {
        _id: '2',
        pending: 1,
        lastVisitDate: new Date(2016, 6, 5),
        _lastVisitPosition: '2',
        _lastVisitAgency: '1',
        interviewStatus: ['skype', new Date(2016, 6, 6, 21)],
        firstName: 'Alex',
        lastName: 'Ivanov'
      },
      {
        _id: '3',
        pending: 0,
        lastVisitDate: new Date(2016, 1, 1),
        _lastVisitPosition: '1',
        _lastVisitAgency: null,
        interviewStatus: ['cv'],
        firstName: 'Petr',
        lastName: 'Pyatochkin'
      }
    ]};

    _$cookies_.remove('list.filter');

    CandidateListController = $controller('CandidateListController', {
      $scope: scope,
      agencies: agencies,
      positions: positions,
      candidatesObj: candidatesObj,
      Modal: Modal,

    });
  }));

  // Verify that there are no outstanding expectations or requests after each test
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should remove candidate on removeCandidate', function() {
    $httpBackend.expectDELETE('/api/candidates/3').respond(204, '');
    spyOn(Modal.confirm, 'delete').and.callThrough();
    CandidateListController.removeCandidate(candidatesObj.data[2]);
    expect(Modal.confirm.delete).toHaveBeenCalled();
    $httpBackend.flush();
    expect(CandidateListController.candidates.length).toBe(2);
    expect(CandidateListController.filteredCandidates.length).toBe(2);
  });

  /*it('should filter candidates list by first name', function() {
    CandidateListController.filter.query.firstName = 'Al';
    scope.$digest();
    expect(CandidateListController.filteredCandidates.length).toBe(2);
  });

  it('should filter candidates list by last name', function() {
    CandidateListController.filter.query.lastName = 'Iv';
    scope.$digest();
    expect(CandidateListController.filteredCandidates.length).toBe(1);
  });*/

  it('should filter candidates list by last visit position', function() {
    CandidateListController.filter.query._lastVisitPosition = '1';
    scope.$digest();
    expect(CandidateListController.filteredCandidates.length).toBe(2);
  });

  it('should filter candidates list by pending visit status', function() {
    CandidateListController.filter.query.pending = '!1';
    scope.$digest();
    expect(CandidateListController.filteredCandidates.length).toBe(1);
  });
});
