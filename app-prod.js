// | + ~((\☼.☼/))~ + |

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
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

// Protect Yoself
const dotenv = require('dotenv');
require('dotenv').config();
dotenv.load();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN,
      TWILIO_NUMBER = process.env.TWILIO_NUMBER;
      DATABASE_URL = process.env.DATABASE_URL;

// Configure View Engine to Render EJS.
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

// CREATE DATABASE
const Op = Sequelize.Op
const sequelize = new Sequelize(DATABASE_URL {
	protocol: 'postgres',
	ssl: true,
	dialect: 'postgres',
	operatorsAliases: {
		$and: Op.and,
		$or: Op.or,
		$eq: Op.eq,
		$like: Op.like,
		$iLike: Op.iLike
  }
});

// CREATE TABLE(s)
const User = sequelize.define('user', {
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	phonenumber: Sequelize.STRING,
	email: Sequelize.STRING

});

const Schedule = sequelize.define('schedule', {
	morning: Sequelize.BOOLEAN,
	afternoon: Sequelize.BOOLEAN,
	evening: Sequelize.BOOLEAN,
	latenight: Sequelize.BOOLEAN

});

Schedule.belongsTo(User);  // Will add an ID attribute to User to hold the primary key value for Schedule

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
		console.log("***** Serialize User *****")
      done(null, user)
});

// Convert ID in Cookie to User Details
	passport.deserializeUser(function(obj,done){
		console.log("-- deserializeUser --");
		console.log(obj)	
			done(null, obj);
});

// * Start Passport Sign-Up *

// Passport Sign-up
passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    phonenumberField: 'cell',
    emailField: 'email',
    passReqToCallback: true
}, processSignupCallback));

