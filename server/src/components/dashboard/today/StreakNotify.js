import React from 'react';
import PropTypes from 'prop-types';

const StreakNotify = (props) => {
	return (
		<div className="streak_notify_holder">
			<div className="streak_notify">
				<div className="bell_holder">
					<div className="bell-solid icon" />
					<div className="tooltip bottom">
						<div className="total_streaks_number">{props.total_streaks}</div>
						<span className="tiptext" style={{ marginLeft: '-80px' }}>
							Total 5-Day Streaks
						</span>
					</div>
				</div>
				<div className="text_holder">
					<h2>5-DAY STREAK!</h2>
					<span className="explainer">
						You have completed a 5-day reporting streak. Keep up the good work!
					</span>
				</div>
			</div>
		</div>
	);
};

StreakNotify.propTypes = {
	total_streaks: PropTypes.number
};

export default StreakNotify;
