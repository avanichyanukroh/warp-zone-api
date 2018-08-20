 const express = require('express');
 const app = express();
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const localStrategy = require('./strategies');
const cors = require('cors');
const {CLIENT_ORIGIN, DATABASE_URL, PORT} = require('./config');
const {GameProfile, UserProfile, PriceList, CustomList} = require('./models');

const jsonParser = bodyParser.json();
const config = require('./config');
const localAuth = passport.authenticate('local', {session: false});

mongoose.Promise = global.Promise;

passport.use(localStrategy);

app.use(morgan('common'));

app.use(express.json());

app.use(cors({origin: CLIENT_ORIGIN}));

const createAuthToken = (user) => {
	return jwt.sign({user}, config.JWT_SECRET, {
		subject: user.username,
		expiresIn: config.JWT_EXPIRY,
		algorithm: 'HS256'
	});
};

 app.post('/register', jsonParser, (req, res) => {
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
		.then((hash) => {
			UserProfile.create({
				username: req.body.username,
				password: hash
		})
		.then(() => {
			return CustomList.create({
				"title": "Games Currently Playing",
				"content": "Enter your first game"
			});
		})
		.then((currentlyPlayingGamesList) => {
			return UserProfile.findOneAndUpdate(
				{"username": req.body.username},
				{$push:
					{"custom_list": currentlyPlayingGamesList}
				},
				{new: true}
			);
		})
		.then((user) => {
			res.status(201).json(user);
		})
		.catch((error) => {
			console.log(error);
		});
	});
});

app.post('/login', localAuth, (req, res) => {

	const authToken = createAuthToken(req.user);
	res.status(200).json({'authToken': authToken, 'user': req.user});
});

app.post('/addToWishlist', jsonParser, (req, res) => {
	return GameProfile.create({

		id: "id" in req.body ? req.body.id : null,
		name: "name" in req.body ? req.body.name : null,
		url: "url" in req.body ? req.body.url : null,
		summary: "summary" in req.body ? req.body.summary : null,
		storyline: "storyline" in req.body ? req.body.storyline : null,
		rating: "rating" in req.body ? req.body.rating : null,
		popularity: "popularity" in req.body ? req.body.popularity : null,
		total_rating: "total_rating" in req.body ? req.body.total_rating : null,
		total_rating_count: "total_rating_count" in req.body ? req.body.total_rating_count : null,
		rating_count: "rating_count" in req.body ? req.body.rating_count : null,
		developers: "developers" in req.body ? req.body.developers : null,
		publishers: "publishers" in req.body ? req.body.publishers : null,
		game_engines: "game_engines" in req.body ? req.body.game_engines : null,
		category: "category" in req.body ? req.body.category : null,
		time_to_beat: {
			hastly: "time_to_beat" in req.body ? req.body.time_to_beat.hastly : null,
			normally: "time_to_beat" in req.body ? req.body.time_to_beat.normally : null,
			completely: "time_to_beat" in req.body ? req.body.time_to_beat.completely : null
		},
		player_perspectives: "player_perspectives" in req.body ? req.body.player_perspectives : null,
		game_modes: "game_modes" in req.body ? req.body.game_modes : null,
		themes: "themes" in req.body ? req.body.themes : null,
		genres: "genres" in req.body ? req.body.genres : null,
		first_release_date: "first_release_date" in req.body ? req.body.first_release_date : null,
		platforms: "platforms" in req.body ? req.body.platforms : null,
		release_dates: "release_dates" in req.body ? req.body.release_dates : null,
		alternative_names: "alternative_names" in req.body ? req.body.alternative_names : null,
		screenshots: "screenshots" in req.body ? req.body.screenshots : null,
		videos: "videos" in req.body ? req.body.videos : null,
		cover: {
			url: "cover" in req.body ? req.body.cover.url : null,
			cloudinary_id: "cover" in req.body ? req.body.cover.cloudinary_id : null,
			width: "cover" in req.body ? req.body.cover.width : null,
			height: "cover" in req.body ? req.body.cover.height : null
		},
		esrb: {
			synopsis: "esrb" in req.body ? req.body.synopsis : null,
			rating: "esrb" in req.body ? req.body.esrb.rating : null
		},
		pegi: {
			rating: "pegi" in req.body ? req.body.pegi.rating : null
		},
		websites: "websites" in req.body ? req.body.websites : null
	})
	.then(gameProfile => {
		return UserProfile.findOneAndUpdate(
			{"username": req.body.username},
			{$push:
				{"wish_list": gameProfile}
			},
			{new: true}
		);
	})
	.then(userProfile => {
		res.status(201).json(userProfile);
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({ message: 'Internal server error'});
	});
});

app.post('/editUserProfile', jsonParser, (req, res) => {
	return UserProfile.findOneAndUpdate(
		{"username": req.body.username},
		{$set:
			{
				"nickname": req.body.nickname,
				"platform": req.body.platform,
				"genre_of_interest": req.body.genre_of_interest,
				"user_profile_summary": req.body.user_profile_summary,
				"user_portrait": req.body.user_portrait
			  }
		},
		{new: true}
	)
	.then(userProfile => {
		res.status(201).json(userProfile);
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({ message: 'Internal server error'});
	});
});

app.post('/deleteFromWishList', jsonParser, (req, res) => {
	return UserProfile.findOneAndUpdate(
		{"username": req.body.username},
		{$pull:
			{"wish_list": { _id: req.body._id } }
		},
		{new: true}
	)
	.then(userProfile => {
		res.status(201).json(userProfile);
	})
	.catch(err => {
		console.error(err);
			res.status(500).json({ message: 'Internal server error'});
	});
});

app.post('/editCustomList', jsonParser, (req, res) => {
	return CustomList.findOneAndUpdate(
		{_id: req.body._id},
		{$set:
			{
				"title": req.body.title,
				"content": req.body.content
			  }
		},
		{new: true}
	)
	.then (newList => {
		return UserProfile.findOneAndUpdate(
			{username: req.body.username},
			{$set:
				{
					custom_list: newList
				}
			},
			{new: true}
		)
	})
	.then(userProfile => {
		res.status(201).json(userProfile);
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({ message: 'Internal server error'});
	});
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

 module.exports = { runServer, app, closeServer };