import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import StartingPage from '../src/components/StartingPage';

// Set the server
const server = express.Router();

// Route render for root
server.get('/', checkAuthenticated, (req, res) => {
	res.render('index.ejs', {
		startingPage: ReactDOMServer.renderToString(<StartingPage />),
		page_title: 'Satis Track'
	});
});

// Check if current user is authenticated
function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/users/dashboard');
	}

	next();
}

module.exports = server;
