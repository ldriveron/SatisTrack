import React from 'react';
import PropTypes from 'prop-types';

const EmailReminder = (props) => {
	document.title = 'Email Reminder';

	return (
		<div>
			<form action="/api/userdata/editreminder" method="POST">
				<div className="panel_title">Email Reminder</div>
				Allow Satis Tracker to send you an email reminder on the days you work, on the hour you leave work.<br
				/>
				<br />
				{props.email_confirmed == true ? (
					<div>
						<button type="submit" className="formButton">
							{props.allowed == true ? 'Deactivate Reminder' : 'Activate Reminder'}
						</button>
					</div>
				) : (
					<div style={{ color: 'red' }}>
						Please check your email for a confirmation link
						<br />
						<br />
						<form action="/api/userdata/confirmemail" method="POST">
							<div>
								<button type="submit" className="formButton" style={{ width: 'fit-content' }}>
									Resend confirmation email
								</button>
							</div>
						</form>
					</div>
				)}
			</form>
		</div>
	);
};

EmailReminder.propTypes = {
	allowed: PropTypes.bool,
	email_confirmed: PropTypes.bool
};

export default EmailReminder;
