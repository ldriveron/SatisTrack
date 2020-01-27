var mailer = require('nodemailer');
var CronManager = require('cron-job-manager');

let EmailNotifiers = new CronManager();

// Adds a new email notifier to the scheduler using cron-job-manager
// Use the user's ID to keep track of each job
let scheduler = (daysOfWeek, hour, userID, userEmail) => {
	let days = [];

	for (const day in daysOfWeek) {
		if (daysOfWeek[day] == 'true') {
			days.push(day.substring(0, 3));
		}
	}

	// Generate a random second value from 0-59 so that not all emails go out on the same second
	// If there are multiple users with the same work end hour, this would help keep things from going too slow
	let second = Math.floor(Math.random() * 60);

	let schedule_string = second + ' 0 ' + hour + ' * * ' + days;

	var mailOptions = {
		from: '"Satis Track" <satistrack@gmail.com>',
		to: userEmail,
		subject: 'Reminder to set your mood report on Satis Track!',
		html:
			'<div id="full_container" style="width: 100%; background-color: #EEF0F6; padding: 20px 0;">' +
			'<a href="http://localhost:4242" target="_blank" style="text-decoration: none;"><div id="logo_text" ' +
			'style="width: 100%; font-size: 30px; text-align: center; margin-bottom: 20px;">SATIS TRACK</div></a>' +
			'<div id="content_container" style="width: 60%; background-color: #fff; margin: 20px auto; ' +
			'padding: 30px; border-radius: 10px; text-align: center; font-size: 18px; font-weight: bold;">' +
			"It's time to set your mood report on Satis Track.<br><br>" +
			'<a href="http://localhost:4242" target="_blank" style="text-decoration: none;"><div id="begin_button" ' +
			'style="width: fit-content; margin: 0 auto; padding: 10px 30px; border: none; background-color: #fe9079; ' +
			'color: #fff; font-size: 16px; border-radius: 5px;">Click Here To Begin</div></a></div>' +
			'</div>'
	};

	EmailNotifiers.add(
		userID,
		schedule_string,
		async () => {
			var transporter = mailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'satistrack@gmail.com',
					pass: 'Lolidk1!'
				}
			});

			await transporter.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
		},
		{ start: true }
	);
};

// Remove a job based on the user's ID
let remove = (userID) => {
	EmailNotifiers.deleteJob(userID);
};

// Check if the user already has notifications turned on
let schedule_exists = (userID) => {
	return EmailNotifiers.exists(userID);
};

module.exports = {
	scheduler: scheduler,
	remover: remove,
	exists: schedule_exists
};
