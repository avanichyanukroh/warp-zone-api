 const express = require('express');
 const app = express();
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const cors = require('cors');
const {CLIENT_ORIGIN, DATABASE_URL, PORT} = require('./config');
const {GameProfile, UserProfile, WishList, PriceList} = require('./models');

const jsonParser = bodyParser.json();
const config = require('./config');
const localAuth = passport.authenticate('local', {session: false});

mongoose.Promise = global.Promise;

app.use(morgan('common'));

app.use(express.json());

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

 app.get('/api/*', (req, res) => {
   res.json({ok: true});
 });

 app.post('/register', jsonParser, (req, res) => {
  console.log(req.body);
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }
  console.log("validation pass");
	return UserProfile.hashPassword(req.body.password)
		.then(function(hash) {
      console.log("hashpassword pass");
			return UserProfile.create({
				username: req.body.username,
				password: hash
				})
  		.then(function(user) {
        console.log(user);
  			res.status(201).json(user);
  		})
  		.catch(function(error) {
  			console.log(error);
  		});
    });
});

app.post('/login', localAuth, (req, res) => {

  const authToken = createAuthToken(req.user);
  res.json({'authToken': authToken, 'user': req.user});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {

  runServer(DATABASE_URL).catch(err => console.error(err));
}

 module.exports = {app};