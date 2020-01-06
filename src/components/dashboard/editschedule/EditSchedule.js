import React, { Component } from 'react';
import PropTypes from 'prop-types';

// API methods import
import * as api from '../../../api';

// EditSchedule components import
import EditWorkHours from './EditWorkHours';
import EditWorkDays from './EditWorkDays';
import CurrentHours from './CurrentHours';

class SetSchedule extends Component {
	state = {
		user_data: this.props.user_data,
		today: new Date(),
		new_work_start_hour: 0,
		new_work_end_hour: 0,
		new_days: {},
		allow_schedule_edit: true,
		hours_submit_disabled: true,
		days_submit_disabled: true
	};

	componentDidMount() {
		this.setState({
			new_work_start_hour: this.props.user_data.work_start_hour,
			new_work_end_hour: this.props.user_data.work_end_hour,
			new_days: this.props.user_data.work_days
		});

		this.setState({
			allow_schedule_edit: this.validateDateDifference()
		});

		document.title = 'Edit Schedule';
	}

	// Prevent the user from updating their work schedule more than once a day
	// Get the date of the users last schedule edit and get todays date
	// Get the difference between the two days in milliseconds
	// If the date difference is more than the milliseconds in a day, then return true, else return false
	validateDateDifference() {
		var last_schedule_edit = Date.parse(this.props.user_data.last_schedule_edit.replace('/', ' '));
		var todays_date = this.state.today.setHours(0, 0, 0, 0);
		var dateDifference = Math.abs(Number(todays_date) - last_schedule_edit);
		var milliseconds_in_a_day = 86300000;

		return dateDifference < milliseconds_in_a_day;
	}

	// When the user changes the option on any of the work hours, set the value on the state
	// If the hours selected as the same as their current, then disable the 'Set Work Hours button'
	handleHourChange(e) {
		e.preventDefault();

		this.setState({
			[e.target.name]: e.target.value
		});

		if (
			this.state.new_work_start_hour !== this.state.user_data.work_start_hour ||
			this.state.new_work_end_hour !== this.state.user_data.work_end_hour
		) {
			this.setState({
				hours_submit_disabled: false
			});
		} else {
			this.setState({
				hours_submit_disabled: true
			});
		}
	}

	// This method is used to update the users work hours on the database
	setWorkHours() {
		// Call api update method to change the users work start and work end hours
		api
			.updateWorkTime(this.state.user_data.user_id, this.state.new_work_start_hour, this.state.new_work_end_hour)
			.then((resp) => {
				if (resp === 'Done.') {
					this.setState({
						work_start_hour: this.state.new_work_start_hour,
						work_end_hour: this.state.new_work_end_hour
					});
				}

				// Force reload after set work days
				location.reload();
			})
			.catch(console.error);
	}

	// When a work day checkbox is clicked, update the new_days object based on
	// if it's selected or not
	// Previous days are kept in the new object and changed day will be updated
	handleDayChange(e) {
		let { name, checked } = e.target;

		this.setState((prevState) => ({
			new_days: {
				...prevState.new_days,
				[name]: checked
			},
			days_submit_disabled: false
		}));
	}

	setWorkDays() {
		// Call api update method to update the users workdays
		api
			.updateWorkDays(
				this.state.user_data.user_id,
				this.state.new_days.sunday,
				this.state.new_days.monday,
				this.state.new_days.tuesday,
				this.state.new_days.wednesday,
				this.state.new_days.thursday,
				this.state.new_days.friday,
				this.state.new_days.saturday
			)
			.then((resp) => {
				if (resp === 'Done.') {
					console.log('Done');
				}

				// Force reload after setting work days
				location.reload();
			})
			.catch(console.error);
	}

	render() {
		// Creating the options for the hours dropdown
		// Add all options to array using a for loop
		let options = [];

		for (let hours = 0; hours < 24; hours++) {
			options.push(
				<option key={hours} value={hours}>
					{hours % 12 ? hours % 12 : 12}:00 {hours == 24 ? 'am' : hours >= 12 ? 'pm' : 'am'}
				</option>
			);
		}

		// Generate an array with all necessary checkboxes for changing weekly schedule
		let days_checkboxes = [];
		Object.assign(
			{},
			...Object.keys(this.state.new_days).map((k) =>
				days_checkboxes.push(
					<span key={k}>
						<input
							type="checkbox"
							name={k}
							value={k}
							checked={this.state.new_days[k] == 'true' || this.state.new_days[k] == true}
							onChange={(e) => this.handleDayChange(e)}
						/>
						{k.charAt(0).toUpperCase() + k.slice(1)}
					</span>
				)
			)
		);

		return (
			<div className="set_work_hours">
				<div className="page_title">Edit Schedule</div>

				<CurrentHours
					work_start_hour={this.state.user_data.work_start_hour}
					work_end_hour={this.state.user_data.work_end_hour}
				/>

				<EditWorkHours
					setWorkHours={this.setWorkHours.bind(this)}
					handleHourChange={this.handleHourChange.bind(this)}
					new_work_start_hour={this.state.new_work_start_hour}
					new_work_end_hour={this.state.new_work_end_hour}
					options={options}
					allow_schedule_edit={this.state.allow_schedule_edit}
					hours_submit_disabled={this.state.hours_submit_disabled}
				/>

				<EditWorkDays
					new_days={this.state.new_days}
					days_checkboxes={days_checkboxes}
					handleDayChange={this.handleDayChange.bind(this)}
					setWorkDays={this.setWorkDays.bind(this)}
					allow_schedule_edit={this.state.allow_schedule_edit}
					days_submit_disabled={this.state.days_submit_disabled}
				/>
			</div>
		);
	}
}

SetSchedule.propTypes = {
	user_id: PropTypes.string,
	user_data: PropTypes.object,
	today: PropTypes.object
};

export default SetSchedule;
