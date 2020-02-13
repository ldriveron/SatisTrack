import React from 'react';
import PropTypes from 'prop-types';

const EditWorkHours = (props) => {
	return (
		<form id="set_work_hours" className="set_work_hours schedule_form" onSubmit={() => props.setWorkHours()}>
			<div className="page_sub_title">Hours</div>
			<div>
				<label htmlFor="start_hour">Start Hour</label>
				<select
					name="new_work_start_hour"
					id="new_work_start_hour"
					onChange={(e) => props.handleHourChange(e)}
					value={props.new_work_start_hour}
				>
					{props.options}
				</select>
				<label htmlFor="end_hour">End Hour</label>
				<select
					name="new_work_end_hour"
					id="new_work_end_hour"
					onChange={(e) => props.handleHourChange(e)}
					value={props.new_work_end_hour}
				>
					{props.options}
				</select>
				<br />
				<br />
				<button
					type="button"
					className="button"
					onClick={() => {
						document
							.getElementById('set_work_hours')
							.dispatchEvent(new Event('submit', { cancelable: true }));
					}}
				>
					Set Work Hours
				</button>
				<br />
				<br />
				Editing your work schedule will disable mood reporting for one day.
			</div>
		</form>
	);
};

EditWorkHours.propTypes = {
	setWorkHours: PropTypes.func,
	handleHourChange: PropTypes.func,
	work_start_hour: PropTypes.number,
	work_end_hour: PropTypes.number,
	new_work_start_hour: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
	new_work_end_hour: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
	options: PropTypes.array
};

export default EditWorkHours;
