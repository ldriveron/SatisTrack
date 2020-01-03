import React from 'react';
import PropTypes from 'prop-types';

// Import radio button component
import RadioButton from './NewSatisReportRadioButton';

const NewSatisReport = (props) => {
	let today = new Date();

	// className of button will change depending on the chosen mood
	let button_bg_color = props.button_bg_color;
	// Show the Satis Setter if the user has 0 satis reports or if their latest satis report is not the current day.
	if (props.satis_report.total_results == 0 || props.satis_report.results[0].date != today.toLocaleDateString()) {
		return (
			<div className="mood_setter">
				<span className="question">How did you feel after work today?</span>
				<form className="dashboard_row" id="set_mood" onSubmit={() => props.postNewSatisReport()}>
					<div className="all_radio_buttons_container">
						<RadioButton handleCurrentMoodOnChange={props.handleCurrentMoodOnChange} mood={'Ecstatic'} />
						<RadioButton handleCurrentMoodOnChange={props.handleCurrentMoodOnChange} mood={'Happy'} />
						<RadioButton handleCurrentMoodOnChange={props.handleCurrentMoodOnChange} mood={'Content'} />
						<RadioButton handleCurrentMoodOnChange={props.handleCurrentMoodOnChange} mood={'Displeased'} />
						<RadioButton
							handleCurrentMoodOnChange={props.handleCurrentMoodOnChange}
							mood={'Disappointed'}
						/>
					</div>

					<div className="button_holder">
						{props.satis_report.total_results == 0 ? (
							<button
								type="submit"
								className={button_bg_color}
								onClick={() => {
									document
										.getElementById('set_mood')
										.dispatchEvent(new Event('submit', { cancelable: true }));
								}}
							>
								Set Mood
							</button>
						) : (
							<button
								type="submit"
								style={{ background: button_bg_color }}
								onClick={() => {
									document
										.getElementById('set_mood')
										.dispatchEvent(new Event('submit', { cancelable: true }));
								}}
								disabled={!(props.satis_report.results[0].date != today.toLocaleDateString())}
							>
								Set Mood
							</button>
						)}
					</div>
				</form>
			</div>
		);
	} else {
		return '';
	}
};

NewSatisReport.propTypes = {
	satis_report: PropTypes.object,
	button_bg_color: PropTypes.string,
	handleCurrentMoodOnChange: PropTypes.func,
	postNewSatisReport: PropTypes.func
};

export default NewSatisReport;
