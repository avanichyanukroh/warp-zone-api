 const chai = require('chai');
 const chaiHttp = require('chai-http');
 const mongoose = require('mongoose');
 const { GameProfile, UserProfile, WishList, PriceList, CustomList } = require('../models');
const {runServer, app, closeServer} = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {

	return new Promise((resolve, reject) => {

		console.warn('Deleting database');
		mongoose.connection.dropDatabase()
			.then(result => resolve(result))
			.catch(err => reject(err));
	});
};

// used to put randomish documents in db
// so we have data to work with and assert about.

function seedUserData() {
	 console.info('seeding UserProfile data');
	 let seedData = {

		username: "dummy",
		password: "dummy123"
	};

	return UserProfile.hashPassword(seedData.password)
		.then(hash => {

			return UserProfile.create({
				username: seedData.username,
				password: hash
		})
		.catch(err => console.log(err));
		});
};


describe('Users API resource', () => {

	before(() => {

		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(() => {

		return seedUserData();
	});

	afterEach(() =>	{
		// tear down database so we ensure no state from this test
		// effects any coming after.
		return tearDownDb();
	});

	after(() =>	{

		return closeServer();
	});


	describe('POST endpoint to registeration', () =>	{

		it('should check username and password', () =>	{

			let res;
			return chai.request(app)
				.post('/register')
				.send({ username: "new dummy", password: "newdummy123" })
				.then(_res => {
					res = _res;
					res.should.have.status(201);
					res.body.username.should.not.be.null;
					res.body.password.should.not.be.null;
				});
		});
	});

	describe('POST endpoint to obtain user profile', function () {

			it('should return one user', function () {

				let res;
				return chai.request(app)
					.post('/login')
					.send({username: "dummy", password: "dummy123"})
					.then(_res => {
						
						res = _res;
						res.should.have.status(200);
						res.body.user.should.not.be.null;
						res.body.authToken.should.not.be.null;
						res.should.be.json;
						res.body.should.be.a('object');
						res.body.user.should.include.keys('_id', 'username', 'password', 'nickname', 'user_portrait', 'user_profile_summary', 'platform', 'genre_of_interest');
					});
			});
	});

	describe('POST endpoint to add wishlist', function () {

			it('should add wishlist to userProfile and return new userProfile', function () {

				let res;
				return chai.request(app)
					.post('/addToWishlist')
					.send({username: "dummy", id: "123", name: "wishlist game 1"})
					.then(_res => {
						
						res = _res;
						console.log("this is the res: ", res.body.wish_list.length);
						res.should.have.status(201);
						res.body.username.should.not.be.null;
						expect('res.body.wish_list').to.have.length.of.at.least(1);
						res.should.be.json;
						res.body.should.be.a('object');
					});
			});
	});
});

