import React from 'react';
import PropTypes from 'prop-types';

const WorkDays = (props) => {
	// Array to keep the days of the week
	let days = [];

	// Current day data
	let today = new Date();

	// Get the starting day of the month (ex: 1-31)
	let day_number = today.getDate();

	// Get the current month
	let compare_month = today.getMonth();

	// Figure out what week of the month the day is in
	// Considering Sunday as first day of the week
	Date.prototype.week_of_month = function(date) {
		var first_weekday = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
		if (first_weekday < 0) first_weekday = 6;
		var date_offset = date.getDate() + first_weekday - 2;
		return Math.floor(date_offset / 7);
	};

	// Adjust day_number for beginning of month
	// If the day_number is less than 6, day does not land on a sunday, and is during the first week of the month,
	// then day_number needs to be set to the previous month's days
	if (day_number < 6 && today.getDay() != 0 && Date.prototype.week_of_month(today) == 0) {
		let fillInDays = new Date(compare_month + 1 + '/' + '1' + '/' + today.getFullYear()).getDay();
		fillInDays = fillInDays == 7 ? 0 : fillInDays - 1;
		day_number = new Date(today.getFullYear(), compare_month, 0).getDate() - fillInDays;
	} else {
		// In the case of any week besides the first, begin the day_number count for the first day of the week
		// by substracting the total number of days in the month by the week day number
		day_number = today.getDate() - today.getDay();
		compare_month = today.getMonth() + 1;
	}

	// Loop over all the user's work days and generate the list of days
	const one_day = Object.entries(props.work_days);
	for (const [ day_name, work_value ] of one_day) {
		// Adjust day_number back to start of month after previous month's total days is reached
		if (day_number > new Date(today.getFullYear(), compare_month, 0).getDate()) day_number = 1;

		// Set current_day css class to the current day
		let class_name = today.getDate() == day_number ? ' current_day' : '';

		// Add sunday or saturday class for rounded edges
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
