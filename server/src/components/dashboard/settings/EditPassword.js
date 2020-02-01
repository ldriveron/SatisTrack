import React from 'react';
import PropTypes from 'prop-types';

// Form validation
import { Formik } from 'formik';
import * as Yup from 'yup';

const EditPassword = () => (
	<Formik
		initialValues={{ current_pw: '', new_pw: '' }}
		onSubmit={(values, { setSubmitting }) => {
			setSubmitting(false);
		}}
		validationSchema={Yup.object().shape({
			current_pw: Yup.string()
				.required('Current password is required')
				.min(8, 'Password must be 8 characters or longer')
				.matches(
					/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
					'Use at least: one number and one special character'
				),
			new_pw: Yup.string()
				.required('New password is required')
				.min(8, 'New password must be 8 characters or longer')
				.matches(
					/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
					'Use at least: one number and one special character'
				)
				.test('passwords-match', 'Passwords must not match', function(value) {
					return this.parent.current_pw != value;
				})
		})}
	>
		{(props) => {
			document.title = 'Edit Password';

			const { touched, errors, isSubmitting, handleChange, handleBlur } = props;

			return (
				<div>
					<form action="/api/userdata/editpassword" method="POST">
						<div className="panel_title">Password</div>
						<label>Current Password</label>
						<input
							type="password"
							name="current_pw"
							id="current_pw"
							onBlur={handleBlur}
							className={errors.current_pw && touched.current_pw && 'error'}
							onChange={handleChange}
						/>
						{errors.current_pw &&
						touched.current_pw && <div className="input_feedback">{errors.current_pw}</div>}

						<br />
						<label>New Password</label>
						<input
							type="password"
							name="new_pw"
							id="new_pw"
							onBlur={handleBlur}
							className={errors.new_pw && touched.new_pw && 'error'}
							onChange={handleChange}
						/>
						{errors.new_pw && touched.new_pw && <div className="input_feedback">{errors.new_pw}</div>}

						<button
							type="submit"
							className="formButton"
							disabled={errors.current_pw || errors.new_pw || isSubmitting}
						>
							Change Password
						</button>
					</form>
				</div>
			);
		}}
	</Formik>
);

EditPassword.propTypes = {
	values: PropTypes.object,
	touched: PropTypes.object,
	errors: PropTypes.object,
	isSubmitting: PropTypes.bool,
	handleChange: PropTypes.func,
	handleBlur: PropTypes.func,
	handleSubmit: PropTypes.func
};

export default EditPassword;
