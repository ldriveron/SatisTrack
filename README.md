# Satis Track
### By Luis Riveron

# Live At (Deployed)
[http://satis-track.herokuapp.com/](http://satis-track.herokuapp.com/)

Satis Track is a web application for keeping track of daily work satisfaction.

After creating an account and logging in, users set their work schedule which includes:
- Work start hour
- Work end hour
- Work days during the week

Users are encouraged to login everyday at their Work End Hour in order to post their current mood. Once the hour expires, the user is no longer allowed to enter a mood for that day. This is meant to hopefully offer more in the moment and realistic statistics for the user's work satisfaction.

Users also have an option to receive Email reminders to record their Mood Report on the exact hour they leave work--based on their selected work days.

Every reported day is saved to the database (MongoDB) and displayed as a monthly calendar for the user.

## Dashboard
![Satis Track Dashboard](public/Screenshots/DashboardSatisTrack.png)

## Dashboard Light Theme
![Satis Track Dashboard Light Theme](public/Screenshots/DashboardLightThemeSatisTrack.png)

## Edit Schedule
![Satis Track Hours Edit Schedule](public/Screenshots/EditScheduleHoursSatisTrack.png)

![Satis Track Days Edit Schedule](public/Screenshots/EditScheduleDaysSatisTrack.png)

## Post Report
![Satis Track Post Report](public/Screenshots/PostReportSatisTrack.png)

## Settings
![Settings](public/Screenshots/SettingsSatisTrack.png)

## Login
![Satis Track Login](public/Screenshots/LoginSatisTrack.png)

## Register
![Satis Track Register](public/Screenshots/RegisterSatisTrack.png)

## Built With
- Javascript (Node.js, Express.js, React JS)
- Passport.js for user authentication
- HTML5, CSS3, Sass
- MongoDB (Mongoose)