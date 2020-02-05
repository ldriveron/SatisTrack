// API server routes

import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();

// MongoDB models for api search
import User from '../models/User';
import SatisReport from '../models/SatisReport';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Notifier service
import Notifier from './NotifierService';

let initEmailNotifiers = async () => {
	// Set up all current activated email notifications
	await User.find({}).then((users) => {
		users.map((user) => {
			if (user.allow_email_notifier == true) {
				Notifier.scheduler(
					user.work_days,
					user.work_end_hour,
					user._id.toString(),
					user.email,
					user.user_timezone
				);
			}
		});
	});
};

// Begin setting up email notifiers
initEmailNotifiers();

// Return the current user's information
router.get('/userdata/:userID', async (req, res) => {
	if (req.isAuthenticated() && req.params.userID === req.user.id) {
		await User.findOne({ _id: req.user.id }).then((user) =>
			res.send({
				user: {
					username: user.username,
					work_start_hour: user.work_start_hour,
					work_end_hour: user.work_end_hour,
					work_paused: user.work_paused,
					last_schedule_edit: user.last_schedule_edit,
					last_report_date: user.last_report_date,
					allow_email_notifier: user.allow_email_notifier,
					email_confirmed: user.email_confirmed,
					days_reported: user.days_reported,
					reporting_streak: user.reporting_streak,
					total_steaks: user.total_streaks,
					work_days: user.work_days,
					company: user.company
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
		// reset the user's reporting streak. If the user's work schedule is paused, then do not reset their
		// reporting streak.
		let days_of_week = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
		let today = new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone });
		let yesterday = new Date(today);

		// Set the Date object to yeseterday's date
		yesterday.setDate(yesterday.getDate() - 1);

		await User.findOne({ _id: req.user.id }).then(async (user) => {
			if (
				user.work_days[days_of_week[yesterday.getDay()]] &&
				user.last_report_date != yesterday.toLocaleDateString() &&
				user.last_report_date != today &&
				user.work_paused == false
			) {
				await user.updateOne({ reporting_streak: 0 });
			}
		});

		res.send({ id: req.user.id });
	} else {
		res.redirect('/users/login');
	}
});

// Edit user's email reminder setting
router.post('/userdata/editreminder', (req, res) => {
	if (req.isAuthenticated()) {
		User.findOne({ _id: req.user.id }).then(async (user) => {
			// Check if the user's notifications are already on
			if (user.allow_email_notifier == false && !Notifier.exists(req.user.id)) {
				// If the user's email notification is turned off, then turn it on
				Notifier.scheduler(user.work_days, user.work_end_hour, req.user.id, user.email, user.user_timezone);

				await user.updateOne({ allow_email_notifier: true });

				req.flash('user_alert', 'Email notifications have been enabled');
				res.redirect('/users/dashboard');
			} else if (user.allow_email_notifier == true && Notifier.exists(req.user.id)) {
				// If the user's email notification is turned on, then turn it off
				Notifier.remover(req.user.id);

				await user.updateOne({ allow_email_notifier: false });

				req.flash('user_alert', 'Email notifications have been disabled');
				res.redirect('/users/dashboard');
			}
		});
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
	if (
		req.isAuthenticated() &&
		req.params.userID === req.user.id &&
		req.user.last_report_date != new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone })
	) {
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
		let today = new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone });
		today = new Date(today);
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
			let yesterday = new Date(today);
			// Set the Date object to yesterday's date
			yesterday.setDate(yesterday.getDate() - 1);

			// If the day before was a working day for the user, and their last_report_date is not
			// the same as yesterday's date, then reset their reporting_streak to 1.
			// Else, add increment their reporting_streak by 1.
			let reporting_streak = 0;
			if (
				user.work_days[days_of_week[yesterday.getDay()]] &&
				user.last_report_date != yesterday.toLocaleDateString() &&
				user.last_report_date != today.toLocaleDateString()
			) {
				reporting_streak = 1;
			} else {
				reporting_streak = user.reporting_streak + 1;
			}

			// If this is the user's first mood report, then set their first_satis_report to today.
			// Else if the user's reporting_streak is divisible by 5, then add one to their total_streaks
			// This means the user has set a mood report 5 days in a row.
			// Else just do a normal mood report without changing first_satis_report or total_streaks.
			if (user.days_reported == 0) {
				await user.updateOne({
					last_report_date: today.toLocaleDateString(),
					days_reported: user.days_reported + 1,
					reporting_streak: reporting_streak,
					first_satis_report: today.toLocaleDateString()
				});
			} else if ((user.reporting_streak + 1) % 5 == 0) {
				await user.updateOne({
					last_report_date: today.toLocaleDateString(),
					days_reported: user.days_reported + 1,
					reporting_streak: reporting_streak,
					total_streaks: user.total_streaks + 1
				});
			} else {
				await user.updateOne({
					last_report_date: today.toLocaleDateString(),
					days_reported: user.days_reported + 1,
					reporting_streak: reporting_streak
				});
			}
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
			await user.updateOne({
				work_start_hour: req.params.startHour,
				work_end_hour: req.params.endHour,
				last_schedule_edit: new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone })
			});

			// Update email notifier schedule for the user
			Notifier.remover(user.id.toString());
			Notifier.scheduler(user.work_days, user.work_end_hour, user.id.toString(), user.email, user.user_timezone);

			req.flash('user_alert', 'Your work hours have been updated');
			res.send('Done.');
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
				await user.updateOne({
					work_days: new_days,
					last_schedule_edit: new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone })
				});

				// Update email notifier schedule for the user
				Notifier.remover(user.id.toString());
				Notifier.scheduler(
					user.work_days,
					user.work_end_hour,
					user.id.toString(),
					user.email,
					user.user_timezone
				);

				req.flash('user_alert', 'Your work days have been updated');
				res.send('Done');
			});
		} else {
			res.redirect('/users/login');
		}
	}
);

