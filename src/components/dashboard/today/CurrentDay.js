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
	// const current_weekday = today.getDay();

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
				{props.work_end_hour == current_hour && props.day_is_set ? (
					<div className="tooltip bottom">
						<div className="detail_box time_remaining equal">
							<div id="time_remaining" onLoad={beginMinutesCounter()} />
						</div>
						<span className="tiptext">Minutes remaning to set your mood for today.</span>
					</div>
				) : (
					<div className="tooltip bottom">
						<div className="detail_box time_remaining">
							{(props.work_end_hour - current_hour + 24) % 24 != 1 && props.setting_satis == false ? (
								(props.work_end_hour - current_hour + 24) % 24
							) : (
								'24'
							)}h<br />
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
	work_end_hour: PropTypes.number,
	day_is_set: PropTypes.bool
};

export default CurrentDay;
