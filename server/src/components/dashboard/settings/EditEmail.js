import React from 'react';
import PropTypes from 'prop-types';

// Form validation
import { Formik } from 'formik';
import * as Yup from 'yup';

const EditEmail = (props) => (
	<Formik
		initialValues={{ newEmail: '' }}
		onSubmit={(values, { setSubmitting }) => {
			setSubmitting(false);
		}}
		validationSchema={Yup.object().shape({
			newEmail: Yup.string()
				.required('New Email is required')
				.email('New Email is not valid')
				.test('email-match', 'This is your current Email. Enter a different one.', function(value) {
					return props.current_email != value;
				})
		})}
	>
		{(props) => {
			document.title = 'Edit Email';

			const { values, newEmail, touched, errors, isSubmitting, handleChange, handleBlur } = props;

			return (
				<div>
					<form action="/api/userdata/editemail" method="POST">
						<div className="panel_title">Edit Email</div>
						<label>Enter New Email Address</label>
						<input
							type="text"
							name="newEmail"
							id="newEmail"
							value={values.newEmail}
							onBlur={handleBlur}
							className={errors.newEmail && touched.newEmail && 'error'}
							onChange={handleChange}
							defaultValue={newEmail}
						/>
						{errors.newEmail && touched.newEmail && <div className="input_feedback">{errors.newEmail}</div>}
						<button type="submit" className="formButton" disabled={errors.newEmail || isSubmitting}>
							Update Email
						</button>
						<br />
						<br />
						Editing your Email will require confirmation and will deactive Email notifications.
					</form>
				</div>
			);
		}}
	</Formik>
);

EditEmail.propTypes = {
	newEmail: PropTypes.string,
	current_email: PropTypes.string,
	values: PropTypes.object,
	touched: PropTypes.object,
	errors: PropTypes.object,
	isSubmitting: PropTypes.bool,
	handleChange: PropTypes.func,
	handleBlur: PropTypes.func,
	handleSubmit: PropTypes.func
};

export default EditEmail;
