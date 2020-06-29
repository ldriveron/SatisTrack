// API server routes

import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();

// MongoDB models for api search
import User from '../models/User';
import SatisReport from '../models/SatisReport';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// For email confirmation
//import mailer from 'nodemailer';
import random_string from 'crypto-random-string';
import ConfirmEmail from './ConfirmEmailHelper';
//import config from '../config';

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
					user.username,
					user.user_timezone
				);
			}
		});
	});
};

// Begin setting up email notifiers
initEmailNotifiers();

// Return the current user's information
router.get('/userdata', async (req, res) => {
	if (req.isAuthenticated()) {
		await User.findOne({ _id: req.user.id }).then((user) =>
			res.send({
				user: {
					username: user.username,
					email: user.email,
					work_start_hour: user.work_start_hour,
					work_end_hour: user.work_end_hour,
					work_paused: user.work_paused,
					last_schedule_edit: user.last_schedule_edit,
					last_report_date: user.last_report_date,
					allow_email_notifier: user.allow_email_notifier,
					email_confirmed: user.email_confirmed,
					days_reported: user.days_reported,
					reporting_streak: user.reporting_streak,
					total_streaks: user.total_streaks,
					work_days: user.work_days,
					company: user.company,
					private: user.private
				}
			})
		);
	} else {
		res.redirect('/users/login');
	}
});

// Return a single user's information based on username
router.get('/:username', async (req, res) => {
	await User.findOne({ username: RegExp('\\b' + req.params.username + '\\b', 'i') }).then((user) => {
		if (user == null) {
			// If no user is found matching the username, then set error to 1
			// Indicating that no user was found
			res.send({ user: { error: 1 } });
		} else {
			// If the user's account is not private, return the required data
			if (user.private == false) {
				res.send({
					user: {
						id: user.id,
						username: user.username,
						work_start_hour: user.work_start_hour,
						work_end_hour: user.work_end_hour,
						work_paused: user.work_paused,
						days_reported: user.days_reported,
						reporting_streak: user.reporting_streak,
						total_streaks: user.total_streaks,
						work_days: user.work_days,
						company: user.company,
						private: user.private,
						current: req.user.id == user.id,
						error: 0
					}
				});
			} else if (user.private == true) {
				// If the user's account is private, do not return all of the data
				res.send({
					user: {
						id: user.id,
						username: user.username,
						private: user.private,
						current: req.user.id == user.id,
						error: 0
					}
				});
			}
		}
	});
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
			//user.work_days[days_of_week[yesterday.getDay()]] is a boolean
			if (
				user.work_days[days_of_week[yesterday.getDay()]] &&
				user.last_report_date != yesterday.toLocaleDateString('en-US', { timeZone: req.user.user_timezone }) &&
				user.last_report_date != today &&
				user.work_paused == false
			) {
				await user.updateOne({ reporting_streak: 0 });
			}

			// Update last activity date to current day
			if (user.last_activity != today) {
				await user.updateOne({ last_activity: today });
			}
		});

		res.send({ id: req.user.id });
	} else {
		res.redirect('/users/login');
	}
});

