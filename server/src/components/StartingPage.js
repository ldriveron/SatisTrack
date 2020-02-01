import React from 'react';

const StartingPage = () => {
	return (
		<div className="home">
			<h1>Your daily work satisfaction tracker.</h1>

			<div className="section">
				<div className="explainer">
					<h2>Keep track of your mood at the end of the work day.</h2>
					<p>
						Use Satis Track on the hour you leave work to set your Mood Report for the day.
						<br />
						<br />Gain insight into your work satisfaction with a monthly calendar report.
						<br />
						<br />Earn Mood Reporting streaks along the way.
					</p>

					<img className="streak_screenshot" src="Screenshots/Streak_Notifier.png" alt="Reporting Streak" />
				</div>
				<img className="small_screenshot" src="Screenshots/Dashboard_Small.png" alt="Dashboard" />
			</div>

			<h2>Come back before your Work End Hour expires.</h2>
			<div className="section">
				<p>
					Generate realistic work satisfaction statistics by only posting your Mood Report right after the
					work day is over.
				</p>
				<img
					className="large_screenshot"
					src="Screenshots/Dashboard_Large.png"
					alt="Dashboard with mood report"
				/>
			</div>
		</div>
	);
};

export default StartingPage;
