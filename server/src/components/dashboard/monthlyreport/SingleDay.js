import React from 'react';
import PropTypes from 'prop-types';

const SingleDay = (props) => {
	let today = new Date();
	let highlight = '';

	// Add a blue bottom border to the current day on the calendar
	if (today.getDate() == props.day.day && props.month_match) {
		highlight = 'current_day_highlight';
	}

	// Select the location for the recap tooltip to show based on day
	let tooltip_location = 'bottom';
	switch (props.day.day_word) {
		case 'Sunday':
			tooltip_location = 'right';
			break;
		case 'Monday':
			tooltip_location = 'right';
			break;
		case 'Tuesday':
			tooltip_location = 'right';
			break;
		case 'Wednesday':
			tooltip_location = 'top';
			break;
		case 'Thursday':
			tooltip_location = 'left';
			break;
		case 'Friday':
			tooltip_location = 'left';
			break;
		case 'Saturday':
			tooltip_location = 'left';
			break;
	}

	if (props.day.recap != '') {
		return (
			<div className={'reported_day ' + highlight + ' ' + props.day.mood}>
				<div className={'day_tooltip ' + tooltip_location}>
					<div className="chat-solid icon" />
					<span className="day_tiptext">{props.day.recap}</span>
				</div>
				<div className="day_number">{props.day.day}</div>
				<div className="day_name">{props.day.day_word}</div>
				<div className="mood_word">{props.day.mood}</div>
			</div>
		);
	} else {
		return (
			<div className={'reported_day ' + highlight + ' ' + props.day.mood}>
				<div className="day_number">{props.day.day}</div>
				<div className="day_name">{props.day.day_word}</div>
				<div className="mood_word">{props.day.mood}</div>
			</div>
		);
	}
};

SingleDay.propTypes = {
	day: PropTypes.object,
	month_match: PropTypes.bool
};

export default SingleDay;
