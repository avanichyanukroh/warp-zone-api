 const express = require('express');
 const app = express();
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 8000;

const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');
const{UserProfile} = require('./models');

const jsonParser = bodyParser.json();
const config = require('./config');
const localAuth = passport.authenticate('local', {session: false});

mongoose.Promise = global.Promise;

app.use(morgan('common'));

router.use(express.json());

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

 router.post('/register', jsonParser, (req, res) => {

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

	return UserProfile.hashPassword(req.body.password)
		.then(function(hash) {
			return UserProfile.create({
				username: req.body.username,
				password: hash
				});
		})
		.then(function(user) {
			res.status(201).json(user);
		})
		.catch(function(error) {
			console.log(error);
		});
});

router.post('/login', localAuth, (req, res) => {

  const authToken = createAuthToken(req.user);
  res.json({'authToken': authToken, 'user': req.user});
});

 app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

 module.exports = {app};