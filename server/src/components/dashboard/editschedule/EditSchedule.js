import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// API methods import
import * as api from '../../../api';

// EditSchedule components import
import EditWorkHours from './EditWorkHours';
import EditWorkDays from './EditWorkDays';
import PauseSchedule from './PauseSchedule';

class SetSchedule extends Component {
	state = {
		user_data: this.props.user_data,
		today: new Date(),
		new_work_start_hour: 0,
		new_work_end_hour: 0,
		new_days: {}
	};

	componentDidMount() {
		this.setState({
			new_work_start_hour: this.props.user_data.work_start_hour,
			new_work_end_hour: this.props.user_data.work_end_hour,
			new_days: this.props.user_data.work_days
		});

		document.title = 'Edit Schedule';
	}

	// When the user changes the option on any of the work hours, set the value on the state
	// If the hours selected as the same as their current, then disable the 'Set Work Hours button'
	handleHourChange(e) {
		e.preventDefault();

		this.setState({
			[e.target.name]: e.target.value
		});
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
		let { value, checked } = e.target;

		this.setState((prevState) => ({
			new_days: {
				...prevState.new_days,
				[value]: checked
			}
		}));
	}

	setWorkDays() {
		// Make sure that at least one work day checkbox is checked
		let days = document.getElementsByName('work_day');
		let day_checked = false;
		for (let i = 0; i < days.length; i++) {
			// If at least one work day checkbox is checked, then set day_checked to true and end loop
			if (days[i].checked) {
				day_checked = true;
				break;
			}
		}

		// If one workday is checked, then update the users workdays
		if (day_checked) {
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
		} else {
			// Alert the user to check at least one work day
			alert('Please select at least one work day.');
		}
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
					<div key={k} className="checkbox_container">
						<label className="checkbox_label">
							<input
								type="checkbox"
								name="work_day"
								value={k}
								checked={this.state.new_days[k] == 'true' || this.state.new_days[k] == true}
								onChange={(e) => this.handleDayChange(e)}
							/>
							<span className="checkbox_custom rectangular" />
						</label>
						<div className="checkbox_title">{k.charAt(0).toUpperCase() + k.slice(1, 3) + '.'}</div>
					</div>
				)
			)
		);

		return (
			<div className="edit_schedule">
				<div className="page_title">Edit Schedule</div>
				<Router>
					<div className="left_links">
						<Link key="work_hours" to="/users/editschedule">
							<div className="link top_link">Work Hours</div>
						</Link>
						<Link key="work_days" to="/users/editschedule/days">
							<div className="link middle_link">Work Days</div>
						</Link>
						<Link key="work_pause" to="/users/editschedule/pause">
							<div className="link bottom_link">Pause Schedule</div>
						</Link>
					</div>
					<div className="right_panel">
						<Switch>
							<Route
								path="/users/editschedule"
								exact
								render={(props) => (
									<EditWorkHours
										{...props}
										setWorkHours={this.setWorkHours.bind(this)}
										handleHourChange={this.handleHourChange.bind(this)}
										work_start_hour={this.state.user_data.work_start_hour}
										work_end_hour={this.state.user_data.work_end_hour}
										new_work_start_hour={this.state.new_work_start_hour}
										new_work_end_hour={this.state.new_work_end_hour}
										options={options}
									/>
								)}
							/>
							<Route
								path="/users/editschedule/days"
								exact
								render={(props) => (
									<EditWorkDays
										{...props}
										new_days={this.state.new_days}
										days_checkboxes={days_checkboxes}
										handleDayChange={this.handleDayChange.bind(this)}
										setWorkDays={this.setWorkDays.bind(this)}
									/>
								)}
							/>
							<Route
								path="/users/editschedule/pause"
								exact
								render={(props) => (
									<PauseSchedule {...props} work_paused={this.state.user_data.work_paused} />
								)}
							/>
						</Switch>
					</div>
				</Router>
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
