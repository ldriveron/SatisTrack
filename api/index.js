// API server routes

import express from 'express';
const router = express.Router();

// MongoDB models for api search
import User from '../models/User';
import SatisReport from '../models/SatisReport';

// Return the current user's information
router.get('/userdata/:userID', (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		User.findOne({ id: req.params.uderID }).then((user) =>
			res.send({
				user: {
					username: user.username,
					work_start_hour: user.work_start_hour,
					work_end_hour: user.work_end_hour,
					last_schedule_edit: user.last_schedule_edit,
					days_tracked: user.days_tracked,
					work_days: user.work_days
				}
			})
		);
	} else {
		res.redirect('/users/login');
	}
});

// If the user is authenticated, then return their ID
router.get('/auth/init', (req, res) => {
	if (req.isAuthenticated()) {
		res.send({ id: req.user.id });
	} else {
		res.redirect('/users/login');
	}
});

// Get all the user's satisfaction reports from MongoDB sorted by date
// If there are none, then respond with total_results: 0
router.get('/satis/all/:userID', (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		SatisReport.find({ user_id: req.params.userID }).sort('date').then((report) => {
			if (report.length !== 0) {
				res.send({ total_results: report.length, results: report });
			} else {
				res.send({ total_results: 0 });
			}
		});
	} else {
		res.redirect('/users/login');
	}
});

// Add a satisfaction report for the user to MongoDB
router.post('/satis/report/:userID/:mood', async (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		let user_id = req.params.userID;
		let mood = req.params.mood;
		const date = new Date().toLocaleDateString();

		const newReport = new SatisReport({
			user_id,
			mood,
			date
		});

		await newReport
			.save()
			.then(() => {
				res.send({ success: 1 });
			})
			.catch(console.error);
	} else {
		res.redirect('/users/login');
	}
});

// Update the user's work start and end hour
// Also update their last schedule edit to today's date
router.post('/userdata/sethours/:userID/:startHour/:endHour', async (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		await User.findOneAndUpdate(
			{ _id: req.user.id },
			{
				work_start_hour: req.params.startHour,
				work_end_hour: req.params.endHour,
				last_schedule_edit: new Date().toLocaleDateString()
			},
			{ new: true }
		);

		res.send('Done.');
	} else {
		res.redirect('/users/login');
	}
});

// Update the user's work schedule
// Also update their last schedule edit to today's date
router.post(
	'/userdata/sethours/:userID/:sunday/:monday/:tuesday/:wednesday/:thursday/:friday/:saturday',
	async (req, res) => {
		let new_days = {
			sunday: req.params.sunday,
			monday: req.params.monday,
			tuesday: req.params.tuesday,
			wednesday: req.params.wednesday,
			thursday: req.params.thursday,
			friday: req.params.friday,
			saturday: req.params.saturday
		};

		if (req.isAuthenticated() && req.params.userID === req.user.id) {
			await User.findOneAndUpdate(
				{ _id: req.user.id },
				{ work_days: new_days, last_schedule_edit: new Date().toLocaleDateString() },
				{ new: true }
			);

			res.send('Done.');
		} else {
			res.redirect('/users/login');
		}
	}
);

export default router;
