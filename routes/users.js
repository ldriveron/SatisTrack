import express from 'express';
import passport from 'passport';

// React imports
import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Import react components
import LoginForm from '../src/components/LoginForm';
import RegisterForm from '../src/components/RegisterForm';

// Passport starting
import initializePassport from '../passport-config';
initializePassport(passport);

// For encrypting passwords
import bcrypt from 'bcrypt';

import methodOverride from 'method-override';

// Set the server
const server = express.Router();

server.use(methodOverride('_method'));

// Connected to MongoDB Atlas client
import mongoose from 'mongoose';
import mdb from '../config';
mongoose
	.connect(mdb.mongoAtlasUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
	.then(() => console.log('MongoDB connected...'))
	.catch((err) => console.log(err));

// Import data modules
import User from '../models/User';

// Login routes
server.get('/login', checkAuthenticated, (req, res) => {
	res.render('login.ejs', {
		loginForm: ReactDOMServer.renderToString(<LoginForm email={res.locals.userEmail} />),
		page_title: 'Login'
	});
});

server.post('/login', checkAuthenticated, (req, res, next) => {
	req.flash('userEmail', req.body.email);

	passport.authenticate('local', {
		successRedirect: '/users/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// Register routes
server.get('/register', checkAuthenticated, (req, res) => {
	res.render('register.ejs', {
		page_title: 'Register',
		registerform: ReactDOMServer.renderToString(<RegisterForm username="" email="" />)
	});
});

server.post('/register', checkAuthenticated, async (req, res) => {
	// // Create a user account using the form information
	const { username, email, password } = req.body;

	let errors = [];

	if (errors.length > 0) {
		res.render('register.ejs', {
			errors,
			page_title: 'Register',
			registerform: ReactDOMServer.renderToString(<RegisterForm username={username} email={email} />)
		});
	} else {
		// Passed form validation
		await User.findOne({ email: email }).then(async (user) => {
			if (user) {
				// User exists, show as an error
				errors.push({ msg: 'Email is already registered.' });
				res.render('register.ejs', {
					errors,
					page_title: 'Register',
					registerform: ReactDOMServer.renderToString(<RegisterForm username={username} email={email} />)
				});
			} else {
				const newUser = new User({
					username,
					email,
					password,
					private: 0
				});

				// Secure the users password
				await bcrypt.genSalt(10, (err, salt) =>
					bcrypt.hash(newUser.password, salt, async (err, hash) => {
						if (err) throw err;
						//set the password to the generated hash
						newUser.password = hash;

						// Save new user to mongodb and redirect to login page
						await newUser
							.save()
							.then((user) => {
								req.flash('success_msg', 'You account has been created. Login below.');
								req.flash('userEmail', user.email);
								res.redirect('/users/login');
							})
							.catch((err) => console.log(err));
					})
				);
			}
		});
	}
});

// Dashboard route when user is logged in
server.get('/dashboard', checkNotAuthenticated, (req, res) => {
	res.render('dashboard.ejs', {
		page_title: 'Dashboard'
	});
});

// Log out the user and redirect them to the login page
server.delete('/logout', (req, res) => {
	req.logOut();
	req.flash('success_msg', 'You have logged out.');
	res.redirect('/users/login');
});

// Authenticating the user
// If the user is not logged in, redirect them to the login page
function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	req.flash('error_msg', 'Log in to view your dashboard.');
	res.redirect('/users/login');
}

// Check if not authenticated
// If the user is logged in, redirect them to the dashboard page
function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/users/dashboard');
	}

	next();
}

module.exports = server;
