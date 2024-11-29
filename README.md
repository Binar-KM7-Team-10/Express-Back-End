
# Tiketku API

Flight ticket booking service.

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
| GET | /schedules/{scheduleId} | Retrieves a flight schedule details | FALSE |
| POST | /schedules | Creates a flight schedule | ADMIN |
| PATCH | /schedules/{scheduleId} | Edits a flight schedule | ADMIN |
| DELETE | /schedules/{scheduleId} | Deletes a flight schedule | ADMIN |
| GET | /bookings | Retrieves all bookings | TRUE |
| POST | /bookings?scheduleId={scheduleId} | Creates a booking | TRUE
| GET | /bookings/{bookingId} | Retrieves a booking details | TRUE |
| POST | /bookings/{bookingId}/payments | Creates a payment for a booking | TRUE |

### Objects
Endpoints for listing flight schedules

- schedule_object
	```
	{
		"scheduleId": <schedule_id>,
		"airlineName": <airline_name>,
		"seatClass": <seat_class_enum>,
		"duration": <flight_duration>,
		"flightNumber": <flight_number>,
		"availableSeat": <available_seat_amount>,
		"price": <ticket_price>,
		"departure": {
			"day": <departure_day>,
			"dateTime": <departure_date_time>,
			"cityCode": <departure_city_code>,
			"airportName": <airport_name>,
			"terminalGate": <terminal_gate>
		},
		"arrival": {
			"day": <arrival_day>,
			"dateTime": <arrival_date_time>,
			"cityCode": <arrival_city_code>,
			"airportName": <airport_name>
		},
		"facilities": {
			"baggage": <min_baggage_weight>,
			"cabinBaggage": <min_cabin_baggage_weight>,
			"entertainment": <boolean>,
			"meal": <boolean>,
			"wifi": <boolean>
		}
	}
	```

### GET /schedules

- **Description**: Retrieves all flight schedules.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: None
	- **Query Params**:

| Parameter | Description | Type | Example | Option |
| --- | --- | --- | --- | --- |
| dpCity | City of departure | string | _/schedule?dpCity=Jakarta_ | **Required** |
| arCity | City of arrival/destination | string | _/schedule?arCity=New York_ | **Required** |
| dpDate | Date of departure/outbound. Date format in YYYY-MM-DD. | date | _/schedule?dpDate=2024-11-25_ | **Required** |
| retDate | Date of return/inbound. Date format in YYYY-MM-DD. | date | _/schedule?retDate=2024-11-27_ | Optional |
| psg | Number of passengers. Separated by dot (.) to specify respective number of Adults, Children, and Babies | number | _/schedule?psg=2.1.0_ | **Required** |
| seatClass | Seat class. Value either "Economy", "Premium Economy", "Business", or "First Class" (without double-quotes) | string | _/schedule?seatClass=Economy_ | **Required** |
| minPrice | Minimum ticket price. Default value is 0. | number | _/schedule?minPrice=1500000_ | Optional |
| maxPrice | Maximum ticket price. Default value is null (not capped). | number | _/schedule?maxPrice=9000000_ | Optional |
| sort | Sort list of schedules by a category. Value either "price", "duration", "dpTime", "-dpTime", "arTime", or "-arTime" (without double-quotes). The list by default is sorted by earliest departure time (dpTime). | string | _/schedule?sort=-dpTime_ | Optional |
| limit | Pagination to limit the number of data to be fetched in a single request. By default the value is 10 | number | _/schedule?limit=10_ | Optional |
| offset | Pagination to skip the number of data before returning the next data. By default the value is 0 | number | _/schedule?offset=20_ | Optional |
| facility | Filter the facilities of a flight has. Value can be more than one, separated by dot (.). The values are "entertainment", "meal", and/or "wifi". By default the values are all of them. | string | _/schedule?facility=meal.wifi_ | Optional

- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "OK",
			"statusCode": 200,
			"message": "Successfully retrieved all schedules",
			"pageNumber": <page_number>,
			"data": {
				"schedules": {
					"outbound": [
							<schedule_object>,
							<schedule_object>,
							<schedule_object>,
							...
					],
					"inbound": [
							<schedule_object>,
							<schedule_object>,
							<schedule_object>,
							...
					]
				}
			}
		}
		```
	- Example:
		_Listing flight schedule with round-trip economy flight of departure date on 25th November 2024 from Jakarta to Melbourne with 3 passengers of 2 adults and 1 child, and return date of 27th November 2024 back from Melbourne to Jakarta_
		```json
		{
			"status": "OK",
			"statusCode": 200,
			"message": "Successfully retrieved all schedules",
			"pageNumber": 1,
			"data": {
				"schedules": {
					"outbound": [
						{
							"scheduleId": 1,
							"airlineName": "Jet Air",
							"seatClass": "Economy",
							"duration": 240,
							"flightNumber": "JT203",
							"availableSeat": 50,
							"price": 4950000,
							"departure": {
								"day": "Senin",
								"dateTime": "2024-11-25T07:00:00.000Z",
								"cityCode": "JKT",
								"airportName": "Soekarno Hatta International Airport",
								"terminalGate": "2A Internasional"
							},
							"arrival": {
								"day": "Senin",
								"dateTime": "2024-11-25T11:00:00.000Z",
								"cityCode": "MLB",
								"airportName": "Melbourne International Airport"
							},
							"facilities": {
								"baggage": 20,
								"cabinBaggage": 7,
								"entertainment": true,
								"meal": true,
								"wifi": true
							}
						},
						{
							"scheduleId": 2,
							"airlineName": "Garuda Indonesia",
							"seatClass": "Economy",
							"duration": 210,
							"flightNumber": "GA152",
							"availableSeat": 30,
							"price": 8000000,
							"departure": {
								"day": "Senin",
								"dateTime": "2024-11-25T09:00:00.000Z",
								"cityCode": "JKT",
								"airportName": "Soekarno Hatta International Airport",
								"terminalGate": "1A"
							},
							"arrival": {
								"day": "Senin",
								"dateTime": "2024-11-25T12:30:00.000Z",
								"cityCode": "MLB",
								"airportName": "Melbourne International Airport"
							},
							"facilities": {
								"baggage": 15,
								"cabinBaggage": 5,
								"entertainment": true,
								"meal": true,
								"wifi": true
							}
						}
					],
					"inbound": [
						{
							"scheduleId": 40,
							"airlineName": "Batik Air",
							"seatClass": "Economy",
							"duration": 240,
							"flightNumber": "BA902",
							"availableSeat": 72,
							"price": 5000000,
							"departure": {
								"day": "Rabu",
								"dateTime": "2024-11-27T05:00:00.000Z",
								"cityCode": "MLB",
								"airportName": "Melbourne International Airport",
								"terminalGate": "2C International"
							},
							"arrival": {
								"day": "Rabu",
								"dateTime": "2024-11-27T09:00:00.000Z",
								"cityCode": "JKT",
								"airportName": "Soekarno Hatta International Airport"
							},
							"facilities": {
								"baggage": 20,
								"cabinBaggage": 7,
								"entertainment": true,
								"meal": true,
								"wifi": true
							}
						},
						{
							"scheduleId": 69,
							"airlineName": "Lion Air",
							"seatClass": "Economy",
							"duration": 210,
							"flightNumber": "LA090",
							"availableSeat": 15,
							"price": 4000000,
							"departure": {
								"day": "Rabu",
								"dateTime": "2024-11-27T17:00:00.000Z",
								"cityCode": "MLB",
								"airportName": "Melbourne International Airport",
								"terminalGate": "1D"
							},
							"arrival": {
								"day": "Rabu",
								"dateTime": "2024-11-27T20:30:00.000Z",
								"cityCode": "JKT",
								"airportName": "Soekarno Hatta International Airport"
							},
							"facilities": {
								"baggage": 20,
								"cabinBaggage": 7,
								"entertainment": true,
								"meal": true,
								"wifi": true
							}
						}
					]
				}
			}
		```

- **Success Response (Empty Data)**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "OK",
			"statusCode": 200,
			"message": "Schedule is empty",
			"data": []
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Error",
			"statusCode": 500,
			"message": "Internal Server Error"
		}
		```
 

### GET /schedules/{scheduleId}

- **Description**: Retrieves a flight schedule details.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: scheduleId (number)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "OK",
			"statusCode": 200,
			"message": "Successfully retrieved schedule details",
			"data": <schedule_object>
		}
		```
	- Example:
		```json
		{
			"status": "OK",
			"statusCode": 200,
			"message": "Successfully retrieved schedule details",
			"data": {
				"scheduleId": 69,
				"airlineName": "Lion Air",
				"seatClass": "Economy",
				"duration": 210,
				"flightNumber": "LA090",
				"availableSeat": 15,
				"price": 4000000,
				"departure": {
					"day": "Rabu",
					"dateTime": "2024-11-27T17:00:00.000Z",
					"cityCode": "MLB",
					"airportName": "Melbourne International Airport",
					"terminalGate": "1D"
				},
				"arrival": {
					"day": "Rabu",
					"dateTime": "2024-11-27T20:30:00.000Z",
					"cityCode": "JKT",
					"airportName": "Soekarno Hatta International Airport"
				},
				"facilities": {
					"baggage": 20,
					"cabinBaggage": 7,
					"entertainment": true,
					"meal": true,
					"wifi": true
				}
			}
		}
		```

- **Fail Response (Schedule Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Fail",
			"statusCode": 404,
			"message": "Schedule does not exist"
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Fail",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "scheduleId must be a number!"
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Error",
			"statusCode": 500,
			"message": "Internal Server Error"
		}
		```
	
### POST /schedules

