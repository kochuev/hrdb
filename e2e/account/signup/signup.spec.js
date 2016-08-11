'use strict';

var config = browser.params;
var UserModel = require(config.serverConfig.root + '/server/api/user/user.model');

describe('Signup View', function() {
  var page;

  var loadPage = function() {
    browser.manage().deleteAllCookies();
    browser.get(config.baseUrl + '/signup');
    page = require('./signup.po');
  };

  var testUser = {
    name: 'Test',
    email: 'test@example.com',
    password: 'test',
    confirmPassword: 'test'
  };

  beforeEach(function() {
    loadPage();
  });

  it('should include signup form with correct inputs and submit button', function() {
    expect(page.form.name.getAttribute('type')).toBe('text');
    expect(page.form.name.getAttribute('name')).toBe('name');
    expect(page.form.email.getAttribute('type')).toBe('email');
    expect(page.form.email.getAttribute('name')).toBe('email');
    expect(page.form.password.getAttribute('type')).toBe('password');
    expect(page.form.password.getAttribute('name')).toBe('password');
    expect(page.form.confirmPassword.getAttribute('type')).toBe('password');
    expect(page.form.confirmPassword.getAttribute('name')).toBe('confirmPassword');
    expect(page.form.submit.getAttribute('type')).toBe('submit');
    expect(page.form.submit.getText()).toBe('Sign up');
  });

  describe('with local auth', function() {

    beforeAll(function(done) {
      UserModel.removeAsync().then(done);
    });

    it('should signup a new user in deactivated state and show appropriate message', function() {
      page.signup(testUser);

      expect(element(by.css('.alert.alert-success')).isDisplayed()).toBeTruthy();

      var checkUserCreated = function () {
        var deferred = protractor.promise.defer();

        // Verify that an account has been created
        UserModel.findAsync({email: testUser.email})
          .then(foundUsers => {
            expect(foundUsers.length).toBe(1);
            return foundUsers
          })
          .catch(err => {
            fail(err);
          })
          .finally(() => {
            return deferred.fulfill();
          })

        return deferred.promise;
      };

      browser.controlFlow().execute(checkUserCreated);
    });

    it('should indicate signup failures', function() {
      page.signup(testUser);

      expect(browser.getCurrentUrl()).toBe(config.baseUrl + '/signup');
      expect(page.form.email.getAttribute('class')).toContain('ng-invalid-mongoose');

      var helpBlock = page.form.element(by.css('.form-group.has-error .help-block.ng-binding'));
      expect(helpBlock.getText()).toBe('The specified email address is already in use.');
    });

  });
});