function processSignupCallback(req, username, password, done) {
    // Search to See if the User Exists in the Database
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
    User.findOne({
        where: {
            'username' :  username
				},
    })
    .then((user) => {
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

// Must be Initialized in Order for Passport to Work
  app.use(passport.initialize());
  app.use(passport.session());

// Configure the Local Strategy for use by Passport
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, (err, user) => {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

// Configure Passport Authenticated Session Persistence
passport.serializeUser( (user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  db.users.findById(id, (err, user) => {
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
app.get('/signup', (req, res) => {
	return res.render('signup');
});

// GET Login
app.get('/login', (req, res) => {
    return res.render('login');
});

// GET Mr. Shine
app.get('/mr-shine', (req, res) => {
  User.findOne({
  	where: {
  		// username: username
  	}
  }).then((rows) => {
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
app.post('/signup', (req, res, next) => {
	passport.authenticate('local-signup', (err, user) => {
		if (err) {
			return next(err);
		} else {
			return res.redirect('/login')
		}
	})(req, res, next);
});

let demandPhone;
let username;

// POST Login
app.post('/login', (req, res, next) => {
		passport.authenticate('local-login', (err, user) => {
			if (err || user == false) {
				return res.render('login', {message: "Incorrect Username/Password"})
			} else {
				req.login(user, function(err){
					console.log("Getting req.user :"+ req.user)
					return res.render('mr-shine', {user: req.user})
				})
			}
		}) (req, res, next);

	username = req.body.username;
	console.log(username);

	User.findOne({
		where: {
		  username: username
	}
  })
	.then((row) => {
		demandPhone = row.dataValues.phonenumber;
		console.log(demandPhone);
  })
});

// SMS .. | + ~((\☼.☼/))~ + | ..

// **** Twilio Credentials ****
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Randomize SMS
var currentIndex = notifications.notifications.length;
var randomIndex = Math.floor(Math.random() * currentIndex);
var sendSMS = notifications.notifications[randomIndex];

// POST to Send On-Demand Messages With One Click
app.post('/on-demand', (req, res) => {
console.log('*****' + randomIndex + '*****');
console.log(notifications.notifications[randomIndex]);

  		client.messages.create( { 
			to: demandPhone, 
  			from: TWILIO_NUMBER, 
  			body: sendSMS }, function( err, data ) {});
  		return res.render('mr-shine')
});

app.post('/schedule', (req, res) => {
	console.log('***** Morning ****', req.body.morning);
	console.log('***** Afternoon ****', req.body.afternoon);
	console.log('***** Evening ****', req.body.evening);
	console.log('***** Late Night ****', req.body.latenight);
	console.log('****** Username ****', username);

	User.findOne({
		where: {
			username: username
		}
	})
	.then((row) => {
		console.log('**** User ID ****', row.dataValues.id)
		let userId = row.dataValues.id;
	
	Schedule.create({
		morning: req.body.morning,
		afternoon: req.body.afternoon,
		evening: req.body.evening,
		latenight: req.body.latenight,
		userId: userId

	})
  })
});

console.log("Hey")

// app.get('/schedule', (req, res) => {
// 	User.findOne({
// 		where: {
// 			username: username
// 		}
// 	})
// 	.then((row) => {
// 		Schedule.findOne({
// 			where: {
// 				userId: row.dataValues.id
// 		}
// 	})
// 	.then((row) => {
// 		if(row == null) {
// 		scheduleUpdate = false
		
// 		} else {
// 		scheduleUpdate = true

// 		}
// 		return res.render('mr-shine', { row, user: username, schedule: scheduleUpdate });
//     })
//   })
// });

// Set Cron Jobs to send SMS messages at specific time(s)
const cron = require('cron-scheduler');
const cronJob = require('cron').CronJob;

// MORNING 00 9
var morningJob = new cronJob( '00 00 9 * * *', function(){
	Schedule.findOne({
		where: {
			morning: 't'
		}
	})
	.then((row) => {
		User.findOne({ 
			where: { 
			id: row.dataValues.userId 
		}
	})
	.then((row) => {
		let scheduleNumber = row.dataValues.phonenumber;
  		  client.messages.create( { 
  		    to: scheduleNumber, 
  		    from: TWILIO_NUMBER, 
  		    body: sendSMS }, function( err, data ) {});
  		    console.log('*** SENT A MORNING TEXT ***');
  	  })
  	})
});
	morningJob.start();

// AFTERNOON 30 12
var afternoonJob = new cronJob( '00 30 12 * * *', function(){
	Schedule.findOne({
		where: {
			afternoon: 't'
		}
	})
	.then((row) => {
		User.findOne({ 
			where: { 
			id: row.dataValues.userId 
		}
	})
	.then((row) => {
		let scheduleNumber = row.dataValues.phonenumber;
  		  client.messages.create( { 
  		    to: scheduleNumber, 
  		    from: TWILIO_NUMBER, 
  		    body: sendSMS }, function( err, data ) {});
  		    console.log('*** SENT AN AFTERNOON TEXT ***');
  	  })
  	})
});
	afternoonJob.start();

// EVENING 00 00 17
var eveningJob = new cronJob( '00 00 17 * * *', function(){
	Schedule.findOne({
		where: {
			evening: 't'
		}
	})
	.then((row) => {
		User.findOne({ 
			where: { 
			id: row.dataValues.userId 
		}
	})
	.then((row) => {
		let scheduleNumber = row.dataValues.phonenumber;
  		  client.messages.create( { 
  		    to: scheduleNumber, 
  		    from: TWILIO_NUMBER, 
  		    body: sendSMS }, function( err, data ) {});
  		    console.log('*** SENT AN EVENING TEXT ***');
  	  })
  	})
});
	eveningJob.start();

// LATE NIGHT 00 00 21
var lateNightJob = new cronJob( '00 00 21 * * *', function(){
	Schedule.findOne({
		where: {
			latenight: 't'
		}
	})
	.then((row) => {
		User.findOne({ 
			where: { 
			id: row.dataValues.userId 
		}
	})
	.then((row) => {
		let scheduleNumber = row.dataValues.phonenumber;
  		  client.messages.create( { 
  		    to: scheduleNumber, 
  		    from: TWILIO_NUMBER, 
  		    body: sendSMS }, function( err, data ) {});
  		    console.log('*** SENT A LATE-NIGHT TEXT ***');
  	  })
  	})
});
	lateNightJob.start();

// Loud and Clear
app.listen(PORT, ()=>{
	console.log('..| + ~((\☼.☼/))~ + |..')
});


