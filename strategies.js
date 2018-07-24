'use strict';
const { Strategy: LocalStrategy } = require('passport-local');

const {UserProfile} = require('./models');
const {JWT_SECRET} = require('./config');
//strategy used for authorization of /login endpoint
let localStrategy = new LocalStrategy(
    {usernameField: 'username', passwordField: 'password'},
    function(username, password, done){
        let user;
        UserProfile.findOne({username: username})
        .then(function(_user){
            user = _user;
            if(!user){
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            return user.validatePassword(password);
        })
        .then(function(isValid){
            if(!isValid){
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            return done(null, user);
        })
        .catch(function(err){
            if(err.reason === 'LoginError'){
                return done(null, false, err);
            }
            console.log(err);
            return done(err, false);
        });
    }
);

module.exports = localStrategy;