import React from 'react';
import PropTypes from 'prop-types';

const LoginForm = (props) => {
	return (
		<div className="form_box">
			<form action="/users/login" method="POST">
				<h1>Welcome</h1>
				<div className="email">
					<label htmlFor="email">Email</label>
					<br />
					<input
						type="text"
						id="email"
						name="email"
						placeholder="Enter your Email"
						defaultValue={props.email}
						required
					/>
				</div>
				<br />
				<div className="password">
					<label htmlFor="password">Password</label>
					<br />
					<input type="password" id="password" name="password" placeholder="Enter your password" required />
				</div>

				<button type="submit" className="formbutton">
					Login
				</button>
				<p>
					Don&apos;t have an account? <a href="register">Create one here.</a>
				</p>
			</form>
		</div>
	);
};

LoginForm.propTypes = {
	email: PropTypes.array
};

export default LoginForm;
