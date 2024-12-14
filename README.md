

# Tiketku API

Flight ticket booking service.

## Table of Contents

- [Tiketku API](#tiketku-api)
	- [Table of Contents](#table-of-contents)
	- [Enumerations](#enumerations)
	- [Objects](#objects)
		- [user\_object](#user_object)
		- [schedule\_object](#schedule_object)
		- [seat\_object](#seat_object)
		- [passenger\_object](#passenger_object)
		- [invoice\_object](#invoice_object)
		- [payment\_object](#payment_object)
		- [booking\_object](#booking_object)
		- [card\_object](#card_object)
		- [pagination\_object](#pagination_object)
		- [city\_object](#city_object)
	- [Endpoints](#endpoints)
		- [POST /register](#post-register)
		- [POST /register/otp](#post-registerotp)
		- [POST /register/otp/resend](#post-registerotpresend)
		- [POST /login](#post-login)
		- [GET /logout](#get-logout)
		- [POST /forgot-password](#post-forgot-password)
		- [POST /reset-password](#post-reset-password)
		- [GET /users](#get-users)
		- [GET /users/{userId}](#get-usersuserid)
		- [POST /users](#post-users)
		- [PATCH /users/{userId}](#patch-usersuserid)
		- [DELETE /users/{userId}](#delete-usersuserid)
		- [GET /schedules](#get-schedules)
		- [GET /schedules/{scheduleId}](#get-schedulesscheduleid)
		- [POST /schedules](#post-schedules)
		- [PATCH /schedules/{scheduleId}](#patch-schedulesscheduleid)
		- [DELETE /schedules/{scheduleId}](#delete-schedulesscheduleid)
		- [GET /bookings](#get-bookings)
		- [GET /bookings/{bookingId}](#get-bookingsbookingid)
		- [POST /bookings](#post-bookings)
		- [POST /bookings/{bookingId}/payments](#post-bookingsbookingidpayments)
		- [GET /homepage](#get-homepage)
		- [GET /auth](#get-auth)
		- [GET /cities](#get-cities)
		- [GET /cities/{cityId}](#get-citiescityid)



## Enumerations

| Object | Members |
| --- | --- |
| user_role_enum | `Buyer`, `Admin` |
| seat_class_enum | `Economy`, `Premium Economy`, `Business`, `First Class` |
| age_group_enum | `Adult`, `Child`, `Baby` |
| continent_enum | `All`, `Asia`, `Africa`, `America`, `Australia`, `Europe` |
| day_enum | `Minggu`, `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu` |
| booking_status_enum | `Unpaid`, `Issued`, `Cancelled` |
| journey_type_enum | `One-way`, `Round-trip` |

## Objects
Endpoints for listing flight schedules

### user_object
	```
	{
		"id": <user_id>,
		"fullName": <full_name>,
		"email": <email>,
		"phoneNumber": <phone_number>,
		"role": <user_role_enum>
	}
	```

### schedule_object
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
			"day": <day_enum>,
			"dateTime": <departure_datetime>,
			"city": <city_name>,
			"cityCode": <departure_city_code>,
			"airportName": <airport_name>,
			"terminalGate": <terminal_gate>
		},
		"arrival": {
			"day": <day_enum>,
			"dateTime": <arrival_datetime>,
			"city": <city_name>,
			"cityCode": <arrival_city_code>,
			"airportName": <airport_name>
		},
		"facilities": {
			"baggage": <max_baggage_weight>,
			"cabinBaggage": <max_cabin_baggage_weight>,
			"entertainment": <boolean>,
			"meal": <boolean>,
			"wifi": <boolean>
		}
	}
	```

### seat_object
	```
	{
		"available": <available_seat_amount>,
		"map": [
			{ <seat_number>: <boolean> },
			{ <seat_number>: <boolean> },
			...
		]
	}
	```
	> For each seat_number, `true` means available to be booked, `false` means otherwise.

### passenger_object
	```
	{
		"passengerId": <passenger_id>,
		"label": <passenger_label>,
		"title": <passenger_title>,
		"fullName": <passenger_full_name>,
		"familyName": <passenger_family_name>,
		"ageGroup": <passenger_age_group>,
		"seatNumber": {
			"outbound": <outbound_seat_number>,
			"inbound": <inbound_seat_number>
		}
	}
	```

### invoice_object
	```
	{
		"invoiceId": <invoice_id>,
		"paymentDueDateTime": <payment_due_date_time>,
		"subtotal": <subtotal_amount>,
		"taxAmount": <tax_amount>,
		"totalAmount": <total_amount>
	}
	```

### payment_object
	```
	{
		"paymentId": <payment_id>,
		"date": <payment_date_time>,
		"method": <payment_method_enum>
	}
	```

### booking_object
	```
	{
		"bookingId": <booking_id>,
		"bookingCode": <booking_code>,
		"date": <booking_date_time>,
		"status": <booking_status_enum>,
		"journeyType": <journey_type_enum>,
		"itinerary": {
			"outbound": <schedule_object>,
			"inbound": <schedule_object>
		},
		"passenger": {
			"total": <total_passenger>,
			"adult": <total_adult_passenger>,
			"child": <total_child_passenger>,
			"baby": <total_baby_passenger>,
			"data": [
				<passenger_object>,
				<passenger_object>,
				...
			]
		},
		"invoice": <invoice_object>,
		"payment": <payment_object>
	}
	```

### card_object
	```
	{
		"departureCity": <departure_city>,
		"arrivalCity": <arrival_city>,
		"arrivalCityImageUrl": <image_url>,
		"airline": <airline_name>,
		"startDate": <start_datetime>,
		"endDate": <end_datetime>,
		"minPrice": <minimum_price>
	}
	```

### pagination_object
	```
	{
		"currentPage": <current_page_number>,
		"totalPage": <total_page_amount>,
		"count": <item_count_page>,
		"total": <item_count_total>,
		"hasNextPage": <boolean>,
		"hasPreviousPage": <boolean>
	}
	```

### city_object
	```
	{
		"cityId": <city_id>,
		"name": <city_name>,
		"code": <city_iata_code>,
		"country": <country>,
		"continent": <continent>,
		"imageUrl": <imageUrl>
	}
	```

## Endpoints

| Method | URL | Functionality | Authentication | 
| --- | --- | --- | --- |
| POST | /register | Creates a user account | FALSE |
| POST | /register/otp | Verify a user account with OTP | FALSE |
| POST | /register/otp/resend | Resend OTP to user's email | FALSE |
| POST | /login | Logs in a user | FALSE |
| GET | /login/google | Logs in/creates a user account with Google OAuth 2.0 | FALSE |
| GET | /logout | Logs out a user | TRUE |
| POST | /forgot-password | Sends an email with a url to reset password | FALSE |
| POST| /reset-password | Resets a password of a user | TRUE |
| GET | /users | Retrieves all users | ADMIN |
| GET | /users/{userId} | Retrieves a user details | TRUE |
| POST | /users | Creates a user account | ADMIN |
| PATCH | /users/{userId} | Edits a user | TRUE |
| DELETE | /users/{userId} | Deletes a user | ADMIN |
| GET | /schedules | Retrieves all flight schedules | FALSE |
| GET | /schedules/{scheduleId} | Retrieves a flight schedule details | FALSE |
| POST | /schedules | Creates a flight schedule | ADMIN |
| PATCH | /schedules/{scheduleId} | Edits a flight schedule | ADMIN |
| DELETE | /schedules/{scheduleId} | Deletes a flight schedule | ADMIN |
| GET | /bookings | Retrieves all bookings | TRUE |
| GET | /bookings/{bookingId} | Retrieves a booking details | TRUE |
| POST | /bookings | Creates a booking | TRUE |
| POST | /bookings/{bookingId}/payments | Creates a payment for a booking | TRUE |
| GET | /homepage | Retrieves homepage data | FALSE |
| GET | /auth | Authenticate user | TRUE |
| GET | /cities | Retrieves all cities data | FALSE |
| GET | /cities/{cityId} | Retrieves a city details | FALSE |

---

### POST /register

- **Description**: Creates a user account.
- **Parameters**:
	- **Data params**:
		```
		{
			"fullName": <full_name>,
			"email": <email>,
			"phoneNumber": <phone_number>,
			"password": <password>
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
			"status": "Success",
			"statusCode": 201,
			"message": "Registrasi berhasil. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.",
			"data": {
				"user": <user_object>
			}
		}
		```
	- Example:
		```json
		{
			"status" : "Success",
			"statusCode" : 201,
			"message": "Registrasi berhasil. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.",
			"data": {
				"user": {
					"id": 1,
					"fullName": "John Doe",
					"email": "user@example.com",
					"phoneNumber": "6281245678912",
					"role": "Buyer"
				}
			}
		}
		```

- **Fail Response (Email Already Registered)**:
	- Code: 409
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 409,
			"message": "Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```
		
---

### POST /register/otp

- **Description**: Verify a user account with OTP sent to the user's email.
- **Parameters**:
	- **Data params**:
		```
		{
			"email": <email>,
			"otp": <otp>
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
			"status": "Success",
			"statusCode": 201,
			"message": "Verifikasi OTP berhasil. Akun Anda sekarang aktif dan dapat digunakan.",
			"data": {
				"user": <user_object>,
				"accessToken": <jwt_token>
			}
		}
		```
	- Example:
		```json
		{
			"status" : "Success",
			"statusCode" : 201,
			"message": "Verifikasi OTP berhasil. Akun Anda sekarang aktif dan dapat digunakan.",
			"data": {
				"user": {
					"id": 1,
					"fullName": "John Doe",
					"email": "user@example.com",
					"phoneNumber": "6281245678912",
					"role": "Buyer"
				},
				"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
			}
		}
		```

- **Fail Response (Invalid Verification)**:
	- Code: 400
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Verifikasi OTP gagal. Pastikan kode OTP yang dimasukkan benar dan belum kedaluwarsa."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### POST /register/otp/resend

- **Description**: Resend OTP to user's account.
- **Parameters**:
	- **Data params**:
		```
		{
			"email": <email>
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
			"status": "Success",
			"statusCode": 201,
			"message": "Kode OTP telah berhasil dikirim ulang. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda."
		}
		```
	- Example:
		```json
		{
			"status" : "Success",
			"statusCode" : 201,
			"message": "Kode OTP telah berhasil dikirim ulang. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda."
		}
		```

- **Fail Response (Email Already Registered)**:
	- Code: 409
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 409,
			"message": "Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```
		
---

### POST /login

- **Description**: Logs in a user to authenticate
- **Parameters**:
	- **Data params**:
		```
		{
			"email": <email>,
			"password": <password>
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
			"status": "Success",
			"statusCode": 201,
			"message": "Login berhasil.",
			"data": {
				"user": <user_object>,
			    "accessToken": <jwt_token>
		  }
		}
		```
	- Example
		```json
		{
			"status": "Success",
			"message": "Login berhasil.",
			"statusCode": 201,
			"data": {
				"user": {
					"id": 1,
					"fullName": "John Doe",
					"email": "user@example.com",
					"phoneNumber": "6281245678912",
					"role": "Buyer"
			    },
			    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
		  }
		}
		```

- **Fail Response (Invalid Credentials)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Email atau kata sandi yang Anda masukkan salah."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /logout

- **Description**: Logs out a user by sending a very short-lived JWT token.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required)
- **Success Response**:
	- Code: 201
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Logout berhasil. Anda telah keluar dari akun Anda.",
			"data": {
			    "accessToken": <access_token>
		  }
		}
		```
	- Example
		```json
		{
			"status": "Success",
			"message": "Logout berhasil. Anda telah keluar dari akun Anda.",
			"statusCode": 201,
			"data": {
			    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
		  }
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### POST /forgot-password

- **Description**: Sends an email with a url to reset password.
- **Parameters**:
	- **Data params**:
		```
		{
			"email": <email>,
		}
		```
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Permintaan reset password berhasil. Silakan cek email Anda untuk tautan reset password."
		}
		```

- **Fail Response (Email Is Not Registered)**:
	- Code: 400
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Email tidak terdaftar. Pastikan email yang Anda masukkan benar."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### POST /reset-password

- **Description**: Resets a password of a user.
- **Parameters**:
	- **Data params**:
		```
		{
			"passwordResetToken": <password_reset_token>,
			"newPassword": <new_password>,
			"confirmNewPassword": <confirm_new_password>
		}
		```
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Password berhasil direset. Silakan login dengan password baru Anda."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 400
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Token reset password tidak valid atau telah kedaluwarsa. Silakan lakukan permintaan reset password kembali."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Fail",
			"statusCode": 400,
			"message": "Password tidak valid. Pastikan password memiliki antara 8 hingga 70 karakter."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /users

- **Description**: Retrieves all users data.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Admin Only)
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data pengguna berhasil diambil.",
			"data": [
				<user_object>,
				<user_object>,
				...
			]
		}
		```
	- Example:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data pengguna berhasil diambil.",
			"data": [
				{
					"id": 1,
					"fullName": "John Doe",
					"email": "example@mail.com",
					"phoneNumber": "6281245678912",
					"role": "Buyer"
				},
				{
					"id": 2,
					"fullName": "Matthew Murdock",
					"email": "devil@hellskitchen.com",
					"phoneNumber": "6281300001111",
					"role": "Admin"
				},
				...
			]
		}
		```

- **Success Response (Empty Data)**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Tidak ada data pengguna yang ditemukan.",
			"data": []
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /users/{userId}

- **Description**: Retrieves a user details.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: userId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Same User or Admin)
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data pengguna berhasil diambil.",
			"data": <user_object>
		}
		```
	- Example:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data pengguna berhasil diambil.",
			"data": {
				"id": 1,
				"fullName": "John Doe",
				"email": "example@mail.com",
				"phoneNumber": "6281245678912",
				"role": "Buyer"
			}
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (User Not Found)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### POST /users

- **Description**: Creates a user account.
- **Parameters**:
	- **Data params**:
		```
		{
			"fullName": <full_name>,
			"email": <email>,
			"phoneNumber": <phone_number>
			"password": <password>,
			"googleId": <google_id>,
			"role": <role_enum>
		}
		```
		> role is either "Buyer" or "Admin".
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Admin Only)
- **Success Response**:
	- Code: 201
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Pengguna berhasil ditambahkan.",
			"data": <user_object>
		}
		```
	- Example:
		```json
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Pengguna berhasil ditambahkan.",
			"data": {
				"user": {
					"id": 1,
					"fullName": "John Doe",
					"email": "example@mail.com",
					"phoneNumber": "6281234567980",
					"role": "Buyer"
				}
			}
		}
		```

- **Fail Response (Email Already Registered)**:
	- Code: 409
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 409,
			"message": "Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### PATCH /users/{userId}

- **Description**: Edits a user.
- **Parameters**:
	- **Data params**:
		```
		{
			"fullName": <full_name>,
			"email": <email>,
			"phoneNumber": <phone_number>
			"password": <password>,
		}
		```
	- **Path Params**: userId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Same User or Admin)
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data pengguna berhasil diperbarui.",
			"data": <user_object>
		}
		```
	- Example:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data pengguna berhasil diperbarui.",
			"data": {
				"user": {
					"id": 1,
					"fullName": "John Doe Doe John",
					"email": "example@mail.com",
					"phoneNumber": "6281234567980",
					"role": "Buyer"
				}
			}
		}
		```

- **Fail Response (Email Already Registered)**:
	- Code: 409
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 409,
			"message": "Email sudah terdaftar. Silakan gunakan email lain."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### DELETE /users/{userId}

- **Description**: Deletes a user.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: userId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Admin Only)
- **Success Response**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Pengguna berhasil dihapus."
		}
		```

- **Fail Response (User Not Found)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Pengguna tidak ditemukan. Pastikan userId yang Anda masukkan benar."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

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
| airline | Airline name | string | _/schedules?airline=Batik Air_ | Optional
| minPrice | Minimum ticket price. Default value is 0. | number | _/schedule?minPrice=1500000_ | Optional |
| maxPrice | Maximum ticket price. Default value is null (not capped). | number | _/schedule?maxPrice=9000000_ | Optional |
| sort | Sort list of schedules by a category. Value either "price", "-price", "duration", "duration", "dpTime", "-dpTime", "arTime", or "-arTime" (without double-quotes). The list by default is sorted by earliest departure time (dpTime). | string | _/schedule?sort=-dpTime_ | Optional |
| page | Current page number. Each page has at most 10 contents. The value is 1 by default  | number | _/schedule?page=2_ | Optional |
| facility | Filter the facilities of a flight has. Value can be more than one, separated by dot (.). The values are "entertainment", "meal", and/or "wifi". By default the values are all of them. | string | _/schedule?facility=meal.wifi_ | Optional

- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data jadwal penerbangan berhasil diambil.",
			"pagination": <pagination_object>,
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
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data jadwal penerbangan berhasil diambil.",
			"pagination": {
				"currentPage": 1,
				"totalPage": 6,
				"count": 10,
				"total": 51,
				"hasNextPage": true,
				"hasPreviousPage": false
			},
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
								"city": "Jakarta",
								"cityCode": "JKT",
								"airportName": "Soekarno Hatta International Airport",
								"terminalGate": "2A Internasional"
							},
							"arrival": {
								"day": "Senin",
								"dateTime": "2024-11-25T11:00:00.000Z",
								"city": "Melbourne",
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
								"city": "Jakarta",
								"cityCode": "JKT",
								"airportName": "Soekarno Hatta International Airport",
								"terminalGate": "1A"
							},
							"arrival": {
								"day": "Senin",
								"dateTime": "2024-11-25T12:30:00.000Z",
								"city": "Melbourne",
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
						},
						...
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
								"city": "Melbourne",
								"cityCode": "MLB",
								"airportName": "Melbourne International Airport",
								"terminalGate": "2C International"
							},
							"arrival": {
								"day": "Rabu",
								"dateTime": "2024-11-27T09:00:00.000Z",
								"city": "Jakarta",
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
								"city": "Melbourne",
								"cityCode": "MLB",
								"airportName": "Melbourne International Airport",
								"terminalGate": "1D"
							},
							"arrival": {
								"day": "Rabu",
								"dateTime": "2024-11-27T20:30:00.000Z",
								"city": "Jakarta",
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
						...
					]
				}
			}
		}
		```

- **Success Response (Empty Data)**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Tidak ada data jadwal penerbangan yang tersedia",
			"pagination": {
				"currentPage": 1,
				"totalPage": 1,
				"count": 0,
				"total": 0,
				"hasNextPage": false,
				"hasPreviousPage": false
			},
			"data": []
		}
		```

- **Fail Response (Query Params Validation Error)**:
	- Code: 400
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Query parameter tidak valid. Pastikan parameter yang diberikan sesuai dengan format yang benar."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```
 
 ---

### GET /schedules/{scheduleId}

- **Description**: Retrieves a flight schedule details.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: scheduleId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Berhasil mendapatkan data jadwal penerbangan.",
			"data": <schedule_object, seat: <seat_object>>
		}
		```
	- Example:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Berhasil mendapatkan data jadwal penerbangan.",
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
					"city": "Melbourne",
					"cityCode": "MLB",
					"airportName": "Melbourne International Airport",
					"terminalGate": "1D"
				},
				"arrival": {
					"day": "Rabu",
					"dateTime": "2024-11-27T20:30:00.000Z",
					"city": "Jakarta",
					"cityCode": "JKT",
					"airportName": "Soekarno Hatta International Airport"
				},
				"facilities": {
					"baggage": 20,
					"cabinBaggage": 7,
					"entertainment": true,
					"meal": true,
					"wifi": true
				},
				"seat": {
					"available": 50,
					"map": [
						{ "A1": true },
						{ "A2": false },
						{ "A3": true },
						...
					]
				}
			}
		}
		```

- **Fail Response (Schedule Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Jadwal penerbangan tidak ditemukan."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "scheduleId tidak valid. Pastikan scheduleId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

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
	- Authorization: Bearer <jwt_token> (Required, Admin Only)
- **Success Response**:
	- Code: 201
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Berhasil membuat jadwal penerbangan.",
			"data": {
				"scheduleId": <schedule_id>
			}
		}
		```
	-  Example:
		```json
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Berhasil membuat sebuah jadwal penerbangan.",
			"data": {
				"scheduleId": 403
			}
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "seatClass harus memiliki nilai Economy, Premium Economy, Business, atau First Class."
		}
		```

		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Jadwal penerbangan gagal dibuat. Jadwal penerbangan harus berdasarkan penerbangan yang terdaftar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### PATCH /schedules/{scheduleId}

- **Description**: Edits a flight schedule.
- **Parameters**:
	- **Data params**:
		```
		{
			"departureDateTime": <departure_datetime>,
			"arrivalDateTime": <arrival_datetime>,
			"ticketPrice": <ticket_price>,
			"seatAvailability": <available_seat>,
			"seatClass": <seat_class_enum>,
			"terminalGate": <terminal_gate>
		}
		```
		> Please include one or more fields to be updated.
	- **Path Params**: scheduleId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Admin Only)
- **Success Response**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Berhasil memperbarui jadwal penerbangan."
		}
		```

- **Fail Response (Invalid Request Body)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "id atau flightId tidak boleh diperbarui."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "seatClass harus memiliki nilai Economy, Premium Economy, Business, atau First Class."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Schedule Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Jadwal penerbangan tidak ditemukan."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### DELETE /schedules/{scheduleId}

- **Description**: Deletes a flight schedule.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: scheduleId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Admin Only)
- **Success Response**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Berhasil menghapus jadwal penerbangan."
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "scheduleId tidak valid. Pastikan scheduleId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Schedule Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Jadwal penerbangan tidak ditemukan."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /bookings

- **Description**: Retrieves all bookings.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: None
	- **Query Params**:

| Parameter | Description | Type | Example | Option |
| --- | --- | --- | --- | --- |
| userId | User unique identifier. | number | _/bookings?userId=2_ | **Required** |
| bookingCode | Unique code identifier for flight booking ticket. | string | _/bookings?bookingCode=6723y2GHK_ | Optional |
| dpDate | Date of departure/outbound. Date format in YYYY-MM-DD. | date | _/bookings?dpDate=2024-11-25_ | Optional |
| retDate | Date of return/inbound. Date format in YYYY-MM-DD. | date | _/bookings?retDate=2024-11-27_ | Optional |

- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Same User and Admin)
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data riwayat pemesanan berhasil diambil.",
			"pagination": {
				"total": <total_booking>
			},
			"data": {
				"bookings": [
					<booking_object>,
					<booking_object>,
					<booking_object>,
					...
				]
			}
		}
		```
	- Example:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data riwayat pemesanan berhasil diambil",
			"pagination": {
				"total": 100
			},
			"data": {
				"bookings": [
					{
						"bookingId": 123,
						"bookingCode": "6723y2GHK",
						"date": "2024-12-01T18:09:00.000Z",
						"status": "Issued",
						"journeyType": "One-way",
						"itinerary": {
							"outbound": {
								"scheduleId": 403,
								"airlineName": "Garuda Indonesia",
								"seatClass": "Economy",
								"duration": 120,
								"flightNumber": "GIA400",
								"availableSeat": 5,
								"price": 3000000,
								"departure": {
									"day": "Senin",
									"dateTime": "2024-12-02T07:00:00.000Z",
									"city": "Jakarta",
									"cityCode": "JKT",
									"airportName": "Soekarno-Hatta International Airport",
									"terminalGate": "1A Domestik"
								},
								"arrival": {
									"day": "Senin",
									"dateTime": "2024-12-02T09:00:00.000Z",
									"city": "Denpasar",
									"cityCode": "DPS",
									"airportName": "I Gusti Ngurah Rai International Airport"
								},
								"facilities": {
									"baggage": 20,
									"cabinBaggage": 7,
									"entertainment": true,
									"meal": true,
									"wifi": false
								}
							},
							"inbound": null
						},
						"passenger": {
							"total": 3,
							"adult": 1,
							"child": 1,
							"baby": 1,
							"data": [
								{
									"passengerId": 100,
									"label": "P1",
									"title": "Mr",
									"fullName": "Tony Stark",
									"familyName": "Downey",
									"ageGroup": "Adult",
									"seatNumber": {
										"outbound": "A7",
										"inbound": null
									}
								},
								{
									"passengerId": 101,
									"label": "P2",
									"title": "Master",
									"fullName": "Justin",
									"familyName": null,
									"ageGroup": "Child",
									"seatNumber": {
										"outbound": "A8",
										"inbound": null
									}
								},					
							]
						},
						"invoice": {
							"invoiceId": 303,
							"paymentDueDateTime": "2024-12-01T23:59:00.000Z",
							"subtotal": 6000000,
							"taxAmount": 300000,
							"totalAmount": 6300000
						},
						"payment": {
							"paymentId": 541,
							"date": "2024-12-01T21:07:01.033Z",
							"method": "Credit Card"
						}
					},
					...
				]
			}
		}
		```

- **Success Response (Empty Data)**:
	- Code: 200
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data riwayat pemesanan tidak tersedia.",
			"pagination": {
				"total": 0
			},
			"data": {
				"bookings": []
			}
		}
		```

- **Fail Response (Query Params Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "userId tidak valid. Pastikan userId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Booking Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Riwayat pemesanan tidak ditemukan."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /bookings/{bookingId}

- **Description**: Retrieves a booking details.
- **Parameters**:
	- **Data params**: None
	- **Path Params**: bookingId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required, Same User and Admin)
- **Success Response**:
	- Code: 200
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data riwayat pemesanan berhasil diambil.",
			"data": {
				<booking_object>,
			}
		}
		```
	- Example:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data riwayat pemesanan berhasil diambil.",
			"data": {
				"bookingId": 131,
				"bookingCode": "792aB3ASG",
				"date": "2024-12-02T00:21:01.321Z",
				"status": "Unpaid",
				"journeyType": "Round-trip",
				"itinerary": {
					"outbound": {
						"scheduleId": 403,
						"airlineName": "Garuda Indonesia",
						"seatClass": "Economy",
						"duration": 120,
						"flightNumber": "GIA400",
						"availableSeat": 3,
						"price": 3000000,
						"departure": {
							"day": "Senin",
							"dateTime": "2024-12-02T07:00:00.000Z",
							"city": "Jakarta",
							"cityCode": "JKT",
							"airportName": "Soekarno-Hatta International Airport",
							"terminalGate": "1A Domestik"
						},
						"arrival": {
							"day": "Senin",
							"dateTime": "2024-12-02T09:00:00.000Z",
							"city": "Denpasar",
							"cityCode": "DPS",
							"airportName": "I Gusti Ngurah Rai International Airport"
						},
						"facilities": {
							"baggage": 20,
							"cabinBaggage": 7,
							"entertainment": true,
							"meal": true,
							"wifi": false
						}
					},
					"inbound": {
						"scheduleId": 511,
						"airlineName": "Garuda Indonesia",
						"seatClass": "Economy",
						"duration": 120,
						"flightNumber": "GIA499",
						"availableSeat": 70,
						"price": 4000000,
						"departure": {
							"day": "Jumat",
							"dateTime": "2024-12-05T14:00:00.000Z",
							"city": "Denpasar",
							"cityCode": "DPS",
							"airportName": "I Gusti Ngurah Rai International Airport",
							"terminalGate": "1B Domestik"
						},
						"arrival": {
							"day": "Jumat",
							"dateTime": "2024-12-05T16:00:00.000Z",
							"city": "Jakarta",
							"cityCode": "JKT",
							"airportName": "Soekarno-Hatta International Airport"
						},
						"facilities": {
							"baggage": 20,
							"cabinBaggage": 7,
							"entertainment": false,
							"meal": true,
							"wifi": true
						}
					}
				},
				"passenger": {
					"total": 1,
					"adult": 1,
					"child": 0,
					"baby": 0,
					"data": [
						{
							"passengerId": 121,
							"label": "P1",
							"title": "Mr",
							"fullName": "Steve",
							"familyName": "Roger",
							"ageGroup": "Adult",
							"seatNumber": {
								"outbound": "B7",
								"inbound": "A1"
							}
						}				
					]
				},
				"invoice": {
					"invoiceId": 305,
					"paymentDueDateTime": "2024-12-02T06:00:00.000Z",
					"subtotal": 7000000,
					"taxAmount": 150000,
					"totalAmount": 7150000
				},
				"payment": null
			}
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "bookingId tidak valid. Pastikan bookingId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Booking Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Riwayat pemesanan tidak ditemukan."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### POST /bookings

- **Description**: Creates a flight booking.
- **Parameters**:
	- **Data params**:
		```
		{
			"itinerary": {
				"journeyType": <journey_type>,
				"outbound": <schedule_id>,
				"inbound": <schedule_id>
			},
			"passenger": {
				"total": <total_passenger>,
				"adult": <total_adult_passenger>,
				"child": <total_child_passenger>,
				"baby": <total_baby_passenger>,
				"data": [
					{
						"label": <passenger_label>,
						"ageGroup": <age_group_enum>,
						"title": <passenger_title>,
						"fullName": <passenger_full_name>,
						"familyName": <passenger_family_name>,
						"birthDate": <passenger_birth_date>,
						"nationality": <passenger_nationality>,
						"identityNumber": <passenger_identity_number>,
						"issuingCountry": <passenger_passport_issuing_country>,
						"expiryDate": <passenger_passport_expiry_date>
					},
					...
				]
			},
			"seat": {
				"outbound": [
					{
						"label": <passenger_label>,
						"seatNumber": <seat_number>
					},
					...
				],
				"inbound": [
					{
						"label": <passenger_label>,
						"seatNumber": <seat_number>
					},
					...
				]
			}
		}
		```
	- **Path Params**: None
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required)
- **Success Response**:
	- Code: 201
	- Response Body:
		```
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Berhasil membuat pesanan tiket penerbangan. Silahkan selesaikan pembayaran Anda.",
			"data": {
				"bookingId": <booking_id>,
				"bookingCode": <bookingCode>,
				"paymentDueDateTime": <payment_due_datetime>
			}
		}
		```
	-  Example:
		```json
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Berhasil membuat pesanan tiket penerbangan. Silahkan selesaikan pembayaran Anda.",
			"data": {
				"bookingId": 333,
				"bookingCode": "65Tu5EyzA",
				"paymentDueDateTime": "2024-12-14T19:05:00.000Z"
			}
		}
		```

- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "seatNumber tidak valid. Pastikan seatNumber yang Anda masukkan dalam format yang benar."
		}
		```
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Pesanan tiket penerbangan gagal dibuat. Pesanan tiket penerbangan harus berdasarkan jadwal penerbangan yang terdaftar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### POST /bookings/{bookingId}/payments

- **Description**: Creates a payment for a booking.
- **Parameters**:
	- **Data params**:
		```
		{
			"method": <payment_method_enum>,
			"accountNumber": <account_number>,
			"holderName": <holder_name>,
			"CVV": <card_verification_value>,
			"expiryDate": <card_expiry_date>
		}
		```
	- **Path Params**: bookingId (Required)
	- **Query Params**: None
- **Headers**:
	- Content-Type: application/json
	- Authorization: Bearer <jwt_token> (Required)
- **Success Response**:
	- Code: 201
	- Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 201,
			"message": "Berhasil melakukan pembayaran tiket penerbangan."
		}
		```
- **Fail Response (Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "bookingId tidak valid. Pastikan bookingId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Forbidden)**:
	- Code: 403
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 403,
			"message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses endpoint ini."
		}
		```

- **Fail Response (Booking Does Not Exist)**:
	- Code: 404
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Pembayaran tiket penerbangan gagal dibuat. Pembayaran tiket penerbangan harus berdasarkan pesanan tiket penerbangan yang telah dibuat."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /homepage
-   **Description**: Retrieves all homepage data.
-   **Parameters**:
    -   **Data params**: None
    -   **Path Params**: None
    -   **Query Params**:

| Parameter | Description | Type | Example | Option |
| --- | --- | --- | --- | --- |
| continent | Area of continent. Value is either "All", "Asia", "America", "Australia", "Europe", or "Africa". By default the value is "All" | string, continent_enum | _/homepage?continent=Asia_ | **Required** |
| page | Current page number. Each page has at most 5 contents. The value is 1 by default | number | _/homepage?page=2_ | Optional |

-   **Headers**:
    -   Content-Type: application/json
-   **Success Response**:
    -   Code: 200
    -   Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data homepage berhasil diambil.",
			"pagination": <pagination_object>,
			"data": {
				"cards": [
		        	<card_object>,
		        	<card_object>,
		        	<card_object>,
		        	...
	        	]
        	}
		}
		```
       - Example:
			```json
			{
	        	"status": "Success",
	        	"statusCode": 200,
	        	"message": "Data homepage berhasil diambil.",
				"pagination": {
					"currentPage": 2,
					"totalPage": 5,
					"count": 5,
					"total": 25,
					"hasNextPage": true,
					"hasPreviousPage": true
				},
	        	"data": {
			        "cards": [
			        	{
							"departureCity": "Jakarta",
							"arrivalCity": "Bangkok",
							"arrivalCityImageUrl": "http://dummyimage.com/203x100.png",
							"airline": "AirAsia",
							"startDate": "2024-11-20T00:00:00.000Z",
							"endDate": "2024-11-30T00:00:00.000Z",
							"minPrice": 950000
						},
			        	{
							"departureCity": "Jakarta",
							"arrivalCity": "Sydney",
							"arrivalCityImageUrl": "http://dummyimage.com/100x2000.png",
							"airline": "Garuda Indonesia",
							"startDate": "2024-12-01T00:00:00.000Z",
							"endDate": "2024-12-10T00:00:00.000Z",
							"minPrice": 2500000
						},
			        	...
		        	]
	        	}
			}
			```

-   **Success Response (Empty Data)**:
    -   Code: 200
    -   Response Body:
		```json
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Tidak ada data homepage yang tersedia.",
			"data": {
				"cards": []
        	}
		}
		```

- **Fail Response (Query Params Validation Error)**:
	- Code: 400
	- Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example: 
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "continent tidak valid. Pastikan continent yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /auth
-   **Description**: Authenticate user.
-   **Parameters**:
    -   **Data params**: None
    -   **Path Params**: None
    -   **Query Params**: None
-   **Headers**:
    -   Content-Type: application/json
    -  Authorization: Bearer <jwt_token> (Required)
-   **Success Response**:
    -   Code: 200
    -   Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Token valid. Pengguna terautentikasi.",
			"data": {
				<user_object>
        	}
		}
		```
       - Example:
			```json
			{
	        	"status": "Success",
	        	"statusCode": 200,
	        	"message": "Token valid. Pengguna terautentikasi.",
	        	"data": {
			        "id": 1,
			        "fullName": "John Doe",
			        "email": "mail@example.com",
			        "phoneNumber": "6281345337902",
			        "role": "Admin"
	        	}
			}
			```

- **Fail Response (Invalid Token)**:
	- Code: 401
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 401,
			"message": "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /cities
-   **Description**: Retrieves all cities data.
-   **Parameters**:
    -   **Data params**: None
    -   **Path Params**: None
    -   **Query Params**: None
-   **Headers**:
    -  Content-Type: application/json
-   **Success Response**:
    -   Code: 200
    -   Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data kota berhasil diambil.",
			"pagination": {
				total: <total_city>
			},
			"data": [
				<city_object>,
				<city_object>,
				<city_object>,
				...
			]
		}
		```
       - Example:
			```json
			{
	        	"status": "Success",
	        	"statusCode": 200,
	        	"message": "Data kota berhasil diambil.",
				"pagination": {
					"total": 100 
				},
	        	"data": [
					{
						"cityId": 1,
						"name": "Jakarta",
						"code": "JKT",
						"country": "Indonesia",
						"continent": "Asia",
						"imageUrl": "https://dummy.url/image.png"
					},
					...
				]
			}
			```

- **Success Response (Empty Data)**:
    - Code: 200
    - Response Body:
		```json
		{
			"status": "Success",
	        	"statusCode": 200,
	        	"message": "Tidak ada data kota yang tersedia.",
				"pagination": {
					"total": 0
				},
	        	"data": []
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---

### GET /cities/{cityId}
-   **Description**: Retrieves a city details.
-   **Parameters**:
    -   **Data params**: None
    -   **Path Params**: cityId (Required)
    -   **Query Params**: None
-   **Headers**:
    -   Content-Type: application/json
-   **Success Response**:
    -   Code: 200
    -   Response Body:
		```
		{
			"status": "Success",
			"statusCode": 200,
			"message": "Data kota berhasil diambil.",
			"data": <city_object>
		}
		```
       - Example:
			```json
			{
	        	"status": "Success",
	        	"statusCode": 200,
	        	"message": "Data kota berhasil diambil.",
	        	"data": {
					"cityId": 1,
					"name": "Jakarta",
					"code": "JKT",
					"country": "Indonesia",
					"continent": "Asia",
					"imageUrl": "https://dummy.url/image.png"
				}
			}
			```

- **Fail Response (Validation Error)**:
    - Code: 400
    - Response Body:
		```
		{
			"status": "Failed",
			"statusCode": 400,
			"message": <error_message>
		}
		```
	- Example:
		```json
		{
			"status": "Failed",
			"statusCode": 400,
			"message": "Validasi gagal. Pastikan cityId yang Anda masukkan dalam format yang benar."
		}
		```

- **Fail Response (City Not Found)**:
    - Code: 404
    - Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 404,
			"message": "Data kota tidak ditemukan."
		}
		```

- **Fail Response (Server Failure)**:
	- Code: 500
	- Response Body:
		```json
		{
			"status": "Failed",
			"statusCode": 500,
			"message": "Terjadi kesalahan pada server. Silakan coba lagi nanti."
		}
		```

---