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


let data = {};
Origin.find({})
    .remove()
    .then(() => Origin.create({
        name: 'Test origin'
    }))
    .then((origins) => {
        console.log('finished populating origins');
        data.origins = origins;
    })
    .then(() => Position.find({}).remove())
    .then(() => Position.create({
        'name': 'Symfony developer'
    },{
        'name': 'Angular developer'
    },{
        'name': 'React developer'
    },{
        'name': 'IT recruiter'
    }))
    .then(() => {
        console.log('finished populating positions');
    })
    .then(() => Position.find({}))
    .then((positions) => {
        data.positions = positions;
    })
    .then(() => Agency.find({}).remove())
    .then(() => Agency.create({
        name: 'Test agency'
    }))
    .then((agencies) => {
        console.log('finished populating agencies');
        data.agencies = agencies;
        console.log(data);
    })
    .then(() => Candidate.find({}).remove())
    // TODO: Add candidates using data object
    /*.then(() => Candidate.create({
        firstName: 'Name example',
        lastName: 'Last name example',
        email: 'candidate@email.com',
        visits: [{
            general: {
                date: new Date('01/20/2018'),
                _agency: 'Test agency',
                _position: 'Symfony developer',
                _origin: 'Test origin'
            }
        }]
    }))*/;