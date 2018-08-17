 const chai = require('chai');
 const chaiHttp = require('chai-http');
 const mongoose = require('mongoose');
 const { GameProfile, UserProfile, WishList, PriceList, CustomList } = require('../models');
const {runServer, app, closeServer} = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);
const should = chai.should();
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

	 return UserProfile.create(seedData)
		 .then(user => {

			 return user;
		 });
};


describe('Users API resource', () =>	{

	before(() =>	{

		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(() =>	{

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
					.send({username: "dummy"})
					.then(_res => {
						
						res = _res;
						console.log("the res.body for /login is: ", res.body);
						res.should.have.status(200);
						// res.body.username.should.not.be.null;
						// res.body.authToken.should.not.be.null;
					})
			});

			// it('should return users with right fields', function () {

			// 	let res;
			// 	return chai.request(app)
			// 		.post('/login')
			// 		.send({user: {username: "dummy", password: "dummy123"}})
			// 		.then(_res => {

			// 			res = _res;
			// 			res.should.have.status(200);
			// 			res.should.be.json;
			// 			res.body.should.be.a('object');
			// 			res.body.should.include.keys('_id', 'username', 'password', 'nickname', 'user_portrait', 'user_profile_summary', 'platform', 'genre_of_interest');
			// 		});
			// });
	});

});