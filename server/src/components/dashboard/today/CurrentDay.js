import React from 'react';
import PropTypes from 'prop-types';

const CurrentDay = (props) => {
	// Set variables to current day information
	let today = new Date();
	let current_date = today.toLocaleDateString();
	let current_hour = today.getHours();
	let current_minutes = today.getMinutes();
	if (current_minutes.toString().length == 1) {
		current_minutes = '0' + current_minutes;
	}
	let current_seconds = today.getSeconds();
	//let current_weekday = today.getDay();

	// The code below is used to calculate the remaining hours before the user can set their mood report
	let day_of_week = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
	let start_day;
	// Start checking from tomorrow's date if user set their mood report on the current day
	if (current_date == props.last_report_date) {
		start_day = today.getDay() + 1;
	} else {
		start_day = today.getDay();
	}
	let days_remaining = 0;
	let total_hours_remaining = 0;
	let day_found = false;

	// While the user's next workday is not found, calculate how many days remain until their next work day.
	// Multiply the remaining days by 24 and add to it the difference of the user's work end hour and the currenet hour.
	// Set this calculation to total_hours_remaining.
	function calculateHoursRemaining() {
		while (day_found == false) {
			if (start_day == 7) {
				start_day = 0;
			}

			if (props.work_days[day_of_week[start_day]] == 'false') {
				days_remaining++;
				start_day++;
			} else {
				day_found = true;
			}
		}

		// If there are no days remaining, it means the user works on this day and only the difference from the user's
		// work end hour and the current hour need to be calculated. If there is less than an hour remaining, show 0 hours.
		if (current_date == props.last_report_date && days_remaining == 0) {
			if (Math.abs(props.work_end_hour - current_hour + 24) > 24) {
				total_hours_remaining = 0;
			} else {
				total_hours_remaining = Math.abs((props.work_end_hour - current_hour + 23) % 24);
			}
		} else {
			total_hours_remaining = days_remaining * 24 + Math.abs((props.work_end_hour - current_hour + 23) % 24);
		}
	}

	// Get the current day of the week
	let days_of_week = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
	let current_day = days_of_week[today.getDay()];

	// Minutes and seconds countdown for when the current hour is the users work end hour
	function startTimer(duration, display) {
		let timer = duration,
			minutes,
			seconds;
		let interval = setInterval(function() {
			minutes = parseInt(timer / 60, 10);
			seconds = parseInt(timer % 60, 10);

			minutes = minutes < 10 ? '0' + minutes : minutes;
			seconds = seconds < 10 ? '0' + seconds : seconds;

			display.textContent = minutes + ':' + seconds;

			if (--timer < 0) {
				timer = duration;
			}

			if (minutes == 0 && seconds == 0) {
				// Remove NewSatisReport component when timer is over
				props.disableSatisSetter();
				clearInterval(interval);
			}
		}, 1000);
	}

	// Create a timer for 60 minutes
	// Time remaining will decrease depending on the minutes remaining for the current hour
	function beginMinutesCounter() {
		var remaining_minutes = 60 * (60 - current_minutes) - current_seconds,
			display = document.querySelector('#time_remaining');

		// Start timer when #time_remaining div is found
		if (display) {
			startTimer(remaining_minutes, display);
		}
	}

	const content = (
		<div className="current_day_details">
			<div className="detail_box">
				<p>
					Current Date
					<span className="current_day_word">{current_day}</span>
					<br />
					<span className="date_hour_text">{current_date}</span>
				</p>
			</div>
			<div className="detail_box">
				{/* If the user's work schedule is paused do not show a timer */}
				{props.work_paused == true ? (
					<div className="tooltip bottom">
						<div className="detail_box time_remaining" style={{ fontSize: '22px' }}>
							Paused
						</div>
						<span className="tiptext">Your work schedule is paused.</span>
					</div>
				) : props.work_end_hour == current_hour &&
				props.day_is_set &&
				props.user_works_today == true &&
				props.work_paused == false ? (
					<div className="tooltip bottom">
						<div className="detail_box time_remaining equal">
							<div id="time_remaining" onLoad={beginMinutesCounter()} />
						</div>
						<span className="tiptext">Minutes remaning to set your mood for today.</span>
					</div>
				) : (
					<div className="tooltip bottom">
						<div className="detail_box time_remaining" onLoad={calculateHoursRemaining()}>
							{total_hours_remaining}h<br />
							{60 - current_minutes}m
						</div>
						<span className="tiptext">Time remaining until you can set your mood for the day.</span>
					</div>
				)}
			</div>
			<div className="detail_box">
				<p>
					Current Hour<br />
					<span className="date_hour_text">
						{current_hour % 12 ? current_hour % 12 : 12}:00{' '}
						{current_hour == 23 ? 'am' : current_hour >= 12 ? 'pm' : 'am'}
					</span>
				</p>
			</div>
		</div>
	);

	return content;
};

CurrentDay.propTypes = {
	disableSatisSetter: PropTypes.func,
	work_days: PropTypes.object,
	user_works_today: PropTypes.bool,
	last_report_date: PropTypes.string,
	work_end_hour: PropTypes.number,
	day_is_set: PropTypes.bool,
	work_paused: PropTypes.bool
};

export default CurrentDay;
