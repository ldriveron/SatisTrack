import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// API methods import
import * as api from '../../../api';

// Component import
import SingleDay from './SingleDay';

const MonthReport = (props) => {
	// Use useState() hook for calendar days
	let [ days, setDays ] = useState([]);
	let [ isLoading, setIsLoading ] = useState(true);

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const month_days = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

	// Show default satis report for current year and month
	if (!props.match.params.month) {
		props.match.params.month = props.month;
	}

	// When the chosen month or year changes, then update the components state by fetching a new satis report
	useEffect(
		() => {
			setIsLoading(true);
			api
				.fetchMonthSatis(props.user_id, props.year, props.match.params.month)
				.then((resp) => {
					setIsLoading(false);
					setDays(generateMonthCalendar(month_days[props.match.params.month - 1], resp));
				})
				.catch(console.error);
		},
		[ props.match.params.month, props.year ]
	);

	function generateMonthCalendar(days_in_month, resp) {
		// If the chosen year is a leap year and selected month is 2, then set days_in_month to 29
		if (leapYearCheck(props.year) && props.match.params.month == 2) {
			days_in_month = 29;
		}

		// Array for all month days
		let days_to_show = [];

		// Generate month calendar with blank days
		for (let i = 1; i <= days_in_month; i++) {
			days_to_show.push(
				<div className="blank_day" key={i}>
					{i}
				</div>
			);
		}

		// If there are Satis Reports for this month, then place them in the days_to_show array
		if (resp.total_results != 0) {
			// Array containing days reported by user
			let days_reported = [];
			for (let i = 0; i < resp.result.length; i++) {
				days_reported.push(resp.result[i].day);
			}

			for (let i = 0; i < days_reported.length; i++) {
				days_to_show[days_reported[i] - 1] = <SingleDay key={i + resp.result[i].mood} day={resp.result[i]} />;
			}
		}

		// Return the month calendar to be set on the days state
		return days_to_show;
	}

	function leapYearCheck(year) {
		return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
	}

	return (
		<div className="month_container">
			<div className="month_title">
				{months[props.match.params.month - 1]}, {props.year}
			</div>
			{isLoading ? (
				<div className="month_loader" />
			) : (
				<div className="days_holder">{days.length > 0 && days}</div>
			)}
		</div>
	);
};

MonthReport.propTypes = {
	match: PropTypes.object,
	user_id: PropTypes.string,
	year: PropTypes.number,
	month: PropTypes.number
};

export default MonthReport;
