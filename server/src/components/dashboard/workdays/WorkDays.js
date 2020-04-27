import React from 'react';
import PropTypes from 'prop-types';

const WorkDays = (props) => {
	// Array to keep the days of the week
	let days = [];

	let today = new Date();

	// Use Date to get the current day
	let current_day = today.getDate();

	// Get the starting day of the week
	let day_number = today.getDate() - today.getDay();

	// Adjust day_number for beginning of month
	if (day_number < 4) {
		day_number = new Date(today.getFullYear(), today.getMonth(), 0).getDate() - 2;
	}

	// Loop over all the user's work days and generate the list of days
	const one_day = Object.entries(props.work_days);
	for (const [ day_name, work_value ] of one_day) {
		// Adjust day_number back to start of month
		if (day_number > new Date(today.getFullYear(), today.getMonth(), 0).getDate() - 1) day_number = 1;

		// Set current_day css class to the current day
		let class_name = current_day == day_number ? ' current_day' : '';

		if (day_name == 'sunday') {
			class_name = class_name + ' sunday';
		} else if (day_name == 'saturday') {
			class_name = class_name + ' saturday';
		}

		// If the day of the week is a work day, set on_day class
		if (work_value == true) {
			days.push(
				<div className={'on_day' + class_name} key={day_name}>
					{day_name.substring(0, 2)}
					<div className="tooltip bottom">
						<div className="day_number">{day_number}</div>
						<span className="tiptext" style={{ marginTop: '5px', marginLeft: '-83px' }}>
							Work Day
						</span>
					</div>
				</div>
			);
		} else {
			// If the day of the week is not a work day, set off_day class
			days.push(
				<div className={'off_day' + class_name} key={day_name}>
					{day_name.substring(0, 2)}
					<div className="tooltip bottom">
						<div className="day_number">{day_number}</div>
						<span className="tiptext" style={{ marginTop: '5px', marginLeft: '-83px' }}>
							Off Day
						</span>
					</div>
				</div>
			);
		}

		// Continue to the next day
		day_number++;
	}

	return <div className="work_days">{days}</div>;
};

WorkDays.propTypes = {
	work_days: PropTypes.object
};

export default WorkDays;
