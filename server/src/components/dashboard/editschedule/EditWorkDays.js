import React from 'react';
import PropTypes from 'prop-types';

// Form for editing work hours
const EditWorkDays = (props) => {
	return (
		<form id="set_work_days" className="set_work_days schedule_form" onSubmit={() => props.setWorkDays()}>
			<div className="page_sub_title">Days</div>
			<div className="day_selector">
				<div className="all_checkbox_container">
					{props.days_checkboxes}
					<div className="button_holder">
						<button
							type="button"
							className="button"
							onClick={() => {
								document
									.getElementById('set_work_days')
									.dispatchEvent(new Event('submit', { cancelable: true }));
							}}
						>
							Set Work Days
						</button>
						<br />
						<br />
						Editing your work schedule will disable mood reporting for one day.
					</div>
				</div>
			</div>
		</form>
	);
};

EditWorkDays.propTypes = {
	new_days: PropTypes.object,
	days_checkboxes: PropTypes.array,
	handleDayChange: PropTypes.func,
	setWorkDays: PropTypes.func
};

export default EditWorkDays;
