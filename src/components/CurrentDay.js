import React from 'react';

const CurrentDay = (props) => {
	const today = new Date();

	// Set variables to current day information
	let current_date = today.toLocaleDateString();
	let current_hour = today.getHours();
	let current_minutes = today.getMinutes();
	if (current_minutes.toString().length == 1) {
		current_minutes = '0' + current_minutes;
	}
	let current_seconds = today.getSeconds();
	// const current_weekday = today.getDay();

	// Get the current day of the week
	let days_of_week = [ 'Su', 'M', 'T', 'W', 'Th', 'F', 'Sa' ];
	let current_day = days_of_week[today.getDay()];

	// Minutes and seconds countdown for when the current hour is the users work end hour
	function startTimer(duration, display) {
		var timer = duration,
			minutes,
			seconds;
		var interval = setInterval(function() {
			minutes = parseInt(timer / 60, 10);
			seconds = parseInt(timer % 60, 10);

			minutes = minutes < 10 ? '0' + minutes : minutes;
			seconds = seconds < 10 ? '0' + seconds : seconds;

			display.textContent = minutes + ':' + seconds;

			if (--timer < 0) {
				timer = duration;
			}

			if (minutes == 0 && seconds == 0) {
				clearInterval(interval);
			}
		}, 1000);
	}

	function beginMinutesCounter() {
		var remaining_minutes = 60 * (60 - current_minutes) - current_seconds,
			display = document.querySelector('#time');
		startTimer(remaining_minutes, display);
	}

	const content = (
		<div className="current_day_details">
			<div className="detail_box">
				<p>
					Current Date<span className="tooltip right">
						<span className="current_day_letter">{current_day}</span>
						<span className="tiptext">Day Of The Week</span>
					</span>
					<br />
					<span className="date_hour_text">{current_date}</span>
				</p>
			</div>
			{props.work_end_hour == current_hour ? (
				<div className="tooltip bottom">
					<div className="detail_box time_remaining equal">
						<div id="time" onLoad={beginMinutesCounter()} />
					</div>
					<span className="tiptext">Minutes Remaning To Set Your Mood For Today</span>
				</div>
			) : (
				<div className="tooltip bottom">
					<div className="detail_box time_remaining">
						{(props.work_end_hour - current_hour + 24) % 24}:{60 - current_minutes}
					</div>
					<span className="tiptext">Time Remaining Until You Can Set Your Mood For Today</span>
				</div>
			)}
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

export default CurrentDay;