// Pause or unpause user work schedule
router.post('/userdata/workpause', (req, res) => {
	// let work_pause = req.body.pause;

	// Check if a user is logged in
	if (req.isAuthenticated()) {
		// Find the currently authenticated user by id
		User.findOne({ _id: req.user.id }).then(async (user) => {
			if (user.work_paused == true) {
				// If the user's work schedule is currently paused, then unpause it by setting work_paused to false
				await user.updateOne({ work_paused: false });

				// Check if the user's email reminder is off
				if (!Notifier.exists(user.id.toString()) && user.allow_email_notifier == true) {
					// Turn on the user's email reminders when schedule us unpaused
					Notifier.scheduler(
						user.work_days,
						user.work_end_hour,
						user.id.toString(),
						user.email,
						user.user_timezone
					);
				}

				req.flash('user_alert', 'Your work schedule has been unpaused');
				res.redirect('/users/dashboard');
			} else {
				// If the user's work schedule is currently unpaused, then pause it by setting work_paused to true
				await user.updateOne({ work_paused: true });

				// If the user has email reminders on, then remove it from the scheduler
				if (Notifier.exists(user.id.toString())) {
					Notifier.remover(user.id.toString());
				}

				req.flash('user_alert', 'Your work schedule has been paused');
				res.redirect('/users/dashboard');
			}
		});
	}
});

// Change the user's profile
router.post('/userdata/editprofile', async (req, res) => {
	let new_username = req.body.username;
	let new_company = req.body.company;

	if (req.isAuthenticated()) {
		await User.findOne({ _id: req.user.id }).then(async (user) => {
			if (user.username != new_username || user.company != new_company) {
				await user.updateOne({ username: new_username, company: new_company });

				req.flash('user_alert', 'Your profile has been updated');
				res.redirect('/users/dashboard');
			}
		});
	} else {
		res.redirect('/users/login');
	}
});

// Change the user's password
router.post('/userdata/editpassword', async (req, res) => {
	let current_pw = req.body.current_pw;
	let new_pw = req.body.new_pw;

	if (req.isAuthenticated()) {
		await User.findOne({ _id: req.user.id })
			.then((user) => {
				//match password
				bcrypt.compare(current_pw, user.password, async (err, isMatch) => {
					if (err) throw err;

					if (isMatch) {
						// Secure the user's password
						await bcrypt.genSalt(10, (err, salt) =>
							bcrypt.hash(new_pw, salt, async (err, hash) => {
								if (err) throw err;
								//set the password to the generated hash
								new_pw = hash;

								// Save user's new password to mongodb
								await user.updateOne({ password: new_pw });
							})
						);

						req.flash('user_alert', 'Your password has been changed');
						res.redirect('/users/dashboard');
					} else {
						req.flash('user_error', 'Current password incorrect');
						res.redirect('/users/dashboard');
					}
				});
			})
			.catch((err) => console.log(err));
	} else {
		res.redirect('/users/login');
	}
});

// Delete the user's account
router.post('/userdata/deleteaccount', async (req, res) => {
	let pw = req.body.password;

	if (req.isAuthenticated()) {
		await User.findOne({ _id: req.user.id }).then((user) => {
			//match password
			bcrypt.compare(pw, user.password, async (err, isMatch) => {
				if (err) throw err;

				if (isMatch) {
					// Delete the user's account from MongoDB
					await User.deleteOne({ _id: req.user.id });

					// Delete all Satis Reports by the user from MongoDB
					await SatisReport.deleteMany({ user_id: req.user.id });

					// End passport session and redirect user to login page
					req.flash('success_msg', 'Your account and reports have been deleted');
					req.logout();

					res.redirect('/users/login');
				} else {
					req.flash('user_error', 'Incorrect password');
					res.redirect('/users/dashboard');
				}
			});
		});
	} else {
		res.redirect('/users/login');
	}
});

export default router;
