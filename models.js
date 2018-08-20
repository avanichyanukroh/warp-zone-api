'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const gameProfileSchema = mongoose.Schema({

		id: {type: Number},
		name: {type: String, required: true},
		url: {type: String},
		summary: {type: String},
		storyline: {type: String},
		rating: {type: Number},
		popularity: {type: Number},
		total_rating: {type: Number},
		total_rating_count: {type: Number},
		rating_count: {type: Number},
		developers: [{type: String}],
		publishers: [{type: String}],
		game_engines: [{type: Number}],
		category: {type: Number},
		time_to_beat: {
			hastly: Number,
			normally: Number,
			completely: Number
		},
		player_perspectives: [{type: Number}],
		game_modes: [{type: Number}],
		themes: [{type: Number}],
		genres: [{type: Number}],
		first_release_date: {type: Number},
		platforms: [{type: Number}],
		release_dates: [{
				category: Number,
				platform: Number,
				date: Number,
				region: Number,
				human: String,
				y: Number,
				m: Number
			}],
		alternative_names: [{
				name: String
			}],
		screenshots: [
			{
				url: String,
				cloudinary_id: String,
				width: Number,
				height: Number
			}],
		videos: [{
				name: String,
			   video_id: String
			}],
		cover: {
			url: String,
			cloudinary_id: String,
			width: Number,
			height: Number
		},
		esrb: {
			synopsis: String,
			rating: Number
		},
		pegi: {
			rating: Number
		},
		websites: [{
				category: Number,
				url: String
			}]
});

const customListSchema = mongoose.Schema ({

	"title": {type: String},
	"content": {type: String}
});

const userProfileSchema = mongoose.Schema({

	username: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	nickname: {type: String, default: "Gamer#1"},
	user_portrait: {type: String, default: "https://slm-assets2.secondlife.com/assets/12181178/view_large/Superhero_silhouette__Superhero_Collection.jpg?1440171439"},
	user_profile_summary: {type: String, default: "No summary"},
	platform: {type: String, default: "No platform listed"},
	genre_of_interest: {type: String, default: "No genre of interest listed"},
	wish_list: [gameProfileSchema],
	custom_list: [customListSchema]
});

const priceListSchema = mongoose.Schema ({

	"asin": {type: String},
	"console-name": {type: String},
	"id": {type: String},
	"loose-price": {type: Number},
	"new-price": {type: Number},
	"product-name": {type: String}
});

userProfileSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userProfileSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const GameProfile = mongoose.model('GameProfile', gameProfileSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const PriceList = mongoose.model('PriceList', priceListSchema);
const CustomList = mongoose.model('CustomList', customListSchema);

module.exports = {GameProfile, UserProfile, PriceList, CustomList};