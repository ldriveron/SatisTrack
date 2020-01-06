import React from 'react';
import PropTypes from 'prop-types';

const CurrentHours = (props) => {
	{
		/* This code uses the users set work hours and makes them easier to read */
	}
	return (
		<div className="current_hours">
			<div className="hour">
				Start<br />
				{props.work_start_hour % 12 ? props.work_start_hour % 12 : 12}:00{' '}
				{props.work_start_hour == 24 ? 'am' : props.work_start_hour >= 12 ? 'pm' : 'am'}
			</div>
			<div className="hour">
				End<br />
				{props.work_end_hour % 12 ? props.work_end_hour % 12 : 12}:00{' '}
				{props.work_end_hour == 24 ? 'am' : props.work_end_hour >= 12 ? 'pm' : 'am'}
			</div>
		</div>
	);
};

CurrentHours.propTypes = {
	work_start_hour: PropTypes.number,
	work_end_hour: PropTypes.number
};

export default CurrentHours;
