'use strict';

(function() {

class EntityController {

  constructor($http, $stateParams, Modal) {
    this.$http = $http;
    this.entities = [];
    this.title = $stateParams.title;
    this.backendUrl = '/api/entities/' + $stateParams.entity + '/';
    this.Modal = Modal;

    $http.get(this.backendUrl).then(response => {
      this.entities = response.data;
    });
  }

  addEntity() {
    if (this.newEntity) {
      this.$http.post(this.backendUrl, { name: this.newEntity }).then(response => {
        this.entities.push(response.data);
      });
      this.newEntity = '';
    }
  }

  deleteEntity(entity) {
    this.Modal.confirm.delete(() => {
      this.$http.delete(this.backendUrl + entity._id).then(response => {
        _.remove(this.entities, {_id: entity._id});
      });
    })(entity.name);
  }
}

angular.module('hrDbApp')
  .controller('EntityController', EntityController);

})();
