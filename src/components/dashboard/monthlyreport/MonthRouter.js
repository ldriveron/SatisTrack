import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// Components import
import MonthNavigator from './MonthNavigator';
import MonthReport from './MonthReport';

class MonthRouter extends Component {
	state = { today: new Date() };

	componentDidMount() {
		let today = new Date();
		this.setState({
			year: today.getFullYear(),
			month: today.getMonth() + 1
		});
	}

	handleYearChange(newYear) {
		this.setState({
			year: parseInt(newYear)
		});
	}

	render() {
		// Array with only the years the user has set satis reports
		let years = [];
		for (let i = 0; i < this.props.satis_report.results.length; i++) {
			if (!years.includes(this.props.satis_report.results[i].year)) {
				years.push(this.props.satis_report.results[i].year);
			}
		}

		// Generate options with the years
		let options = years.map((year) => (
			<option key={year} value={year}>
				{year}
			</option>
		));

		return (
			<div className="monthly_report">
				<select
					className="report_year_selector"
					name="year"
					id="year"
					onChange={(e) => this.handleYearChange(e.target.value)}
					value={this.state.year}
				>
					{options}
				</select>
				{this.state.year && (
					<Router>
						<MonthNavigator year={this.state.year} />
						<Switch>
							{/* Show default satis report for current year and month */}
							<Route
								path="/users/dashboard"
								exact
								render={(props) => (
									<MonthReport
										{...props}
										user_id={this.props.user_id}
										year={this.state.year}
										month={this.state.today.getMonth() + 1}
									/>
								)}
							/>
							<Route
								path="/users/report/:year/:month"
								exact
								render={(props) => (
									<MonthReport {...props} user_id={this.props.user_id} year={this.state.year} />
								)}
							/>
						</Switch>
					</Router>
				)}
			</div>
		);
	}
}

MonthRouter.propTypes = {
	match: PropTypes.object,
	satis_report: PropTypes.object,
	user_id: PropTypes.string
};

export default MonthRouter;
