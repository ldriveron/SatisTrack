import React from 'react';
import PropTypes from 'prop-types';

const NewSatisReportRadioButton = (props) => {
	return (
		<div className="radio_button_container">
			<label className="radio_label">
				<input
					type="radio"
					name="mood"
					value={props.mood}
					onChange={(e) => props.handleCurrentMoodOnChange(e.target.value)}
				/>
				<span className="radio_custom rectangular" />
			</label>
			<div className="radio_title">{props.mood}</div>
		</div>
	);
};

NewSatisReportRadioButton.propTypes = {
	handleCurrentMoodOnChange: PropTypes.func,
	mood: PropTypes.string
};

export default NewSatisReportRadioButton;
