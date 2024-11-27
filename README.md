
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
| GET | /users/{userId} | Retrieves a user details | ADMIN |
| POST | /users | Creates a user account | ADMIN |
| PATCH | /users/{userId} | Edits a user | ADMIN |
| DELETE | /users/{userId} | Deletes a user | ADMIN |
| GET | /schedules | Retrieves all flight schedules | FALSE |
| GET | /schedules/{scheduleId} | Retrieve a flight schedule details | FALSE |
| POST | /schedules | Creates a flight schedule | ADMIN |
| PATCH | /schedules/{scheduleId} | Edits a flight schedule | ADMIN |
| DELETE | /schedules/{scheduleId} | Deletes a flight schedule | ADMIN |
| GET | /flights/{flightId} | 
| GET | /bookings | Retrieves all bookings | TRUE |
| GET | /bookings/{bookingId} | Retrieves a booking details | TRUE |

## Ticket Listing

Endpoints for listing flight schedules

- Schedule object
	```
	{
		id: integer
		flightId: integer
		flightNumber: string
		departureDateTime: datetime(iso 8601)
		arrivalDateTime: datetime(iso 8601)
		duration: integer
		departureCityCode: string
		arrivalCityCode: string
		ticketPrice: integer
		departureAirport: string
		departureTerminalGate: string
		arrivalAirport: string
		airline: string
		seatClass: string
		seatAvailability: integer
		maxBaggageWeight: integer
		maxCabinBaggageWeight: integer
		services: [serviceName1, serviceName2]
	}
	```
### GET /schedules
- **Description**: Retrieves all flight schedules.
- **Parameters**:
	- **Path Params**: None
	- **Query Params**:
		- ```ct={Departure City}.{Arrival City}```
			- Description: City of departure and arrival. 
			- Example: ```ct=Jakarta.Denpasar``` or ```ct=Jakarta.New%20York```
		- ```dt={Departure Date}.{NA/Return Date}```
			- Description: Date of departure and return. For one-way flight, put ```NA``` as the value.
			- Example: ```dt=27-11-2024.NA``` or ```dt=27-11-2024.30-11-2024```
		- ```ps={No. of adults}.{No. of childs}.{No. of babies}```
			- Description: Number of passengers. Each number assigned for specific age group.
			- Example: ```ps=2.1.0```
		- ```sc={Seat Class}```
			- Description: Passenger seat class.
			- Example: ```sc=Economy``` or ```sc=First%20Class```
		- ```pr={Minimum Price}.{NA/Maximum Price}```
			- Description: Flight ticket price range.
			- Example: ```pr=1500000.5000000``` or ```pr=3000000.NA```
		- ```sort={-}{Sorting category}.{Sorting category 2}```
			- Sorting categories: ```price```, ```duration```, ```dptime```, ```artime```
			- Description: Sort data by categories
			- Example: ```sort=price``` or ```sort=-artime``` or ```sort=price.duration.dptime.-artime```
		- ```limit={No. of data to be fetched}```
			- Description: Paginate how many data shown.
			- Example: ```limit=20```
		- ```offset={No. of data to be skipped}```
			- Description: Paginate offset
			- Example: ```offset=40``` or ```limit=20&offset=40```
	- **Data Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "OK",
			"message": "Successfully retrieved all schedules",
			// tambahin jumlah data dan halaman k brp
			"schedules": [
				{<schedule_object>},
				{<schedule_object>},
				{<schedule_object>}
			]
		}
		```
	- Example:
		```json
		{
			"status": "OK",
			"message": "Successfully retrieved all schedules",
			"schedules": [
				{
					"id": 1,
					"flightId": 1,
					"flightNumber": "JT-203",
					"departureDateTime": "2024-11-25T07:00:00.000Z",
					"arrivalDateTime": "2024-11-25T11:00:00.000Z",
					"duration": 240,
					"departureCityCode": "JKT",
					"arrivalCityCode": "MLB",
					"ticketPrice": 4950000,
					"departureAirport": "Soekarno Hatta International Airport",
					"departureTerminalGate": "2A Internasional",
					"arrivalAirport": "Melbourne International Airport",
					"airline": "Jet Air",
					"seatClass": "Economy",
					"seatAvailability": 50,
					"maxBaggageWeight": 20,
					"maxCabinBaggageWeight": 7,
					"services": [
						"In-Flight Entertainment",
						"In-Flight Meal",
						"WiFi"
					]
				},
				{
					"id": 4,
					"flightId": 2,
					"flightNumber": "GA-513",
					"departureDateTime": "2024-11-27T13:55:00.000Z",
					"arrivalDateTime": "2024-11-27T15:30:00.000Z",
					"duration": 95,
					"departureCityCode": "PNK",
					"arrivalCityCode": "JKT",
					"ticketPrice": 1597200,
					"departureAirport": "Supadio",
					"departureTerminalGate": "1B Domestik",
					"arrivalAirport": "Soekarno Hatta International Airport",
					"airline": "Garuda Indonesia",
					"seatClass": "Economy",
					"seatAvailability": 100,
					"maxBaggageWeight": 20,
					"maxCabinBaggageWeight": 7,
					"services": [
						"In-Flight Entertainment",
						"In-Flight Meal"
					]
				}
			]
		}
		```