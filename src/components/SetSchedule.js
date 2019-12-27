import React, { Component } from 'react';
import PropTypes from 'prop-types';

// API methods import
import * as api from '../api';

class SetSchedule extends Component {
	state = {
		user_data: this.props.user_data,
		new_work_start_hour: 0,
		new_work_end_hour: 0,
		new_days: {},
		hours_submit_disabled: true,
		days_submit_disabled: true
	};

	componentDidMount() {
		this.setState({
			new_work_start_hour: this.props.user_data.work_start_hour,
			new_work_end_hour: this.props.user_data.work_end_hour,
			new_days: this.props.user_data.work_days
		});

		document.title = 'Set Work Hours';
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
			})
			.catch(console.error);
	}

	// When a work day checkbox is clicked, update the new_days object based on
	// if it's selected or not
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
			})
			.catch(console.error);
	}

	render() {
		// Creating the options for the hours dropdown
		// Add all options to array using a for loop
		let options = [];

		for (var hours = 0; hours < 24; hours++) {
			options.push(
				<option key={hours} value={hours}>
					{hours % 12 ? hours % 12 : 12}:00 {hours == 24 ? 'am' : hours >= 12 ? 'pm' : 'am'}
				</option>
			);
		}

		// Generate an array with all necessary checkboxes for changin weekly schedule
		let days_checkboxes = [];
		Object.assign(
			{},
			...Object.keys(this.state.new_days).map((k) =>
				days_checkboxes.push(
					<div key={k}>
						<input
							type="checkbox"
							name={k}
							value={k}
							checked={this.state.new_days[k] == 'true' || this.state.new_days[k] == true}
							onChange={(e) => this.handleDayChange(e)}
						/>
						{k.charAt(0).toUpperCase() + k.slice(1)}
					</div>
				)
			)
		);

		return (
			<div>
				<form onSubmit={() => this.setWorkHours()}>
					<div className="set_work_hours">
						<label htmlFor="start_hour">Start Hour</label>
						<select
							name="new_work_start_hour"
							id="new_work_start_hour"
							onChange={(e) => this.handleHourChange(e)}
							value={this.state.new_work_start_hour}
						>
							{options}
						</select>

						<label htmlFor="end_hour">End Hour</label>
						<select
							name="new_work_end_hour"
							id="new_work_end_hour"
							onChange={(e) => this.handleHourChange(e)}
							value={this.state.new_work_end_hour}
						>
							{options}
						</select>
						<br />
						<button className="button" disabled={this.state.hours_submit_disabled}>
							Set Work Hours
						</button>

						{/* This code uses the users set work hours and makes them easier to read */}
						<div className="current_hours">
							<div className="hour">
								Start hour<br />
								{this.state.user_data.work_start_hour % 12 ? (
									this.state.user_data.work_start_hour % 12
								) : (
									12
								)}:00{' '}
								{this.state.user_data.work_start_hour == 24 ? (
									'am'
								) : this.state.user_data.work_start_hour >= 12 ? (
									'pm'
								) : (
									'am'
								)}
							</div>
							<div className="hour">
								End hour<br />
								{this.state.user_data.work_end_hour % 12 ? (
									this.state.user_data.work_end_hour % 12
								) : (
									12
								)}:00{' '}
								{this.state.user_data.work_end_hour == 24 ? (
									'am'
								) : this.state.user_data.work_end_hour >= 12 ? (
									'pm'
								) : (
									'am'
								)}
							</div>
						</div>
					</div>
				</form>

				<form onSubmit={() => this.setWorkDays()}>
					<div className="set_work_days">
						{days_checkboxes}
						<button className="button" disabled={this.state.days_submit_disabled}>
							Set Work Days
						</button>
					</div>
				</form>
			</div>
		);
	}
}

SetSchedule.propTypes = {
	user_id: PropTypes.string,
	user_data: PropTypes.object
};

export default SetSchedule;
