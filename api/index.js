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
					last_report_date: user.last_report_date,
					days_tracked: user.days_tracked,
					reporting_streak: user.reporting_streak,
					work_days: user.work_days
				}
			})
		);
	} else {
		res.redirect('/users/login');
	}
});

// If the user is authenticated, then return their ID
router.get('/auth/init', async (req, res) => {
	if (req.isAuthenticated()) {
		// Check if the user lost their reporting streak and if they did, reset it to 0
		// This works by checking if the day before was a work day and the user's last report date is not
		// the day's before date. If the user's last report day is the current day, then there is no need to
		// reset the user's reporting streak
		let days_of_week = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
		let today = new Date();
		let yesterday = new Date();
		// Set the Date object to yeseterday's date
		yesterday.setDate(yesterday.getDate() - 1);
		await User.findOne({ _id: req.user.id }).then(async (user) => {
			if (
				user.work_days[days_of_week[yesterday.getDay()]] &&
				user.last_report_date != yesterday.toLocaleDateString() &&
				user.last_report_date != today.toLocaleDateString()
			) {
				await user.updateOne({ reporting_streak: 0 });
			}
		});

		res.send({ id: req.user.id });
	} else {
		res.redirect('/users/login');
	}
});

// Get all the user's satisfaction reports from MongoDB sorted by date
// If there are none, then respond with total_results: 0
router.get('/satis/all/:userID', (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		SatisReport.find({ user_id: req.params.userID }).sort('-date').then((report) => {
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

// Get one month's report based on year
// The result will be retreived based on logged in user, selected year and month, and sorted by day.
router.get('/satis/:year/:month/:userID', (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		SatisReport.find({ user_id: req.params.userID, year: req.params.year, month: req.params.month })
			.sort('day')
			.then((report) => {
				if (report.length !== 0) {
					res.send({
						total_results: report.length,
						year: req.params.year,
						month: req.params.month,
						result: report
					});
				} else {
					res.send({ total_results: 0 });
				}
			});
	} else {
		res.redirect('/users/login');
	}
});

// Add a satisfaction report for the user to MongoDB
router.post([ '/satis/report/:userID/:mood', '/satis/report/:userID/:mood/:recap' ], async (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		// CHeck for a recap in the url. If there isn't one, then recap is an empty string.
		let recap;
		if (!req.params.recap) {
			recap = '';
		} else {
			recap = req.params.recap;
		}

		let days_of_week = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

		let user_id = req.params.userID;
		let mood = req.params.mood;
		let today = new Date();
		const date = today.toLocaleDateString();
		const month = today.getMonth() + 1;
		const day = today.getDate();
		const day_word = days_of_week[today.getDay()];
		const year = today.getFullYear();

		const newReport = new SatisReport({
			user_id,
			mood,
			date,
			month,
			day,
			day_word,
			recap,
			year
		});

		await newReport
			.save()
			.then(() => {
				res.send('Done.');
			})
			.catch(console.error);

		await User.findOne({ _id: req.user.id }).then(async (user) => {
			// If the day before was a work day and the user's last report date was not on that day,
			// then reset their reporting streak to 0
			let days_of_week = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
			let yesterday = new Date();
			// Set the Date object to yesterday's date
			yesterday.setDate(yesterday.getDate() - 1);
			let reporting_streak = 0;
			if (
				user.work_days[days_of_week[yesterday.getDay()]] &&
				user.last_report_date != yesterday.toLocaleDateString()
			) {
				reporting_streak = 1;
			} else {
				reporting_streak = user.reporting_streak + 1;
			}

			await user.updateOne({
				last_report_date: today.toLocaleDateString(),
				days_reported: user.days_reported + 1,
				reporting_streak: reporting_streak
			});
		});
	} else {
		res.redirect('/users/login');
	}
});

// Update the user's work start and end hour
// Also update their last schedule edit to today's date
router.post('/userdata/sethours/:userID/:startHour/:endHour', async (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		await User.findOne({ _id: req.user.id }).then(async (user) => {
			let today = new Date();
			if (user.last_schedule_edit != today.toLocaleDateString()) {
				await user.updateOne({
					work_start_hour: req.params.startHour,
					work_end_hour: req.params.endHour,
					last_schedule_edit: today.toLocaleDateString()
				});

				res.send('Done.');
			} else {
				res.send('Not yet.');
			}
		});
	} else {
		res.redirect('/users/login');
	}
});

// Update the user's work schedule
// Also update their last schedule edit to today's date
router.post(
	'/userdata/setschedule/:userID/:sunday/:monday/:tuesday/:wednesday/:thursday/:friday/:saturday',
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
			await User.findOne({ _id: req.user.id }).then(async (user) => {
				let today = new Date();
				if (user.last_schedule_edit != today.toLocaleDateString()) {
					await user.updateOne({ work_days: new_days, last_schedule_edit: new Date().toLocaleDateString() });

					res.send('Done');
				} else {
					res.send('Not yet.');
				}
			});
		} else {
			res.redirect('/users/login');
		}
	}
);

export default router;
