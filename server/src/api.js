import axios from 'axios';

// Fetch user data
export const fetchUser = (userID) => {
	return axios.get(`/api/userdata/${userID}`).then((resp) => resp.data);
};

// Authenticate the current user
export const authUser = () => {
	return axios.get(`/api/auth/init`).then((resp) => resp.data);
};

// Fetch all satisfaction reports by the user
export const fetchAllSatis = (userID) => {
	return axios.get(`/api/satis/all/${userID}`).then((resp) => resp.data);
};

// Fetch satisfaction report based on month and year
export const fetchMonthSatis = (userID, year, month) => {
	return axios.get(`/api/satis/${year}/${month}/${userID}`).then((resp) => resp.data);
};

// Post new satis report for the user
export const postNewSatis = (userID, mood, recap) => {
	return axios.post(`/api/satis/report/${userID}/${mood}/${recap}`).then((resp) => resp.data);
};

// Update the set work times on the database for the user
export const updateWorkTime = (userID, startHour, endHour) => {
	return axios.post(`/api/userdata/sethours/${userID}/${startHour}/${endHour}`).then((resp) => resp.data);
};

// Update the work days on the database for the user
export const updateWorkDays = (userID, sunday, monday, tuesday, wednesday, thursday, friday, saturday) => {
	return axios
		.post(
			`/api/userdata/setschedule/${userID}/${sunday}/${monday}/${tuesday}/${wednesday}/${thursday}/${friday}/${saturday}`
		)
		.then((resp) => resp.data);
};
