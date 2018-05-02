'use strict';

angular
    .module('hrDbApp.stats')
    .component('stats', {
      bindings: {
        positions: '<',
        agencies: '<',
        origins: '<'
      },
      templateUrl: 'app/stats/stats.html',
      controller: class StatsComponent {
        constructor(StatsService) {
          'ngInject';
          this.StatsService = StatsService;

          this.monthlyChart = undefined;
          this.statsByAgency = undefined;
          this.statsByOrigin = undefined;
          this.startDateParam = undefined;
          this.endDateParam = '05-15-2018';
          this.positionsParam = [];

        }

        $onInit() {
          this.updateStats();
        }

        updateStatsWithNewDates(event) {
          this.startDateParam = event.startDate;
          this.endDateParam = event.endDate;
          this.updateStats();
        }

        updateStatsWithNewPositions(event) {
          this.positionsParam = event.positions;
          this.updateStats();
        }

        updateStats() {
          const params = {
            startDate: this.startDateParam,
            endDate: this.endDateParam,
            positions: this.positionsParam
          };

          this.updateStatsByMonth(params);
          this.updateStatsByAgency(params);
          this.updateStatsByOrigin(params);

        }

        updateStatsByMonth(params) {
          this.StatsService.getStatsByMonth(params)
              .then(statsByMonth => {
                this.monthlyChart = this.getMonthlyChart(statsByMonth.data);
              })
              .catch(this.errorHandeler);
        }

        updateStatsByAgency(params) {
          this.StatsService.getStatsByAgency(params)
              .then(statsByAgency => {
                this.statsByAgency = statsByAgency.data;
              })
              .catch(this.errorHandeler);
        }

        updateStatsByOrigin(params) {
          this.StatsService.getStatsByOrigin(params)
              .then(statsByOrigin => {
                this.statsByOrigin = statsByOrigin.data;
              })
              .catch(this.errorHandeler);
        }

        getMonthlyChart(statsByMonth) {

          let monthlyChart = {
            labels: [],
            data: []
          };

          for (let point of statsByMonth) {
            monthlyChart.labels.push(point.date.toLocaleString(navigator.language, {
              month: 'short',
              year: '2-digit'
            }));
            monthlyChart.data.push(point.total);
          }

          return monthlyChart;

        }

        errorHandeler(error) {
          console.warn(error);
          if (error.status === -1) {
            this.resetStatsData();
          }
        }

        resetStatsData(){
          this.monthlyChart = undefined;
          this.statsByAgency = undefined;
          this.statsByOrigin = undefined;
        }

      }
    });

