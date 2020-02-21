import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// General component imports
import StartingPage from './StartingPage';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import Header from './Header';

// Dashboard imports
import Dashboard from './dashboard/Dashboard';
import EditSchedule from './dashboard/editschedule/EditSchedule';
import Settings from './dashboard/settings/Settings';
import Overview from './dashboard/overview/Overview';

// User import
import PublicOverview from './user/Overview';

// API methods import
import * as api from '../api';

// Main app starting point
class App extends Component {
	state = {
		user_id: '',
		isLoggedIn: false,
		user_data: {},
		today: new Date()
	};

	componentDidMount() {
		api.authUser().then((resp) => {
			if (resp.id) {
				this.setState({
					user_id: resp.id,
					isLoggedIn: true
				});

				// Days of the week array to check if the user works on the current day
				let days_of_week = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];

				// Fetch user data after their ID is retreived
				api
					.fetchUser()
					.then((resp) => {
						this.setState({
							user_data: {
								user_id: this.state.user_id,
								username: resp.user.username,
								work_start_hour: resp.user.work_start_hour,
								work_end_hour: resp.user.work_end_hour,
								work_paused: resp.user.work_paused,
								last_schedule_edit: resp.user.last_schedule_edit,
								last_report_date: resp.user.last_report_date,
								allow_email_notifier: resp.user.allow_email_notifier,
								email_confirmed: resp.user.email_confirmed,
								days_reported: resp.user.days_reported,
								work_days: resp.user.work_days,
								reporting_streak: resp.user.reporting_streak,
								total_streaks: resp.user.total_steaks,
								company: resp.user.company,
								private: resp.user.private
							},
							user_works_today: resp.user.work_days[days_of_week[this.state.today.getDay()]]
						});
					})
					.catch(console.error);
			} else {
				this.setState({
					isLoggedIn: false
				});
			}
		});
	}

	// Use diffrent Routes for react based on if the user is authenticated
	render() {
		return (
			<Router>
				{this.state.user_data.user_id && (
					<Header isLoggedIn={this.state.isLoggedIn} user_data={this.state.user_data} />
				)}
				{this.state.user_data.user_id ? (
					<Switch>
						<Route
							path="/users/dashboard"
							exact
							render={(props) => (
								<Dashboard
									{...props}
									user_data={this.state.user_data}
									user_works_today={this.state.user_works_today}
								/>
							)}
						/>
						<Route
							path="/users/editschedule"
							render={(props) => <EditSchedule {...props} user_data={this.state.user_data} />}
						/>
						<Route
							path="/users/settings"
							render={(props) => <Settings {...props} user_data={this.state.user_data} />}
						/>
						<Route
							path="/users/overview"
							render={(props) => <Overview {...props} user_data={this.state.user_data} />}
						/>
						<Route path="/:username" render={(props) => <PublicOverview {...props} />} />
					</Switch>
				) : (
					<Switch>
						<Route path="/users/login" exact component={LoginForm} />
						<Route path="/users/register" exact component={RegisterForm} />
						<Route path="/" exact component={StartingPage} />
						<Route path="/:username" exact render={(props) => <PublicOverview {...props} />} />
					</Switch>
				)}
			</Router>
		);
	}
}

export default App;
