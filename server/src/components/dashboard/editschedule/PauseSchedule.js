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
				<img src="http://192.168.1.66:4242/images/sun-umbrella.png" alt="Sun Umbrella" />
				<img src="http://192.168.1.66:4242/images/sick.png" alt="Sick" />
				<img src="http://192.168.1.66:4242/images/park.png" alt="Park" />
			</div>
			<button type="submit" className="button">
				{props.work_paused == true ? 'Unpause Schedule' : 'Pause Schedule'}
			</button>
			<br />
			Pausing your schedule will disable mood reporting and pause your reporting streak
		</form>
	);
};

PauseSchedule.propTypes = {
	work_paused: PropTypes.bool
};

export default PauseSchedule;