// Get all the user's mood reports from MongoDB sorted by date
// If there are none, then respond with total_results: 0
router.get('/satis/all', (req, res) => {
	if (req.isAuthenticated()) {
		SatisReport.find({ user_id: req.user.id }).sort('+date').then((report) => {
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

// Get all the user's mood reports from MongoDB sorted by date
// If there are none, then respond with total_results: 0
// This route is used for public overviews
router.get('/satis/public/:id', (req, res) => {
	// First find the user and check if their profile is set to public
	// If it is public, then find all of their mood reports
	User.findOne({ _id: req.params.id }).then((user) => {
		if (user.private == false) {
			SatisReport.find({ user_id: req.params.id }).sort('+date').then((report) => {
				if (report.length !== 0) {
					res.send({ total_results: report.length, results: report });
				} else {
					res.send({ total_results: 0 });
				}
			});
		}
	});
});

// Get one month's report based on year
// The result will be retreived based on logged in user, selected year and month, and sorted by day.
router.get('/satis/:year/:month', (req, res) => {
	if (req.isAuthenticated()) {
		SatisReport.find({ user_id: req.user.id, year: req.params.year, month: req.params.month })
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
router.post([ '/satis/report/:mood', '/satis/report/:mood/:recap' ], async (req, res) => {
	if (
		req.isAuthenticated() &&
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

		let user_id = req.user.id;
		let mood = req.params.mood;
		// Set today Date by using the user's timezone
		let today = new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone });
		today = new Date(today);
		const date = today.toLocaleDateString('en-US', { timeZone: req.user.user_timezone });
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
				user.last_report_date != yesterday.toLocaleDateString('en-US', { timeZone: req.user.user_timezone }) &&
				user.last_report_date != today.toLocaleDateString('en-US', { timeZone: req.user.user_timezone })
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
					last_report_date: today.toLocaleDateString('en-US', { timeZone: req.user.user_timezone }),
					days_reported: user.days_reported + 1,
					reporting_streak: reporting_streak,
					first_satis_report: today.toLocaleDateString('en-US', { timeZone: req.user.user_timezone })
				});
			} else if ((user.reporting_streak + 1) % 5 == 0) {
				await user.updateOne({
					last_report_date: today.toLocaleDateString('en-US', { timeZone: req.user.user_timezone }),
					days_reported: user.days_reported + 1,
					reporting_streak: reporting_streak,
					total_streaks: user.total_streaks + 1
				});
			} else {
				await user.updateOne({
					last_report_date: today.toLocaleDateString('en-US', { timeZone: req.user.user_timezone }),
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
router.post('/userdata/sethours/:startHour/:endHour', async (req, res) => {
	if (req.isAuthenticated()) {
		await User.findOne({ _id: req.user.id }).then(async (user) => {
			await user.updateOne({
				work_start_hour: req.params.startHour,
				work_end_hour: req.params.endHour,
				last_schedule_edit: new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone })
			});

			// Update email notifier schedule for the user
			if (Notifier.exists(user.id.toString()) && user.allow_email_notifier == true) {
				Notifier.remover(user.id.toString());
				Notifier.scheduler(
					user.work_days,
					req.params.endHour,
					user.id.toString(),
					user.email,
					user.username,
					user.user_timezone
				);
			}
		});

		req.flash('user_alert', 'Your work hours have been updated');
		res.redirect('/users/dashboard');
	} else {
		res.redirect('/users/login');
	}
});

// Update the user's work schedule
// Also update their last schedule edit to today's date
router.post(
	'/userdata/setschedule/:sunday/:monday/:tuesday/:wednesday/:thursday/:friday/:saturday',
	async (req, res) => {
		let new_days = {
			sunday: JSON.parse(req.params.sunday.toLowerCase()),
			monday: JSON.parse(req.params.monday.toLowerCase()),
			tuesday: JSON.parse(req.params.tuesday.toLowerCase()),
			wednesday: JSON.parse(req.params.wednesday.toLowerCase()),
			thursday: JSON.parse(req.params.thursday.toLowerCase()),
			friday: JSON.parse(req.params.friday.toLowerCase()),
			saturday: JSON.parse(req.params.saturday.toLowerCase())
		};

		if (req.isAuthenticated()) {
			await User.findOne({ _id: req.user.id }).then(async (user) => {
				await user.updateOne({
					work_days: new_days,
					last_schedule_edit: new Date().toLocaleDateString('en-US', { timeZone: req.user.user_timezone })
				});

				// Update email notifier schedule for the user
				if (Notifier.exists(user.id.toString()) && user.allow_email_notifier == true) {
					Notifier.remover(user.id.toString());
					Notifier.scheduler(
						new_days,
						user.work_end_hour,
						user.id.toString(),
						user.email,
						user.username,
						user.user_timezone
					);
				}
			});

			req.flash('user_alert', 'Your work days have been updated');
			res.redirect('/users/dashboard');
		} else {
			res.redirect('/users/login');
		}
	}
);

// Pause or unpause user work schedule
router.post('/userdata/workpause', (req, res) => {
	// Check if a user is logged in
	if (req.isAuthenticated()) {
		// Find the currently authenticated user by id
		User.findOne({ _id: req.user.id }).then(async (user) => {
			if (user.work_paused == true) {
				// If the user's work schedule is currently paused, then unpause it by setting work_paused to false
				await user.updateOne({ work_paused: false });

				// Check if the user's email reminders is paused
				if (!Notifier.exists(user.id.toString()) && user.allow_email_notifier == true) {
					// Start the user's email reminders when schedule is unpaused
					Notifier.scheduler(
						user.work_days,
						user.work_end_hour,
						user.id.toString(),
						user.email,
						user.username,
						user.user_timezone
					);
				}

				req.flash('user_alert', 'Your work schedule has been unpaused');
				res.redirect('/users/dashboard');
			} else {
				// If the user's work schedule is currently unpaused, then pause it by setting work_paused to true
				await user.updateOne({ work_paused: true });

				// If the user has email reminders on, then put it on pause
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
		await User.findOne({ username: new_username }).then(async (user) => {
			if (user) {
				req.flash('user_alert', "'" + new_username + "' is already taken");
				res.redirect('/users/dashboard');
			} else {
				await User.findOne({ _id: req.user.id }).then(async (user) => {
					if (user.username != new_username || user.company != new_company) {
						// If the user changes their username and their email notifier is active,
						// remove their current notifier and replace it with the new username
						if (user.username != new_username) {
							if (user.allow_email_notifier && Notifier.exists(user.id.toString())) {
								Notifier.remover(user.id.toString());

								Notifier.scheduler(
									user.work_days,
									user.work_end_hour,
									req.user.id,
									user.email,
									new_username,
									user.user_timezone
								);
							}
						}

						await user.updateOne({ username: new_username, company: new_company });

						req.flash('user_alert', 'Your profile has been updated');
						res.redirect('/users/dashboard');
					}
				});
			}
		});
	} else {
		res.redirect('/users/login');
	}
});

// Edit uer's email address
router.post('/userdata/editemail', (req, res) => {
	if (req.isAuthenticated()) {
		// Get the new email entered by user
		let newEmail = req.body.newEmail;

		// If there is currently no user with the new email, then continue with updating
		User.findOne({ email: newEmail }).then(async (user) => {
			if (user) {
				req.flash('user_alert', 'Email entered is already registered');
				res.redirect('users/dashboard');
			} else {
				await User.findOne({ _id: req.user.id }).then(async (user) => {
					// This is the code that will be sent in the url to the user
					let confirmation_code = random_string({ length: 10, type: 'url-safe' });

					// This is for the encrypted version of the confirmation code
					let confirmation_code_secret;

					// Generate a hash for the confirmation code
					await bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(confirmation_code, salt, async (err, hash) => {
							if (err) throw err;

							confirmation_code_secret = hash;

							// Send email to user's new email containing confirmation url
							// Only update the user data if the email was actually sent
							if (ConfirmEmail.sendEmail(newEmail, confirmation_code, req.user.id) != 1) {
								// Check if the user has email notifications turned on
								// If they do, then turn it off for the email change
								// Using an if else statement here so there is only one update needed
								if (Notifier.exists(req.user.id.toString())) {
									Notifier.remover(req.user.id.toString());

									// Reflect this change in the database
									// Set the user's email_confirmed field to false
									// Update confirmation code for user in database using hash version
									await user.updateOne({
										email: newEmail,
										email_confirmed: false,
										confirmation_code: confirmation_code_secret,
										allow_email_notifier: false
									});
								} else {
									// Set the user's email_confirmed field to false
									// Update confirmation code for user in database using hash version
									await user.updateOne({
										email: newEmail,
										email_confirmed: false,
										confirmation_code: confirmation_code_secret
									});
								}

								// Alert the user of the change
								req.flash('user_alert', 'Check your new email for a confirmation link');
								res.redirect('/users/dashboard');
							} else {
								// Alert the user that the email change was not successful
								req.flash('user_alert', 'An error occurred. Try again or enter a different email.');
								res.redirect('/users/dashboard');
							}
						});
					});
				});
			}
		});
	} else {
		res.redirect('/users/login');
	}
});

// Edit user's email reminder setting
router.post('/userdata/editreminder', (req, res) => {
	if (req.isAuthenticated()) {
		User.findOne({ _id: req.user.id }).then(async (user) => {
			// Check if the user's notifications are already on
			if (
				(user.allow_email_notifier == false || user.allow_email_notifier == true) &&
				!Notifier.exists(req.user.id.toString())
			) {
				// If the user's email notification is turned off, then turn it on
				// If for some reason the user's notifier is set to true in the database, but it is not active in
				// the server, then turn it on as well
				Notifier.scheduler(
					user.work_days,
					user.work_end_hour,
					req.user.id.toString(),
					user.email,
					user.username,
					user.user_timezone
				);

				await user.updateOne({ allow_email_notifier: true });

				req.flash('user_alert', 'Email notifications have been enabled');
				res.redirect('/users/dashboard');
			} else if (user.allow_email_notifier == true && Notifier.exists(req.user.id.toString())) {
				// If the user's email notification is turned on, then turn it off
				Notifier.remover(req.user.id.toString());

				await user.updateOne({ allow_email_notifier: false });

				req.flash('user_alert', 'Email notifications have been disabled');
				res.redirect('/users/dashboard');
			} else if (user.allow_email_notifier == false && Notifier.exists(req.user.id.toString())) {
				// If for some reason the user's notifier is set to false in the database, but it is active in
				// the server, then turn it off
				Notifier.remover(req.user.id.toString());

				req.flash('user_alert', 'Email notifications have been disabled');
				res.redirect('/users/dashboard');
			}
		});
	} else {
		res.redirect('/users/login');
	}
});

// Resend email confirmation to user if requested
router.post('/userdata/confirmemail', (req, res) => {
	if (req.isAuthenticated()) {
		User.findOne({ _id: req.user.id }).then(async (user) => {
			// Only send an email confirmation if the user's email is not already confirmed
			if (user.email_confirmed != true) {
				let confirmation_code = random_string({ length: 10, type: 'url-safe' });

				// This is for the encrypted version of the confirmation code
				let confirmation_code_secret;

				// Generate a hash for the confirmation code
				await bcrypt.genSalt(10, (err, salt) =>
					bcrypt.hash(confirmation_code, salt, async (err, hash) => {
						if (err) throw err;

						confirmation_code_secret = hash;

						// Send email to user containing confirmation email
						if (ConfirmEmail.sendEmail(req.user.email, confirmation_code, req.user.id) != 1) {
							// Update confirmation code for user in database using hash version
							await user.updateOne({ confirmation_code: confirmation_code_secret });

							req.flash('user_alert', 'Check your email for a new confirmation link');
							res.redirect('/users/dashboard');
						} else {
							req.flash('user_alert', 'An error occurred. Try again.');
							res.redirect('/users/dashboard');
						}
					})
				);
			} else {
				req.flash('user_alert', 'Your email is already confirmed');
				res.redirect('/users/dashboard');
			}
		});
	} else {
		res.redirect('/users/login');
	}
});

// Edit user's privacy setting
router.post('/userdata/editprivacy', (req, res) => {
	if (req.isAuthenticated()) {
		User.findOne({ _id: req.user.id }).then(async (user) => {
			// Check if the user's account is set to private
			if (user.private == true) {
				// If the user's account is set to private, set it to public by changing private to false
				await user.updateOne({ private: false });

				req.flash('user_alert', 'Your Mood Report Overview is now public');
				res.redirect('/users/dashboard');
			} else if (user.private == false) {
				// If the user's account is set to public, set it to private by changing private to true
				await user.updateOne({ private: true });

				req.flash('user_alert', 'Your Mood Report Overview is now private');
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

					// Update email notifier schedule for the user
					if (Notifier.exists(user.id.toString())) {
						Notifier.remover(user.id.toString());
					}

					// End passport session and redirect user to login page
					req.flash('success_msg', 'Your account and mood reports have been deleted');
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
