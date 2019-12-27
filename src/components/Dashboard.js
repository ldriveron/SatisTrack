import React, { Component } from 'react';
import PropTypes from 'prop-types';

// API methods import
import * as api from '../api';

// Components import
import CurrentDay from './CurrentDay';

class Dashboard extends Component {
	state = {
		satis_report: {},
		user_data: this.props.user_data,
		current_hour: 0
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

		const today = new Date();

		// Update state with current hour
		this.setState({
			current_hour: today.getHours()
		});

		document.title = 'Dashboard';
	}

	render() {
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
				<div className="dashboard_row greeting">
					<div>{greeting}</div>
				</div>
				<CurrentDay work_end_hour={this.state.user_data.work_end_hour} />
			</div>
		);
	}
}

Dashboard.propTypes = {
	user_id: PropTypes.string,
	user_data: PropTypes.object
};

export default Dashboard;
