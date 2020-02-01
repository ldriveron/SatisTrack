import React from 'react';
import PropTypes from 'prop-types';

// Import component
import CurrentHours from './CurrentHours';

const EditWorkHours = (props) => {
	return (
		<form id="set_work_hours" className="set_work_hours schedule_form" onSubmit={() => props.setWorkHours()}>
			<div className="page_sub_title">Hours</div>
			<CurrentHours work_start_hour={props.work_start_hour} work_end_hour={props.work_end_hour} />
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
