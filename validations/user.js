const HttpRequestError = require("../utils/error");
const User = require("../models/auth");

module.exports = {
  register: async ({ fullName, email, password, phoneNumber }) => {
    if (!fullName || !email || !password || phoneNumber) {
      throw new HttpRequestError("Full name, email, and password are required", 400);
    }

    if (typeof fullName !== "string" || typeof email !== "string" || typeof password !== "string" || typeof phoneNumber !== "string") {
      throw new HttpRequestError("Full name, email, and password must be string type", 400);
    }

    if (!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      throw new HttpRequestError("Email must be in valid format", 400);
    }

    if (!phoneNumber.startsWith("62")) {
      throw new HttpRequestError("Phone number must start with 62", 400);
    }

    const isExistedEmail = await User.findByEmail(email);

    if (isExistedEmail) {
      throw new HttpRequestError("Email already registered", 200);
    }
  },
  otp : async ({ otp, email }) => {

    if (!email) {
      throw new HttpRequestError("Email is required", 400);
    }

    if (!email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        throw new HttpRequestError("Email must be in valid format", 400);
      }

    if (!otp) {
      throw new HttpRequestError("OTP is required", 400);
    }

    if (typeof otp !== "string") {
      throw new HttpRequestError("OTP must be string type", 400);
    }

    if (!otp.match(/^[0-9]*$/)) {
      throw new HttpRequestError("OTP must be numeric", 400);
    }

    if (otp.length !== 6) {
      throw new HttpRequestError("OTP must be 6 digits", 400);
    }
  }
};
