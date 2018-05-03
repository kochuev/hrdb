'use strict';

(function () {

  const StatsDateFilterComponent = {
    bindings: {
      startDate: '<',
      endDate: '<',
      onDatesChanged: '&'
    },
    templateUrl: 'app/stats/stats-date-filter/stats-date-filter.html',
    controller: class StatsDateFilterComponent {

      constructor() {
        this.beginningOfHistory = moment('05-04-2001', 'DD/MM/YYYY');
        this.datePicker = {
          date: {
            startDate: this.startDate,
            endDate: this.endDate
          },
          options: {
            ranges: {
              'This Month': [
                moment().startOf('month'),
                moment().endOf('month')
              ],
              'Last Month': [
                moment().subtract(1, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
              ],
              'Last 6 Months': [
                moment().subtract(6, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
              ],
              'This Year': [
                moment().startOf('year'),
                moment().endOf('year')
              ],
              'Last Year': [
                moment().subtract(1, 'year').startOf('year'),
                moment().subtract(1, 'year').endOf('year')
              ],
              'All time': [
                this.beginningOfHistory,
                moment()
              ]
            },
            alwaysShowCalendars: false,
            opens: 'left',
            eventHandlers: {
              'apply.daterangepicker': (event) => {
                this.onChangeDaterangepicker(event);
              },
              'cancel.daterangepicker': (event) => {
                this.onChangeDaterangepicker(event);
              }
            }
          }
        };

      }

      onChange() {
        this.onDatesChanged({
          $event: {
            startDate: this.datePicker.date.startDate,
            endDate: this.datePicker.date.endDate
          }
        });
      }

      onChangeDaterangepicker(event) {
        this.onDatesChanged({
          $event: {
            startDate: event.model.startDate,
            endDate: event.model.endDate
          }
        });
      }

    }
  };

  angular
      .module('hrDbApp.stats')
      .component('statsDateFilter', StatsDateFilterComponent);

})();
