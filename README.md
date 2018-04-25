# app

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 3.1.1.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7 (Won't work with latest versions)
- [Bower](bower.io) (`npm install --global bower`)
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/) (^3.6.4) - Keep a running daemon with `mongod`

### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Add `127.0.0.1       hrdbmongo` in your hosts file

4. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

5. In order to populate DB set `seedDB` to true in `/server/config/environment/development.js`

5. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

Login with username `admin@example.com` and password `admin`

## Testing

Running `npm test` will run the unit tests with karma.
