import React from 'react';
import PropTypes from 'prop-types';

// Form for editing work hours
const EditWorkDays = (props) => {
	return (
		<form id="set_work_days" className="schedule_form" onSubmit={() => props.setWorkDays()}>
			<div>
				{props.days_checkboxes}
				<button
					type="button"
					className="button"
					disabled={props.allow_schedule_edit ? true : props.days_submit_disabled}
					onClick={() => {
						document
							.getElementById('set_work_days')
							.dispatchEvent(new Event('submit', { cancelable: true }));
					}}
				>
					Set Work Days
				</button>
			</div>
		</form>
	);
};

EditWorkDays.propTypes = {
	new_days: PropTypes.object,
	days_checkboxes: PropTypes.array,
	handleDayChange: PropTypes.func,
	setWorkDays: PropTypes.func,
	allow_schedule_edit: PropTypes.bool,
	days_submit_disabled: PropTypes.bool
};

export default EditWorkDays;
