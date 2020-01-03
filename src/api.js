import axios from 'axios';

// Fetch user data
export const fetchUser = (userID) => {
	return axios.get(`http://192.168.1.70:4242/api/userdata/${userID}`).then((resp) => resp.data);
};

// Authenticate the current user
export const authUser = () => {
	return axios.get(`http://192.168.1.70:4242/api/auth/init`).then((resp) => resp.data);
};

// Fetch all satisfaction reports by the user
export const fetchAllSatis = (userID) => {
	return axios.get(`http://192.168.1.70:4242/api/satis/all/${userID}`).then((resp) => resp.data);
};

// Fetch satisfaction report based on month and year
export const fetchMonthSatis = (userID, year, month) => {
	return axios.get(`http://192.168.1.70:4242/api/satis/${year}/${month}/${userID}`).then((resp) => resp.data);
};

// Post new satis report for the user
export const postNewSatis = (userID, mood) => {
	return axios.post(`http://192.168.1.70:4242/api/satis/report/${userID}/${mood}`).then((resp) => resp.data);
};

// Update the set work times on the database for the user
export const updateWorkTime = (userID, startHour, endHour) => {
	return axios
		.post(`http://192.168.1.70:4242/api/userdata/sethours/${userID}/${startHour}/${endHour}`)
		.then((resp) => resp.data);
};

// Update the work days on the database for the user
export const updateWorkDays = (userID, sunday, monday, tuesday, wednesday, thursday, friday, saturday) => {
	return axios
		.post(
			`http://192.168.1.70:4242/api/userdata/sethours/${userID}/${sunday}/${monday}/${tuesday}/${wednesday}/${thursday}/${friday}/${saturday}/`
		)
		.then((resp) => resp.data);
};
