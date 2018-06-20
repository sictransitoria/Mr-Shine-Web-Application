// | + ~((\☼.☼/))~ + |

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const {Client} = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const notifications = require('./notifications.js')

// Sequelize Variables
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Create a new Express Application
const app = express();

// Loud and Clear
const PORT = process.env.PORT || 3000;

// Configure View Engine to Render EJS.
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));


// CREATE DATABASE
const Op = Sequelize.Op
const sequelize = new Sequelize('mrshine', 'postgres', 'Runner4life!', {
	host: 'localhost',
	port: '5432',
	dialect: 'postgres',
	operatorsAliases: {
		$and: Op.and,
		$or: Op.or,
		$eq: Op.eq,
		$like: Op.like,
		$iLike: Op.iLike
	}
});

// CREATE TABLE
const User = sequelize.define('users', {
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	phonenumber: Sequelize.STRING,
	email: Sequelize.STRING

});

const sessionStore = new SequelizeStore({
    db: sequelize

});

sequelize.sync();
sessionStore.sync();

// Passport Variables
const LocalStrategy = require('passport-local').Strategy;
const Strategy = require('passport-local').Strategy;
const passport = require('passport');

// -- Sessions -- 
passport.serializeUser(function(user, done) {
		console.log("********* Serialize User *********")
      done(null, user)
});

// Convert ID in Cookie to User Details
	passport.deserializeUser(function(obj,done){
		console.log("-- deserializeUser --");
		console.log(obj)	
			done(null, obj);
});

// * Start Passport Local Config *

// Passport Sign-up
passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    phonenumberField: 'cell',
    emailField: 'email',
    passReqToCallback: true
}, processSignupCallback));

function processSignupCallback(req, username, password, done) {
    // Search to see if the user exists in the database
    User.findOne({
        where: {
            'username' :  username
				}
    })
    .then((user)=> {
        if (user) {
            // user exists call done() passing null and false
            return done(null, false);
        } else {

// Create a New User
			let newUser = req.body;
			User.create(newUser)
			.then((user)=>{
			   console.log("User has been created.")
			    return done(null, user);
			})

		}	 
	})
}

// * End of Passport Sign-up *

// * Start of Passport Login *

// Local Strategy
passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, processLoginCallback));

function processLoginCallback(req, username, password, done) {
    // first search to see if a user exists in our system with that email
    User.findOne({
        where: {
            'username' :  username
				},
    })
    .then((user)=> {
        if (!user) {
            return done(null, false);
        } else if (password !== user.password){
						return done(null, false)
					} else {
			   console.log("You've logged in.");
			    return done(null, user);
			  }
		})

};

// * Passport Middleware *

// Must be Initialized in order for Passport to work.
  app.use(passport.initialize());
  app.use(passport.session());

// Configure the Local Strategy for use by Passport.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

// Configure Passport Authenticated Session Persistence.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
}); 

// * ROUTES *

// GET Routes

// GET '/'
app.get('/', (req, res) => {
	return res.render('welcome');
});

// GET Sign-Up 
app.get('/signup', (req, res)=>{
	return res.render('signup');
});

// GET Login
app.get('/login', (req, res) => {
    return res.render('login');
});

// GET Mr. Shine, that rascal
app.get('/mr-shine', (req, res) => {
  Note.findAll().then((rows) => {
  	return rows
  })
  .then((rows) => {
  	return res.render('mr-shine', {rows})
  })
});

// GET Logout
app.get('/logout', (req, res) => {
	return res.render('logout', { user: req.user });
});

// POST Routes

// POST Sign-Up
app.post('/signup', function(req,res, next){
	passport.authenticate('local-signup', function(err, user){
		if (err) {
			return next(err);
		} else {
			return res.redirect('/')
		}
	})(req, res, next);
});

// POST Login
app.post('/login', function(req,res,next){
		passport.authenticate('local-login', function(err, user){
			if (err || user == false) {
				return res.render('login', {message: "Incorrect Username/Password"})
			} else {
				req.login(user, function(err){
					console.log("Getting req.user :"+ req.user)
					return res.render('mr-shine', {user: req.user})
				})
			}
		})(req, res, next);
});

// **** Twilio Credentials ****
const accountSid = "AC590f4900fcb04a7423584d08fbacc531";
const authToken = "b03821fd6c6e71a9ef362e3fda3da746";
const client = require('twilio')(accountSid, authToken);
const cron = require('cron-scheduler')
cronJob = require('cron').CronJob;

var sendSMS = notifications.notifications[i];
var numbers = [];

for ( var i = 0; i < numbers.length; i++ ) {
  client.messages.create( { to: numbers, from:'+18452633657', body: sendSMS}, function( err, data ) {
  	console.log(sendSMS);
  });
}

// Loud and Clear
app.listen(PORT, ()=>{
	console.log('Listening on port:', PORT)
});


