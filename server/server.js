import sslRedirect from 'heroku-ssl-redirect';
import express from 'express';
import config from './config';
import passport from 'passport';

import flash from 'express-flash';

import session from 'express-session';

import sassMiddleware from 'node-sass-middleware';

import path from 'path';
import apiRouter from './api';

import cors from 'cors';

// Set the server
const server = express();

// Use SSL redirect
server.use(sslRedirect());

server.use('*', cors());

// Use the sass middleware
// Puts the processed CSS in public folder
server.use(
	sassMiddleware({
		src: path.join(__dirname, '../sass'),
		dest: path.join(__dirname, '../public'),
		outputStyle: 'compressed'
	})
);

// Set the view engine to ejs
server.set('view engine', 'ejs');
// Let the server use the forms in GET requests
server.use(express.urlencoded({ extended: false }));
// Express flash and session
server.use(flash());
server.use(
	session({
		secret: config.SESSION_SECRET,
		resave: true,
		saveUninitialized: true
	})
);

// Passport middleware
server.use(passport.initialize());
server.use(passport.session());

// Global variables
server.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user_alert = req.flash('user_alert');
	res.locals.user_error = req.flash('user_error');
	res.locals.userEmail = req.flash('userEmail');
	res.locals.userID = req.flash('userID');

	// For checking if user is logged in
	res.locals.isLoggedIn = req.isAuthenticated();
	next();
});

// Folder holding public files
server.use(express.static('public'));

// Index routes
server.use('/', require('./routes/index'));

// User routes (login, register, dashboard, logout...)
server.use('/users', require('./routes/users'));

// Include the api files from api folder (api routes)
server.use('/api', apiRouter);

// Redirect to home page if user attempts to go to page that has no set route
server.get('*', function(req, res) {
	res.redirect('/');
});

const port = process.env.PORT || 4242;

// Run the server on port 4242
server.listen(port, '0.0.0.0', () => console.log('Server is running...'));
