import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// For random div keys
import random_string from 'crypto-random-string';

// API methods import
import * as api from '../../../api';

const Overview = (props) => {
	// Using hooks for state
	let [ months, setMonths ] = useState([]);
	let [ year, setYear ] = useState(new Date().getFullYear());
	let [ options, setOptions ] = useState();
	let [ isLoading, setIsLoading ] = useState(true);

	// Use this effect for on load and when ever year option changes
	useEffect(
		() => {
			setIsLoading(true);

			api.fetchAllSatis(props.user_data.user_id).then((resp) => {
				setIsLoading(false);

				// Array with only the years the user has set satis reports
				// If user has no mood reports, use the current year
				let years = [];

				if (resp.total_results != 0) {
					for (let i = 0; i < resp.results.length; i++) {
						if (!years.includes(resp.results[i].year)) {
							years.push(resp.results[i].year);
						}
					}
				} else {
					years.push(year);
				}

				// Generate options with the years
				setOptions(
					years.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))
				);

				// Set the array of months state by using the generate_calendar function
				setMonths(generate_calendar(resp));
			});
		},
		[ year ]
	);

	let generate_calendar = (resp) => {
		// Total days per month
		const month_days = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
		let days_in_month = 0;

		// Array for every month of the year
		let months = [ [], [], [], [], [], [], [], [], [], [], [], [] ];

		// Array holding month names
		const month_name = [
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

		// Check if the selected year is a leap year
		// If it is, then change February to 29 days
		if (leapYearCheck(year)) {
			month_days[1] = 29;
		}

		for (let i = 0; i < months.length; i++) {
			days_in_month = month_days[i];

			// Fill in the month with empty days first
			for (let j = 0; j < days_in_month; j++) {
				months[i].push(
					<div key={random_string({ length: 10, type: 'url-safe' })} className="blank_overview_day">
						{j + 1}
					</div>
				);
			}

			// If the user has no mood reports, skip this part
			if (resp.total_results != 0) {
				// Replace each empty day with a day that is reported
				// Check that the year for the reported day is the currently selected year
				resp.results.forEach((day) => {
					if (day.month - 1 == i && day.year == year) {
						months[i][day.day - 1] = (
							<div
								key={random_string({ length: 10, type: 'url-safe' })}
								className={'overview_day ' + day.mood}
							>
								{day.day}
							</div>
						);
					}
				});
			}

			// Generate empty days at beginning of month for a better calendar view
			// Get the first day of the month and check on what day of the week it lands on
			let fillInDays = new Date(i + 1 + '/' + '1' + '/' + parseInt(year)).getDay();
			fillInDays = fillInDays == 7 ? 0 : fillInDays;

			// Insert empty days at beginning of calendar
			for (let e = 1; e <= fillInDays; e++) {
				months[i].unshift(
					<div
						className="blank_overview_day month_aligner"
						key={random_string({ length: 10, type: 'url-safe' })}
					/>
				);
			}

			// Seven fill_empty_flex_box divs to fill empty space for correct last row alignment
			for (let b = 0; b < 12; b++) {
				months[i].push(
					<div className="fill_empty_flex_box" key={random_string({ length: 10, type: 'url-safe' })} />
				);
			}

			// Add month name with month days to array
			months[i].unshift(
				<div key={random_string({ length: 10, type: 'url-safe' })} className="overview_month_name">
					{month_name[i]}
				</div>
			);
		}

		// Array of months to show
		let months_to_show = [];

		// Add all months to a day holder
		months.forEach((month) => {
			months_to_show.push(
				<div key={random_string({ length: 10, type: 'url-safe' })} className="overview_day_holder">
					{month}
				</div>
			);
		});

		return months_to_show;
	};

	// Check if a year is a leap year
	function leapYearCheck(year) {
		return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
	}

	// Handle selecting a different year
	function yearOnChange(year) {
		setYear(year);
	}

	document.title = 'Overview';

	return (
		<div className="dashboard">
			<div className="page_title">Overview</div>
			<div className="monthly_report">
				{isLoading ? (
					<div className="month_loader" />
				) : (
					<div className="overview_report">
						<div className="year_selector">
							<select
								className="report_year_selector"
								name="year"
								id="year"
								onChange={(e) => yearOnChange(e.target.value)}
								value={year}
							>
								{options}
							</select>
						</div>
						<div className="day_keys">
							<div className="key ecstatic_bg">
								<div className="text">Ecstatic</div>{' '}
							</div>
							<div className="key happy_bg">
								<div className="text">Happy</div>{' '}
							</div>
							<div className="key content_bg">
								<div className="text">Content</div>{' '}
							</div>
							<div className="key displeased_bg">
								<div className="text">Displeased</div>{' '}
							</div>
							<div className="key disappointed_bg">
								<div className="text">Disappointed</div>{' '}
							</div>
							<div className="key stressed_bg">
								<div className="text">Stressed</div>{' '}
							</div>
						</div>
						{months}
					</div>
				)}
			</div>
		</div>
	);
};

Overview.propTypes = {
	user_data: PropTypes.object
};

export default Overview;
