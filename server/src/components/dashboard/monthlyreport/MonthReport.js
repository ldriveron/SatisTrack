import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// API methods import
import * as api from '../../../api';

// Component import
import SingleDay from './SingleDay';
import MonthStats from './MonthStats';

const MonthReport = (props) => {
	// Use useState() hook for calendar days
	let [ days, setDays ] = useState([]);
	let [ moodResults, setMoodResults ] = useState([]);
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
				.fetchMonthSatis(props.year, props.match.params.month)
				.then((resp) => {
					setIsLoading(false);
					// Update the state using useState()
					setDays(generateMonthCalendar(month_days[props.match.params.month - 1], resp));

					// Get mood results for CurrentMonthStats component.
					// If the total results is not 0, then set moodResults to the resp result.
					// If it is 0, then reset the moodResults to an empty array [].
					if (resp.total_results != 0) {
						setMoodResults(resp.result);
					} else {
						setMoodResults([]);
					}
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

		// If the blank day is the current day and during the current month, add a blue bottom border
		// to indicate the current day on the calendar
		let today = new Date();
		let highlight = '';
		let month_match = today.getMonth() + 1 == props.match.params.month;

		// Generate month calendar with blank days
		for (let i = 1; i <= days_in_month; i++) {
			// Add a blue bottom border to the current day
			if (today.getDate() == i && month_match) {
				highlight = ' current_day_highlight';
			} else {
				highlight = '';
			}
			days_to_show.push(
				<div className={'blank_day' + highlight} key={i}>
					{i}
				</div>
			);
		}

		// If there are Satis Reports for this month, then place them in the days_to_show array.
		// If there are none, then just return the previous blank days month calendar.
		if (resp.total_results != 0) {
			// Array containing days of this month reported by user
			let days_reported = [];
			for (let i = 0; i < resp.result.length; i++) {
				days_reported.push(resp.result[i].day);
			}

			// Replace each blank day with a reported day on the days to show array
			for (let i = 0; i < days_reported.length; i++) {
				days_to_show[days_reported[i] - 1] = (
					<SingleDay key={i + resp.result[i].mood} day={resp.result[i]} month_match={month_match} />
				);
			}
		}

		// Generate empty days at beginning of month for a better calendar view
		// Get the first day of the month and check on what day of the week it lands on
		let fillInDays = new Date(props.match.params.month + '/' + '1' + '/' + props.year).getDay();
		fillInDays = fillInDays == 7 ? 0 : fillInDays;

		// Insert empty days at beginning of calendar
		for (let i = 1; i <= fillInDays; i++) {
			days_to_show.unshift(<div className="blank_day month_aligner" key={i + 60} />);
		}

		// Seven fill_empty_flex_box divs to fill empty space for correct last row alignment
		for (let i = 0; i < 7; i++) {
			days_to_show.push(<div className="fill_empty_flex_box " key={'spacer_' + i} />);
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
				<div>
					{moodResults.length > 0 && <MonthStats days={moodResults} />}
					{/* Day names of week at top of calendar */}
					<div className="week_day_names">
						<span>Sunday</span>
						<span>Monday</span>
						<span>Tuesday</span>
						<span>Wednesday</span>
						<span>Thursday</span>
						<span>Friday</span>
						<span>Saturday</span>
					</div>
					<div className="days_holder">{days.length > 0 && days}</div>
				</div>
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
