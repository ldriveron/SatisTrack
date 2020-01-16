import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const MonthNavigator = (props) => {
	const months = [ 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.' ];

	// Generate array with all month links using year and month props
	let links = [];
	for (let i = 0; i <= 11; i++) {
		links.push(
			<span key={i}>
				<Link key={months[i]} to={'/users/report/' + props.year + '/' + (i + 1)}>
					{months[i]}
				</Link>
			</span>
		);
	}

	return (
		<div key="header" className="topnav" id="myTopnav" style={{ width: 'fit-content' }}>
			{links}
		</div>
	);
};

MonthNavigator.propTypes = {
	year: PropTypes.number
};

export default MonthNavigator;
