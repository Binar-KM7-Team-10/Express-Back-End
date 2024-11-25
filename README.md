# Tiketku API

API for Final Project.

## Endpoints

| Method | URL | Functionality | Authentication | 
| --- | --- | --- | --- |
| POST | /register | Creates a user account | FALSE |
| POST | /login | Logs in a user | TRUE |
| GET | /login/google | Logs in / creates a user account with Google OAuth 2.0 | FALSE |
| POST | /logout | Logs out a user | TRUE |
| GET | /users | Retrieves all users | ADMIN |
| GET | /users/:userId | Retrieves a user details | ADMIN |
| POST | /users | Creates a user account | ADMIN |
| PATCH | /users/:userId | Edits a user | ADMIN |
| DELETE | /users/:userId | Deletes a user | ADMIN |
| GET | /schedules | Retrieves all flight schedules | FALSE |
| GET | /schedules/:scheduleId | Retrieve a flight schedule details | FALSE |
| POST | /schedules | Creates a flight schedule | ADMIN |
| PATCH | /schedules/:scheduleId | Edits a flight schedule | ADMIN |
| DELETE | /schedules/:scheduleId | Deletes a flight schedule | ADMIN |
| GET | /bookings | Retrieves all bookings | TRUE |
| GET | /bookings/:id | Retrieves a booking details | TRUE |