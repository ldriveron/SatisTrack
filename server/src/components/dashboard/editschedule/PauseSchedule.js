import React from 'react';
import PropTypes from 'prop-types';

const PauseSchedule = (props) => {
	return (
		<form id="set_pause" className="set_work_hours" method="POST" action="/api/userdata/workpause">
			<div className="page_sub_title">Pause Schedule</div>
			Going on a vacation, using sick days, or just taking a day to yourself? You can pause your work schedule and
			avoid losing your mood report streak for the days you are taking off from work. You will not be able to post
			a mood report as long as your work schedule is paused.
			<br />
			<br />
			<button type="submit" className="button">
				{props.work_paused == true ? 'Unpause Schedule' : 'Pause Schedule'}
			</button>
		</form>
	);
};

PauseSchedule.propTypes = {
	work_paused: PropTypes.bool
};

export default PauseSchedule;
