'use strict';

class VisitController {
   constructor($http, $timeout, $state, Upload) {
     this.$http = $http;
     this.$timeout = $timeout;
     this.$state = $state;
     this.Upload  = Upload;

     this.uploadedCv = null;

     $http.get('/api/entities/agency').then(response => {
       this.agencies = response.data;
     });

     $http.get('/api/entities/position').then(response => {
       this.positions = response.data;
     });

     $http.get('/api/entities/origin').then(response => {
       this.origins = response.data;
     });

     this.visit.isValid = () => {
       return this.visitInfoForm.$valid;
     };

     this.visit.isDirty = () => {
       return this.visitInfoForm.$dirty;
     };

     this.visit.setPristine = () => {
       this.visitInfoForm.$setPristine();
     };


   }

  uploadCv(file) {
    if (!file) return;

    if ((this.$state.is('candidate.new') || this.uploadedCv) && this.visit.general.uploadedCvId)
      this.$http.delete('/api/files/' + this.visit.general.uploadedCvId);

    this.uploadedCv = file;

    file.upload = this.Upload.upload({
      url: '/api/files',
      data: {file: file, candidateName: this.candidateName}
    });

    file.upload.then(
      (response) => {
        this.$timeout(() => {
          file.result = response.data;
          this.visit.general.uploadedCvId = file.result.id;
          file.progress = null;
        });
      },
      null,
      (evt) => {
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      }
    );
  }
}

angular.module('hrDbApp')
  .controller('VisitController', VisitController);
