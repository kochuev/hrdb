/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Origin from '../api/candidate/origin.model';
import Position from '../api/candidate/position.model';
import Agency from '../api/candidate/agency.model';
import Candidate from '../api/candidate/candidate.model';
import moment from 'moment';

Thing.find({}).removeAsync()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
             'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
             'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
             'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
             'tests alongside code. Automatic injection of scripts and ' +
             'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
             'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
             'payload, minifies your scripts/css/images, and rewrites asset ' +
             'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
             'and openshift subgenerators'
    });
  });

User.find({}).removeAsync()
  .then(() => {
    User.createAsync({
      provider: 'local',
      name: 'Test User',
      email: 'test@example.com',
      password: 'test',
      active: true
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin',
      active: true
    })
    .then(() => {
      console.log('finished populating users');
    });
  });


// TODO: find out if there is any reason to use methodAsync, mongoose model.remove() for example return Query,
// TODO: it is not a Promise, but it has .then() and can be use as Promise */


let seedCollection = function (Collection, items){

    return Collection.find({})
        .remove()
        .then(() => Collection.create(items));

};


let seedCandidates = function(){

    let candidates = [];
    let dates = [
        //Jan
        '01/06/2018', '01/07/2018', '01/08/2018', '01/09/2018', '01/10/2018',
        // March
        '03/01/2018', '03/02/2018', '03/03/2018', '03/04/2018', '03/05/2018',
        '03/06/2018', '03/07/2018', '03/08/2018', '03/09/2018', '03/10/2018',
        '03/11/2018', '03/12/2018', '03/13/2018', '03/14/2018', '03/15/2018',
        '03/16/2018', '03/17/2018', '03/18/2018', '03/19/2018', '03/20/2018',

        // April
        '04/06/2018', '04/07/2018', '04/08/2018', '04/09/2018', '04/10/2018',
        '04/11/2018', '04/12/2018', '04/13/2018', '04/14/2018', '04/15/2018',

        // May
        '05/06/2018', '05/07/2018', '05/08/2018', '05/09/2018', '05/10/2018',
        '05/11/2018', '05/12/2018', '05/13/2018', '05/14/2018', '05/15/2018',
    ]
        .map(dateStr => new Date(dateStr));

    Promise.all([
        Agency.find({}),
        Position.find({}),
        Origin.find({})
    ])
        .then((values) => {
            // TODO: Is there better way then rely on order and indexes?
            let agencies = values[0];
            let positions = values[1];
            let origins = values[2];

            // TODO: Make sure these nested loops are best solution
            dates.forEach(date => {
                agencies.forEach(agency => {
                    positions.forEach(position => {
                        origins.forEach(origin => {

                            let formattedDate = moment(date).format('MM/DD/YYYY');
                            candidates.push({
                                firstName: `James (${position.name}/${formattedDate}/${agency.name}/${origin.name})`,
                                lastName: 'Bond',
                                visits: [{
                                    general: {
                                        date: date,
                                        _agency: agency._id,
                                        _position: position._id,
                                        _origin: origin._id
                                    },
                                    active: true
                                }]
                            });

                        });
                    });
                });
            });

            return seedCollection(Candidate, candidates);
        });


};


Promise.all([
    seedCollection(Origin, [{name: 'Test origin'}]),
    seedCollection(Agency, [{name: 'Test Agency'}]),
    seedCollection(Position, [{
        'name': 'Symfony developer'
    },{
        'name': 'Angular developer'
    },{
        'name': 'React developer'
    },{
        'name': 'IT recruiter'
    }])
])
    .then(() => seedCandidates())
    .then(() => {
        console.log('Finished populating Origin, Agency, Position, Candidate');
    });