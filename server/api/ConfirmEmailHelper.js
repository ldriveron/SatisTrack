// For email confirmation
import mailer from 'nodemailer';
import config from '../config';

// This function is used to send an email confirmation link to users
// It is currently used in: api/index.js, routes/users.js

// Send an email containing an email confirmation link to the user
let sendEmail = async (email, confirmation_code, id) => {
	let confirm_url = 'https://satistracker.com/users/email_confirm/' + confirmation_code + '/' + id;

	var mailOptions = {
		from: '"Satis Tracker" <satistracker@gmail.com>',
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
			user: 'satistracker@gmail.com',
			pass: config.emps
		}
	});

	await transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
			// return 1 if an error occurred
			return 1;
		} else {
			console.log('Confirmation email sent: ' + info.response);
			// return 0 if no error occurred
			return 0;
		}
	});
};

module.exports = {
	sendEmail: sendEmail
};
