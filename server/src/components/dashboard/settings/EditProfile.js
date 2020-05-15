import React from 'react';
import PropTypes from 'prop-types';

// Form validation
import { Formik } from 'formik';
import * as Yup from 'yup';

const EditProfile = (props) => (
	<Formik
		initialValues={{ username: props.username, company: props.company }}
		onSubmit={(values, { setSubmitting }) => {
			setSubmitting(false);
		}}
		validationSchema={Yup.object().shape({
			username: Yup.string()
				.required('New username is required')
				.min(3, 'Username must be 3 characters or longer')
				.max(15, 'Username must be 15 characters or less'),
			company: Yup.string()
				.min(2, 'Company name must be 2 characters or longer')
				.max(20, 'Company name must be 50 characters or less')
		})}
	>
		{(props) => {
			document.title = 'Edit Profile';

			const { values, username, company, touched, errors, isSubmitting, handleChange, handleBlur } = props;

			return (
				<div>
					<form action="/api/userdata/editprofile" method="POST">
						<div className="panel_title">Profile</div>
						<label>Change Username</label>
						<input
							type="text"
							name="username"
							id="username"
							value={values.username}
							onBlur={handleBlur}
							className={errors.username && touched.username && 'error'}
							onChange={handleChange}
							defaultValue={username}
						/>
						{errors.username && touched.username && <div className="input_feedback">{errors.username}</div>}

						<br />
						<br />
						<label>Company Name (Optional)</label>
						<input
							type="text"
							name="company"
							id="company"
							value={values.company}
							onBlur={handleBlur}
							className={errors.company && touched.company && 'error'}
							onChange={handleChange}
							defaultValue={company}
							placeholder="Enter your company name"
						/>
						{errors.company && touched.company && <div className="input_feedback">{errors.company}</div>}

						<button
							type="submit"
							className="formButton"
							disabled={errors.username || errors.company || isSubmitting}
						>
							Update Profile
						</button>
					</form>
				</div>
			);
		}}
	</Formik>
);

EditProfile.propTypes = {
	username: PropTypes.string,
	company: PropTypes.string,
	values: PropTypes.object,
	touched: PropTypes.object,
	errors: PropTypes.object,
	isSubmitting: PropTypes.bool,
	handleChange: PropTypes.func,
	handleBlur: PropTypes.func,
	handleSubmit: PropTypes.func
};

export default EditProfile;
