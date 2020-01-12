import React from 'react';
import PropTypes from 'prop-types';

const SingleDay = (props) => {
	if (props.day.recap != '') {
		return (
			<div className="day_tooltip bottom">
				<div className={'reported_day ' + props.day.mood}>
					<div className="chat-solid icon" />
					<div className="day_number">{props.day.day}</div>
					<div className="day_name">{props.day.day_word}</div>
					<div className="mood_word">{props.day.mood}</div>
				</div>

				<span className="day_tiptext">{props.day.recap}</span>
			</div>
		);
	} else {
		return (
			<div className={'reported_day ' + props.day.mood}>
				<div className="day_number">{props.day.day}</div>
				<div className="day_name">{props.day.day_word}</div>
				<div className="mood_word">{props.day.mood}</div>
			</div>
		);
	}
};

SingleDay.propTypes = {
	day: PropTypes.object
};

export default SingleDay;
