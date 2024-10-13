const express = require('express');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const notifications = require('./notifications.js');
const { Sequelize, Op } = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cron = require('cron');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Database Setup
const sequelize = new Sequelize(process.env.DB_DATAB, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
});

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_DATAB:', process.env.DB_DATAB);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_PORT:', process.env.DB_PORT);

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Models
const User = sequelize.define('user', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phonenumber: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    }
});

const Schedule = sequelize.define('schedule', {
    morning: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    afternoon: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    evening: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    latenight: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

Schedule.belongsTo(User);

// Session Setup
const sessionStore = new SequelizeStore({ db: sequelize });
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } 
    catch (err) {
        done(err);
    }
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return done(null, false, { message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPassword,
            phonenumber: req.body.cell,
            email: req.body.email
        });
        return done(null, newUser);
    } 
    catch (error) {
        return done(error);
    }
}));

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
}, async (username, password, done) => {
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Twilio Setup
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Routes
app.get('/', (req, res) => res.render('welcome'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/mr-shine', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    try {
        const schedule = await Schedule.findOne({ where: { userId: req.user.id } });
        res.render('mr-shine', {
            user: req.user,
            schedule: schedule ? true : false
        });
    } 
    catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('signup', { message: info.message });
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/mr-shine');
        });
    })(req, res, next);
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', { message: info.message });
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/mr-shine');
        });
    })(req, res, next);
});

app.post('/on-demand', async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const randomIndex = Math.floor(Math.random() * notifications.notifications.length);
        const sendSMS = notifications.notifications[randomIndex];
        await client.messages.create({
            to: req.user.phonenumber,
            from: TWILIO_NUMBER,
            body: sendSMS
        });
        res.render('mr-shine', { message: 'Message sent successfully' });
    } 
    catch (error) {
        console.error(error);
        res.status(500).send('Failed to send message');
    }
});

app.post('/schedule', async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    try {
        await Schedule.upsert({
            morning: req.body.morning === 'on',
            afternoon: req.body.afternoon === 'on',
            evening: req.body.evening === 'on',
            latenight: req.body.latenight === 'on',
            userId: req.user.id
        });
        res.redirect('/mr-shine');
    } 
    catch (error) {
        console.error(error);
        res.status(500).send('Failed to update schedule');
    }
});

// Cron Jobs
function setupCronJob(time, scheduleField) {
    new cron.CronJob(time, async function () {
        try {
            const schedules = await Schedule.findAll({ where: { [scheduleField]: true }, include: [User] });
            for (let schedule of schedules) {
                const randomIndex = Math.floor(Math.random() * notifications.notifications.length);
                const sendSMS = notifications.notifications[randomIndex];
                await client.messages.create({
                    to: schedule.User.phonenumber,
                    from: TWILIO_NUMBER,
                    body: sendSMS
                });
                console.log(`Sent a ${scheduleField} text to ${schedule.User.username}`);
            }
        } 
        catch (error) {
            console.error(`Error in ${scheduleField} cron job:`, error);
        }
    }, null, true, 'America/New_York');
}

setupCronJob('0 9 * * *', 'morning');
setupCronJob('30 12 * * *', 'afternoon');
setupCronJob('0 17 * * *', 'evening');
setupCronJob('0 21 * * *', 'latenight');

// Database Sync and Server Start
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});