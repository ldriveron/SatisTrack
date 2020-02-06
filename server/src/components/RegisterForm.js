import React from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as Yup from 'yup';

const RegisterForm = () => (
	<Formik
		initialValues={{ username: '', email: '', password: '', password2: '' }}
		onSubmit={(values, { setSubmitting }) => {
			setSubmitting(false);
		}}
		validationSchema={Yup.object().shape({
			username: Yup.string()
				.required('Username is required')
				.min(3, 'Username must be 3 characters or longer')
				.max(15, 'Username must be 15 characters or less'),
			email: Yup.string().required('Email is required').email('Email is not valid'),
			password: Yup.string()
				.required('Password is required')
				.min(8, 'Password must be 8 characters or longer')
				.matches(
					/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
					'Use at least: one number and one special character'
				),
			password2: Yup.string()
				.required('Matching password is required.')
				.test('passwords-match', 'Passwords must match', function(value) {
					return this.parent.password === value;
				})
		})}
	>
		{(props) => {
			const { values, touched, errors, isSubmitting, handleChange, handleBlur } = props;

			return (
				<div className="form_box">
					<form
						action={
							'/users/register/' +
							Intl.DateTimeFormat().resolvedOptions().timeZone +
							'?email={values.username}'
						}
						method="POST"
					>
						<h1>Create an account</h1>
						<div className="username">
							<label htmlFor="username">Username</label>
							<br />
							<input
								type="text"
								id="username"
								name="username"
								placeholder="Enter a username"
								value={values.username}
								onChange={handleChange}
								onBlur={handleBlur}
								autoComplete="new-password"
								className={errors.username && touched.username && 'error'}
								required
							/>
							{errors.username &&
							touched.username && <div className="input_feedback">{errors.username}</div>}
						</div>
						<br />
						<div className="email">
							<label htmlFor="email">Email</label>
							<br />
							<input
								type="text"
								id="email"
								name="email"
								value={values.email}
								onChange={handleChange}
								onBlur={handleBlur}
								className={errors.email && touched.email && 'error'}
								placeholder="Enter an Email"
								required
							/>
							{errors.email && touched.email && <div className="input_feedback">{errors.email}</div>}
						</div>
						<br />
						<div className="password">
							<label htmlFor="password">Password</label>
							<br />
							<input
								type="password"
								id="password"
								name="password"
								value={values.password}
								onChange={handleChange}
								onBlur={handleBlur}
								autoComplete="new-password"
								className={errors.password && touched.password && 'error'}
								placeholder="Enter a password"
								required
							/>
							{errors.password &&
							touched.password && <div className="input_feedback">{errors.password}</div>}
						</div>
						<br />
						<div className="password">
							<label htmlFor="password">Re-enter Password</label>
							<br />
							<input
								type="password"
								id="password2"
								name="password2"
								value={values.password2}
								onChange={handleChange}
								onBlur={handleBlur}
								autoComplete="new-password"
								className={errors.password2 && touched.password2 && 'error'}
								placeholder="Confirm password"
								required
							/>
							{errors.password2 &&
							touched.password2 && <div className="input_feedback">{errors.password2}</div>}
						</div>

						<button
							type="submit"
							className="formButton"
							disabled={
								errors.username || errors.email || errors.password || errors.password2 || isSubmitting
							}
						>
							Register
						</button>
						<p>
							Already have an account? <a href="login">Login here.</a>
						</p>
					</form>
				</div>
			);
		}}
	</Formik>
);

RegisterForm.propTypes = {
	values: PropTypes.object,
	touched: PropTypes.object,
	errors: PropTypes.object,
	isSubmitting: PropTypes.bool,
	handleChange: PropTypes.func,
	handleBlur: PropTypes.func
};

export default RegisterForm;
