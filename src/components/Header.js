import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Header = (props) => {
	let userLinks = [];

	if (props.isLoggedIn) {
		userLinks.push(
			<div key="header" className="topnav" id="myTopnav">
				<Link key="dashboard" to="/users/dashboard">
					Dashboard
				</Link>
				<Link key="change_work_hours" to="/users/editschedule">
					Edit Schedule
				</Link>
				<div className="username">{props.username}</div>
				<form key="logout" action="logout?_method=DELETE" method="POST">
					<button type="submit" className="logout_button">
						Logout
					</button>
				</form>
			</div>
		);
	}
	return userLinks;
};

Header.propTypes = {
	isLoggedIn: PropTypes.bool,
	username: PropTypes.string
};

export default Header;
