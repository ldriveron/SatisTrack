import React from 'react';
import PropTypes from 'prop-types';

const PauseSchedule = (props) => {
	return (
		<form id="set_pause" className="set_work_hours" method="POST" action="/api/userdata/workpause">
			<div className="page_sub_title">Pause Schedule</div>
			<div className="pause_reason_holder">
				<span>Vacation</span>
				<span>Sick Days</span>
				<span>Leisure</span>
			</div>
			<div className="pause_img_holder">
				<img src="https://satistracker.com/images/sun-umbrella.png" alt="Sun Umbrella" />
				<img src="https://satistracker.com/images/sick.png" alt="Sick" />
				<img src="https://satistracker.com/images/park.png" alt="Park" />
			</div>
			<button type="submit" className="button">
				{props.work_paused == true ? 'Unpause Schedule' : 'Pause Schedule'}
			</button>
			<br />
			<br />
			Pausing your schedule will disable mood reporting and pause your reporting streak
			<br />
			<br />
			<div className="icon_credit">
				<div>
					Icons made by{' '}
					<a
						href="https://www.flaticon.com/authors/freepik"
						title="Freepik"
						target="_blank"
						rel="noopener noreferrer"
					>
						Freepik
					</a>{' '}
					from{' '}
					<a href="https://www.flaticon.com/" title="Flaticon" target="_blank" rel="noopener noreferrer">
						www.flaticon.com
					</a>
				</div>
			</div>
		</form>
	);
};

PauseSchedule.propTypes = {
	work_paused: PropTypes.bool
};

export default PauseSchedule;
