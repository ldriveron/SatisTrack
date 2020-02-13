import axios from 'axios';

// Fetch user data
export const fetchUser = () => {
	return axios.get(`/api/userdata`).then((resp) => resp.data);
};

// Authenticate the current user
export const authUser = () => {
	return axios.get(`/api/auth/init`).then((resp) => resp.data);
};

// Fetch all satisfaction reports by the user
export const fetchAllSatis = () => {
	return axios.get(`/api/satis/all`).then((resp) => resp.data);
};

// Fetch satisfaction report based on month and year
export const fetchMonthSatis = (year, month) => {
	return axios.get(`/api/satis/${year}/${month}`).then((resp) => resp.data);
};

// Post new satis report for the user
export const postNewSatis = (mood, recap) => {
	return axios.post(`/api/satis/report/${mood}/${recap}`).then((resp) => resp.data);
};

// Update the set work times on the database for the user
export const updateWorkTime = (startHour, endHour) => {
	return axios.post(`/api/userdata/sethours/${startHour}/${endHour}`).then((resp) => resp.data);
};

// Update the work days on the database for the user
export const updateWorkDays = (sunday, monday, tuesday, wednesday, thursday, friday, saturday) => {
	return axios
		.post(`/api/userdata/setschedule/${sunday}/${monday}/${tuesday}/${wednesday}/${thursday}/${friday}/${saturday}`)
		.then((resp) => resp.data);
};
