import express from 'express';
import passport from 'passport';

// Passport starting
import initializePassport from '../passport-config';
initializePassport(passport);

// For encrypting passwords
import bcrypt from 'bcrypt';

// For email confirmation
import mailer from 'nodemailer';
import random_string from 'crypto-random-string';
import config from '../config';

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
				req.flash('error_msg', 'Email or username entered is already registered');
				res.redirect('/users/register');
			} else {
				let confirmation_code = random_string({ length: 10, type: 'url-safe' });

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
								emailConfirm(user.email, confirmation_code, user.id.toString());

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

// Send an email containing an email confirmation link to the user
let emailConfirm = async (email, confirmation_code, id) => {
	let confirm_url = 'https://satistracker.com/users/email_confirm/' + confirmation_code + '/' + id;

	var mailOptions = {
		from: '"Satis Tracker" <satistrack@gmail.com>',
		to: email,
		subject: 'Confirm your email on Satis Tracker',
		html:
			'<div id="full_container" style="width: 100%; background-color: #EEF0F6; padding: 20px 0;">' +
			'<a href="https://satistracker.com" target="_blank" style="text-decoration: none;"><div id="logo_text" ' +
			'style="width: 100%; font-size: 30px; text-align: center; margin-bottom: 20px;">SATIS TRACKER</div></a>' +
			'<div id="content_container" style="width: 60%; background-color: #fff; margin: 20px auto; ' +
			'padding: 30px; border-radius: 10px; text-align: center; font-size: 18px; font-weight: bold;">' +
			'In order to receive emails from Satis Tracker, including Mood Report reminders, your email must be confirmed.<br><br>' +
			'<a href="' +
			confirm_url +
			'" target="_blank" style="text-decoration: none;"><div id="begin_button" ' +
			'style="width: fit-content; margin: 0 auto; padding: 10px 30px; border: none; background-color: #fe9079; ' +
			'color: #fff; font-size: 16px; border-radius: 5px;">Confirm Email</div></a></div>' +
			'<div id="statement" style="width: 100%; text-align: center; font-size: 13px; margin-top: 25px;">' +
			'This is an automated message. Please do not reply to this email.</div>' +
			'</div>'
	};

	var transporter = mailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'satistrack@gmail.com',
			pass: config.emps
		}
	});

	await transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent for a new account: ' + info.response);
		}
	});
};

// When the user goes to this route, find the user by ID, then check if the user's email is not
// already confirmed. If it is not, then check that the code matches. If it does, update the
// user's email confirmation, else the link is invalid.
server.get('/email_confirm/:code/:id', async (req, res) => {
	// Get confirmation code and user id from URL
	let code = req.params.code;
	let id = req.params.id;

	// If the id in the URL does not match the current logged in user's id, then the link is invalid
	if (req.isAuthenticated() && id != req.user.id.toString()) {
		req.flash('user_alert', 'Invalid confirmation link');
		req.redirect('/users/dashboard');
	} else {
		await User.findOne({ _id: id })
			.then(async (user) => {
				if (!user.email_confirmed) {
					if (code == user.confirmation_code) {
						await user.updateOne({ email_confirmed: true, confirmation_code: '' });

						req.flash('user_alert', 'Your email has been confirmed');
					} else {
						req.flash('user_alert', 'Invalid confirmation link');
					}
				} else {
					req.flash('user_alert', 'Your email is already confirmed');
				}
			})
			.catch(() => {
				req.flash('user_alert', 'Invalid confirmation link');
			});

		if (req.isAuthenticated()) {
			res.redirect('/users/dashboard');
		} else {
			res.redirect('/users/login');
		}
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

	req.flash('error_msg', 'Log in to view your dashboard');
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
