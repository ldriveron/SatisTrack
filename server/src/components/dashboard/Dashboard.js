import React, { Component } from 'react';
import PropTypes from 'prop-types';

// API methods import
import * as api from '../../api';

// Components import
import CurrentDay from './today/CurrentDay';
import WorkDays from './workdays/WorkDays';
import StreakNotify from './today/StreakNotify';
import NewSatisReport from './today/NewSatisReport';
import MonthRouter from './monthlyreport/MonthRouter';

class Dashboard extends Component {
	state = {
		user_data: this.props.user_data,
		user_works_today: this.props.user_works_today,
		current_hour: 0,
		display_satis_setter: true,
		current_mood: '',
		satis_report_recap: ''
	};

	componentDidMount() {
		api.fetchAllSatis(this.state.user_data.user_id).then((resp) => {
			this.setState({
				satis_report: resp
			});
		});

		// If user has not set their work hours, then set a default
		if (this.state.user_data.work_start_hour === null) {
			this.setState({
				work_start_hour: 'Not set.'
			});
		}

		if (this.state.user_data.work_end_hour === null) {
			this.setState({
				work_end_hour: 'Not set.'
			});
		}

		// Update state with current date class and hour
		let today = new Date();

		this.setState({
			today: today,
			current_hour: today.getHours()
		});

		// If the user's last report date or last schedule edit is the current day, then do not allow them to set their Mood Report
		if (
			this.state.user_data.last_report_date == today.toLocaleDateString() ||
			this.state.user_data.last_schedule_edit == today.toLocaleDateString()
		) {
			this.setState({
				display_satis_setter: false
			});
		}

		// If the user works on the current day and there is one hour remaining till their work end hour, then set an interval
		// for every minute that checks if the current hour is the user's work end hour.
		// Once this happens, clear the interval and reload the page in order to show the mood setter without the user having
		// to manually reload the page.
		if (this.props.user_data) {
			if (
				this.props.user_works_today &&
				Math.abs(this.props.user_data.work_end_hour - new Date().getHours()) == 1
			) {
				let work_end_hour = this.state.user_data.work_end_hour;

				let interval = setInterval(function() {
					if (work_end_hour == new Date().getHours()) {
						clearInterval(interval);
						location.reload();
					}
				}, 60000);
			}
		}

		document.title = 'Dashboard';
	}

	// Change the state's current_mood to what the user selects
	// Change the satis report button's background color depending on the chosen mood by changing the className
	handleCurrentMoodOnChange(mood) {
		let bg_color;
		switch (mood) {
			case 'Ecstatic':
				bg_color = 'ecstatic_bg';
				break;
			case 'Happy':
				bg_color = 'happy_bg';
				break;
			case 'Content':
				bg_color = 'content_bg';
				break;
			case 'Displeased':
				bg_color = 'displeased_bg';
				break;
			case 'Disappointed':
				bg_color = 'disappointed_bg';
				break;
			case 'Stressed':
				bg_color = 'stressed_bg';
				break;
			default:
				bg_color = 'ecstatic_bg';
		}

		this.setState({
			button_bg_color: bg_color,
			current_mood: mood
		});
	}

	// Handle recap change on new Satis Report
	handleRecapChange(recap) {
		this.setState({
			satis_report_recap: recap
		});
	}

	// Use API post request to set the user's new satis report and deactivate the satis setter
	postNewSatisReport() {
		api
			.postNewSatis(this.state.user_data.user_id, this.state.current_mood, this.state.satis_report_recap)
			.then((resp) => {
				if (resp === 'Done.') {
					this.setState({
						display_satis_setter: false
					});
				}

				// Force reload after new Satis Report
				location.reload();
			})
			.catch(console.error);
	}

	disableSatisSetter() {
		this.setState({
			display_satis_setter: false
		});
	}

	render() {
		// Select a day of time greeting
		let greeting = '';
		if (this.state.current_hour >= 0 && this.state.current_hour <= 11) {
			greeting = 'Good morning, ' + this.state.user_data.username;
		} else if (this.state.current_hour >= 12 && this.state.current_hour <= 17) {
			greeting = 'Good afternoon, ' + this.state.user_data.username;
		} else if (this.state.current_hour >= 18 && this.state.current_hour <= 23) {
			greeting = 'Good evening, ' + this.state.user_data.username;
		}

		return (
			<div className="dashboard">
				<div className="page_title">
					<div>{greeting}</div>
				</div>

				{/* When the satis report is retreived from MongoDB, the current hour is the user's work end hour, and
					the current user works on the current day, and the user's work schedule is not paused, then load the 
					NewSatisReport form component */}
				{this.state.satis_report &&
				this.state.current_hour == this.state.user_data.work_end_hour &&
				this.state.user_works_today == 'true' &&
				this.state.display_satis_setter == true &&
				!this.state.user_data.work_paused && (
					<NewSatisReport
						satis_report={this.state.satis_report}
						last_report_date={this.state.user_data.last_report_date}
						button_bg_color={this.state.button_bg_color}
						postNewSatisReport={this.postNewSatisReport.bind(this)}
						handleCurrentMoodOnChange={this.handleCurrentMoodOnChange.bind(this)}
						handleRecapChange={this.handleRecapChange.bind(this)}
					/>
				)}

				{/* If user hit a new reporting streak (5 mood reports in a row),  then show streak notification.
				    This only shows if the reporting streak was achieved on the current day. */}
				{this.state.user_data &&
				new Date().toLocaleDateString() == this.state.user_data.last_report_date &&
				this.state.user_data.reporting_streak % 5 == 0 && (
					<StreakNotify total_streaks={this.state.user_data.total_streaks} />
				)}

				<CurrentDay
					disableSatisSetter={this.disableSatisSetter.bind(this)}
					work_days={this.state.user_data.work_days}
					user_works_today={this.state.user_works_today}
					last_report_date={this.state.user_data.last_report_date}
					work_end_hour={this.state.user_data.work_end_hour}
					day_is_set={this.state.display_satis_setter}
					work_paused={this.state.user_data.work_paused}
				/>

				{/* Weekly schedule of the user */}
				<WorkDays work_days={this.state.user_data.work_days} />

				{this.state.satis_report && (
					<MonthRouter satis_report={this.state.satis_report} user_id={this.state.user_data.user_id} />
				)}
			</div>
		);
	}
}

Dashboard.propTypes = {
	user_id: PropTypes.string,
	user_data: PropTypes.object,
	user_works_today: PropTypes.string,
	today: PropTypes.object
};

export default Dashboard;
