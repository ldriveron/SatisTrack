import express from 'express';
import passport from 'passport';

// Passport starting
import initializePassport from '../passport-config';
initializePassport(passport);

// For encrypting passwords
import bcrypt from 'bcrypt';

// For email confirmation
//import mailer from 'nodemailer';
import ConfirmEmail from '../api/ConfirmEmailHelper';
import random_string from 'crypto-random-string';
//import config from '../config';

import methodOverride from 'method-override';

// Set the server
const server = express.Router();

server.use(methodOverride('_method'));

// Import data modules
import User from '../models/User';

// Login routes
server.get('/login', checkAuthenticated, (req, res) => {
	res.render('login.ejs', {
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
		page_title: 'Register'
	});
});

server.post('/register/:region/:location', checkAuthenticated, async (req, res) => {
	// Create a user account using the form information
	const { username, email, company, password } = req.body;
	// Get the timezone of the user
	const user_timezone = req.params.region + '/' + req.params.location;
	let joindate = new Date().toLocaleDateString('en-US', { timeZone: user_timezone });

	let errors = [];

	if (errors.length > 0) {
		res.render('register.ejs', {
			errors,
			page_title: 'Register'
		});
	} else {
		// Passed form validation
		await User.findOne({ email: email }, { username: username }).then(async (user) => {
			if (user) {
				// User exists, show as an error
				req.flash('user_error', 'Email or username entered is already registered');
				res.redirect('/users/register');
			} else {
				// This is the code that will be sent in the url to the user
				let confirmation_code_base = random_string({ length: 10, type: 'url-safe' });

				// This is for the encrypted version of the confirmation code
				let confirmation_code;

				// Generate a hash for the confirmation code
				await bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(confirmation_code_base, salt, async (err, hash) => {
						if (err) throw err;

						confirmation_code = hash;

						const newUser = new User({
							username,
							email,
							company,
							password,
							confirmation_code,
							user_timezone,
							joindate,
							private: true
						});

						// Secure the user's password
						await bcrypt.genSalt(10, (err, salt) =>
							bcrypt.hash(newUser.password, salt, async (err, hash) => {
								if (err) throw err;
								//set the password to the generated hash
								newUser.password = hash;

								// Save new user to mongodb and redirect to login page
								await newUser
									.save()
									.then((user) => {
										req.flash(
											'success_msg',
											'You account has been created. Check your email for a confirmation link.'
										);

										// Generate and send confirmation email to user
										ConfirmEmail.sendEmail(user.email, confirmation_code_base, user.id.toString());

										req.flash('userEmail', user.email);
										res.redirect('/users/login');
									})
									.catch((err) => console.log(err));
							})
						);
					});
				});
			}
		});
	}
});

// When the user goes to this route, find the user by ID, then check if the user's email is not
// already confirmed. If it is not, then check that the code matches. If it does, update the
// user's email confirmation, else the link is invalid.
server.get('/email_confirm/:code/:id', async (req, res) => {
	// Get confirmation code and user id from URL
	let code = req.params.code;
	let id = req.params.id;

	// If the id in the URL does not match the current logged in user's id, then the link is invalid
	// Use a different alert type for logged in users
	if (req.isAuthenticated()) {
		if (id != req.user.id.toString()) {
			req.flash('user_alert', 'Invalid confirmation link');
			res.redirect('/users/dashboard');
		} else {
			await User.findOne({ _id: id }).then(async (user) => {
				// If the user's email is not confirmed, then use bcrypt to compare the
				// URL confirmation code to the confirmation code in the database
				if (!user.email_confirmed) {
					bcrypt.compare(code, user.confirmation_code, async (err, isMatch) => {
						if (err) return err;

						if (isMatch) {
							await user.updateOne({ email_confirmed: true, confirmation_code: null });
							req.flash('user_alert', 'Your email has been confirmed');
						} else {
							req.flash('user_alert', 'Invalid confirmation link');
						}

						// Redirect user to their dashboard
						res.redirect('/users/dashboard');
					});
				} else {
					req.flash('user_alert', 'Your email is already confirmed');

					// Redirect user to their dashboard
					res.redirect('/users/dashboard');
				}
			});
		}
	} else {
		await User.findOne({ _id: id })
			.then(async (user) => {
				// If the user's email is not confirmed, then use bcrypt to compare the
				// URL confirmation code to the confirmation code in the database
				if (!user.email_confirmed) {
					await bcrypt.compare(code, user.confirmation_code, async (err, isMatch) => {
						if (err) return err;
						if (isMatch) {
							await user.updateOne({ email_confirmed: true, confirmation_code: null });
							req.flash('success_msg', 'Your email has been confirmed');
						} else {
							req.flash('user_error', 'Invalid confirmation link');
						}

						// Redirect user to login page
						res.redirect('/users/login');
					});
				} else {
					req.flash('user_error', 'Your email is already confirmed');

					// Redirect user to login page
					res.redirect('/users/login');
				}
			})
			.catch(() => {
				// No user found with this id if this happens
				req.flash('user_error', 'Invalid confirmation link');

				// Redirect user to login page
				res.redirect('/users/login');
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
server.post('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You have logged out');
	res.redirect('/users/login');
});

// Authenticating the user
// If the user is not logged in, redirect them to the login page
function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	req.flash('user_error', 'Log in to view your dashboard');
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