- **Description**: Creates a flight schedule.
- **Parameters**:
	- **Data params**:
		```
		{
			"flightId": <flight_id>,
			"departureDateTime": <departure_datetime_iso8601>,
			"arrivalDateTime": <arrival_datetime_iso8601>,
			"ticketPrice": <ticket_price>,
			"seatAvailability": <available_seat>,
			"seatClass": <seat_class_enum>,
			"terminalGate": <terminal_gate>
		}
		```
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 201
	- Response Body:
		```
		{
			"status": "OK",
			"statusCode": 201,
			"message": "Successfully created a new schedule",
			"data": {
				"scheduleId": <schedule_id>
		}
		```
	-  Example:
		```json
		{
			"status": "OK",
			"statusCode": 201,
			"message": "Successfully created a new schedule",
			"data": {
				"scheduleId": 403
			}
		}
		```

- **Fail Response (Flight Does Not Exist)**:
	- Code: 400
	- Response Body:
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "Flight does not exist. Schedule must be created from existing flight!"
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Fail",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "seatClass must be either Economy, Premium Economy, Business, or First Class!"
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Error",
			"statusCode": 500,
			"message": "Internal Server Error"
		}
		```

### PATCH /schedules/{scheduleId}

- **Description**: Edits a flight schedule.
- **Parameters**:
	- **Data params**:
		```
		{
			"departureDateTime": <departure_datetime_iso8601>,
			"arrivalDateTime": <arrival_datetime_iso8601>,
			"ticketPrice": <ticket_price>,
			"seatAvailability": <available_seat>,
			"seatClass": <seat_class_enum>,
			"terminalGate": <terminal_gate>
		}
		```
		> Please include one or more fields to be updated.
	- **Path Params**: scheduleId (number)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "OK",
			"statusCode": 200,
			"message": "Successfully edited schedule"
		}
		```

- **Fail Response (Schedule Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Fail",
			"statusCode": 404,
			"message": "Schedule does not exist"
		}
		```

- **Fail Response (Invalid Request Body)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Fail",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example:
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "id or flightId must not be changed!"
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Fail",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "seatClass must be either Economy, Premium Economy, Business, or First Class!"
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Error",
			"statusCode": 500,
			"message": "Internal Server Error"
		}
		```

### DELETE /schedules/{scheduleId}

- **Description**: Deletes a flight schedule.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: scheduleId (number)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "OK",
			"statusCode": 200,
			"message": "Successfully deleted schedule"
		}
		```

- **Fail Response (Schedule Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Fail",
			"statusCode": 404,
			"message": "Schedule does not exist"
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Fail",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "scheduleId must be a number!"
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Error",
			"statusCode": 500,
			"message": "Internal Server Error"
		}
		```


### POST /login
- **Description**: Login for get token authenticate.
-  **Parameters**:
	- **Data params**: None
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 201
	- Response Body:
	```
		{
  "message": "Login berhasil",
  "status" : "OK",
  "statusCode" : 201,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Error",
			"statusCode": 500,
			"message": "Internal Server Error"
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 401
	- Response Body:
		```
		{
			"status": "Fail",
			"statusCode": 401,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 401,
			"message": "email must be a email!"
		}
		```
	- **Fail Response (Login Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Fail",
			"statusCode": 404,
			"message": "Login does not exist"
		}
		```

### POST /register
 **Description**: Make user account.
-  **Parameters**:
	- **Data params**: None
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Success Response**:
	- Code: 201
	- Response Body:
	```
		{
  "message": "Register berhasil",
  "status" : "OK",
  "statusCode" : 201,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Error",
			"statusCode": 500,
			"message": "Internal Server Error"
		}
		```
- **Fail Response (Validation Error)**:
	- Code: 401
	- Response Body:
		```
		{
			"status": "Fail",
			"statusCode": 401,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 401,
			"message": "email must be a email!"
		}
		```
- **Fail Response (Register Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Fail",
			"statusCode": 404,
			"message": "Register does not exist"
		}
		```

### GET / dashboard
-   **Description**: Retrieves all flight schedules.
-   **Parameters**:
    -   **Data params**: None
    -   **Path Params**: None
    -   **Query Params**:None
-   **Headers**:
    
    -   Content-Type: application/json
-   **Success Response**:
    
    -   Code: 200
    -   Response Body:
        
        ```
        {
        	"status": "OK",
        	"statusCode": 200,
        	"message": "Successfully retrieved dashboard",
        	"pageNumber": <page_number>,
        	"data": {
	        	"card" : {
	        	"departureAirdport" : "Jakarta",
	        	"arrivalAirport" : "Bangkok",
	        	"airline" : "AirAsia",
	        	"duration" : "20 - 30 Maret 2023",
	        	"ticketPrice" :"IDR 950.000"
	        	}
        	}
        }
  
  - **Fail Response (Dashboard Does Not Exist)**:
 **Failed Response**:
- Code: 404
- Response Body:
   
           {
        	"status": "Fail",
        	"statusCode": 404,
        	"message": "Page Not Found"
        }
       
