import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Header = (props) => {
	let userLinks = [];

	userLinks.push(
		<div key="header" className="topnav" id="myTopnav">
			<Link key="dashboard" to="/users/dashboard">
				Dashboard
			</Link>
			<Link key="change_work_hours" to="/users/editschedule">
				Edit Schedule
			</Link>
			<div className="username">{props.user_data.username}</div>
			<div className="tooltip bottom">
				<div className="user_header_stat left">{props.user_data.days_reported}</div>
				<span className="tiptext" style={{ marginLeft: '-80px' }}>
					Total Reports
				</span>
			</div>

			<div className="tooltip bottom">
				<div className="user_header_stat">{props.user_data.reporting_streak}</div>
				<span className="tiptext" style={{ marginLeft: '-80px' }}>
					Total Reports In a Row
				</span>
			</div>

			<div className="tooltip bottom">
				<div className="user_header_stat right">{props.user_data.total_streaks}</div>
				<span className="tiptext" style={{ marginLeft: '-80px' }}>
					Total 5-Day Reporting Streaks
				</span>
			</div>

			<form key="logout" action="logout?_method=DELETE" method="POST">
				<button type="submit" className="logout_button">
					Logout
				</button>
			</form>
		</div>
	);

	return userLinks;
};

Header.propTypes = {
	isLoggedIn: PropTypes.bool,
	user_data: PropTypes.object
};

export default Header;
