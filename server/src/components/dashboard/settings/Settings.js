import React from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// Import components
import EditProfile from './EditProfile';
import EmailReminder from './EmailReminder';
import EditEmail from './EditEmail';
import EditPrivacy from './EditPrivacy';
import EditPassword from './EditPassword';
import ResetAccount from './ResetAccount';
import DeleteAccount from './DeleteAccount';

const Settings = (props) => {
	let username = props.user_data.username;
	let company = props.user_data.company;
	let current_email = props.user_data.email;
	let days_reported = props.user_data.days_reported;
	let allowed = props.user_data.allow_email_notifier;
	let email_confirmed = props.user_data.email_confirmed;
	let account_private = props.user_data.private;

	return (
		<div className="settings">
			<div className="page_title">Settings</div>
			<Router>
				<div className="left_links">
					<Link key="edit_profile" to="/users/settings/profile">
						<div className="link top_link">Edit Profile</div>
					</Link>

					<Link key="edit_email" to="/users/settings/email">
						<div className="link middle_link">Edit Email</div>
					</Link>

					<Link key="email_reminder" to="/users/settings/reminder">
						<div className="link middle_link">Email Reminder</div>
					</Link>

					<Link key="edit_privacy" to="/users/settings/privacy">
						<div className="link middle_link">Edit Privacy</div>
					</Link>

					<Link key="edit_password" to="/users/settings/password">
						<div className="link middle_link">Edit Password</div>
					</Link>

					<Link key="reset_account" to="/users/settings/reset">
						<div className="link middle_link">Reset Account</div>
					</Link>

					<Link key="delete_account" to="/users/settings/delete">
						<div className="link bottom_link">Delete Account</div>
					</Link>
				</div>
				<div className="right_panel form_box">
					<Switch>
						{/* Edit Profile Route */}
						<Route
							path="/users/settings/profile"
							exact
							render={(props) => <EditProfile {...props} username={username} company={company} />}
						/>

						{/* Edit Email Reminder Route */}
						<Route
							path="/users/settings/reminder"
							exact
							render={(props) => (
								<EmailReminder {...props} allowed={allowed} email_confirmed={email_confirmed} />
							)}
						/>

						{/* Edit Email Route */}
						<Route
							path="/users/settings/email"
							exact
							render={(props) => <EditEmail {...props} current_email={current_email} />}
						/>

						{/* Edit Privacy Route */}
						<Route
							path="/users/settings/privacy"
							exact
							render={(props) => <EditPrivacy {...props} account_private={account_private} />}
						/>

						{/* Edit Password Route */}
						<Route path="/users/settings/password" exact render={(props) => <EditPassword {...props} />} />

						{/* Reset Account Route */}
						<Route path="/users/settings/reset" exact render={(props) => <ResetAccount {...props} />} />

						{/* Delete Profile Route */}
						<Route
							path="/users/settings/delete"
							exact
							render={(props) => (
								<DeleteAccount {...props} username={username} days_reported={days_reported} />
							)}
						/>
					</Switch>
				</div>
			</Router>
		</div>
	);
};

Settings.propTypes = {
	user_data: PropTypes.object
};

export default Settings;
