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
        }

        $onInit() {
          // Question: Does it make sense to define first 4?
          this.monthlyChart = undefined;
          this.statsByAgency = undefined;
          this.statsByOrigin = undefined;
          this.startDate = undefined;
          this.endDate = '05-15-2018';
          this.positions = [];
          this.updateStats();
        }

        updateStatsWithNewDates(event) {
          this.startDate = event.startDate;
          this.endDate = event.endDate;
          this.updateStats();
        }

        updateStatsWithNewPositions(event) {
          this.positions = event.positions;
          this.updateStats();
        }

        updateStats() {
          const params = {
            startDate: this.startDate,
            endDate: this.endDate,
            positions: this.positions
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

