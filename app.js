// | + ~((\☼.☼/))~ + |

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const {Client} = require('pg');
const app = express();
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));


// Create a Database named 'mrshine' to store users
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

// Create a table named 'User' to store login information.
const User = sequelize.define('user',{
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	phonenumber: Sequelize.INTEGER,
	email: Sequelize.STRING
});

sequelize.sync();

// Twilio Credentials
const accountSid = 'AC590f4900fcb04a7423584d08fbacc531';
const authToken = 'b03821fd6c6e71a9ef362e3fda3da746';

// Require the Twilio Module and Create a REST Client
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    to: '+19142825402', // Receiving Phone Number
    from: '+18452633657', // Sending a Message from Twilio Phone #
    body: '"Find a beautiful piece of art...fall in love...admire it...and realize that that was created by human beings just like you, no more human, no less."',
  }) 
  .then(message => console.log(message.sid));


// Loud and Clear on Port 8080
 app.listen(8080, () => {
    console.log('Server Started on Port: 8080');
});