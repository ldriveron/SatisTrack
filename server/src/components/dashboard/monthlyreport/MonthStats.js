import React from 'react';
import PropTypes from 'prop-types';

const MonthStats = (props) => {
	let total_days = props.days.length;

	let ecstatic = 0;
	let happy = 0;
	let content = 0;
	let displeased = 0;
	let disappointed = 0;
	let stressed = 0;

	if (props.days.length > 0) {
		for (let day = 0; day < props.days.length; day++) {
			switch (props.days[day].mood) {
				case 'Ecstatic':
					ecstatic++;
					continue;
				case 'Happy':
					happy++;
					continue;
				case 'Content':
					content++;
					continue;
				case 'Displeased':
					displeased++;
					continue;
				case 'Disappointed':
					disappointed++;
					continue;
				case 'Stressed':
					stressed++;
					continue;
			}
		}
	}

	return (
		<div className="month_stats">
			<div className="mood_total ecstatic_bg">
				<div className="text">Ecstatic</div>{' '}
				<div className="number">
					{ecstatic}
					<div className="percentage">{parseInt(ecstatic / total_days * 100)}%</div>
				</div>
			</div>
			<div className="mood_total happy_bg">
				<div className="text">Happy</div>{' '}
				<div className="number">
					{happy}
					<div className="percentage">{parseInt(happy / total_days * 100)}%</div>
				</div>
			</div>
			<div className="mood_total content_bg">
				<div className="text">Content</div>{' '}
				<div className="number">
					{content}
					<div className="percentage">{parseInt(content / total_days * 100)}%</div>
				</div>
			</div>
			<div className="mood_total displeased_bg">
				<div className="text">Displeased</div>{' '}
				<div className="number">
					{displeased}
					<div className="percentage">{parseInt(displeased / total_days * 100)}%</div>
				</div>
			</div>
			<div className="mood_total disappointed_bg">
				<div className="text">Disappointed</div>{' '}
				<div className="number">
					{disappointed}
					<div className="percentage">{parseInt(disappointed / total_days * 100)}%</div>
				</div>
			</div>
			<div className="mood_total stressed_bg">
				<div className="text">Stressed</div>{' '}
				<div className="number">
					{stressed}
					<div className="percentage">{parseInt(stressed / total_days * 100)}%</div>
				</div>
			</div>
		</div>
	);
};

MonthStats.propTypes = {
	days: PropTypes.array
};

export default MonthStats;
