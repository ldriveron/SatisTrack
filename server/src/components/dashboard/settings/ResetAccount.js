import React from 'react';
import PropTypes from 'prop-types';

// Form validation
import { Formik } from 'formik';
import * as Yup from 'yup';

const ResetAccount = (props) => (
	<Formik
		initialValues={{ username: '', password: '' }}
		onSubmit={(values, { setSubmitting }) => {
			setSubmitting(false);
		}}
		validationSchema={Yup.object().shape({
			username: Yup.string()
				.required('Username is required')
				.test('username-match', 'Enter your current username', function(value) {
					return props.username == value;
				}),
			password: Yup.string()
				.required('Password is required')
				.min(8, 'Password must be 8 characters or longer')
				.matches(
					/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
					'Use at least: one number and one special character'
				)
		})}
	>
		{(props) => {
			document.title = 'Reset Account';

			const { values, touched, errors, isSubmitting, handleChange, handleBlur, isValid } = props;

			return (
				<div>
					<form action="/api/userdata/resetaccount" method="POST">
						<div className="panel_title" style={{ color: 'rgb(203,36,49)' }}>
							Danger Zone: Reset Account
						</div>
						Use this option when starting a new job or just because you want to.<br />
						<br />
						Resetting your Satis Tracker account will set total reports, total reports in a row, and
						reporting streaks to zero.<br />
						<br />
						All of your Satis Reports will also be deleted.<br />
						<br />
						Your work schedule will remain the same.<br />
						<br />
						<label>Enter your username</label>
						<input
							type="text"
							name="username"
							id="username"
							autoComplete="new-password"
							value={values.username}
							onBlur={handleBlur}
							className={errors.username && touched.username && 'error'}
							onChange={handleChange}
						/>
						{errors.username && touched.username && <div className="input_feedback">{errors.username}</div>}
						<br />
						<br />
						<label>Enter your password</label>
						<input
							type="password"
							name="password"
							id="password"
							autoComplete="new-password"
							value={values.password}
							onBlur={handleBlur}
							className={errors.password && touched.password && 'error'}
							onChange={handleChange}
						/>
						{errors.password && touched.password && <div className="input_feedback">{errors.password}</div>}
						<button
							type="submit"
							className="formButton"
							disabled={errors.username || errors.password || isSubmitting || isValid}
						>
							Reset Account
						</button>
					</form>
				</div>
			);
		}}
	</Formik>
);

ResetAccount.propTypes = {
	username: PropTypes.string,
	values: PropTypes.object,
	touched: PropTypes.object,
	errors: PropTypes.object,
	isValid: PropTypes.bool,
	isSubmitting: PropTypes.bool,
	handleChange: PropTypes.func,
	handleBlur: PropTypes.func,
	handleSubmit: PropTypes.func
};

export default ResetAccount;
