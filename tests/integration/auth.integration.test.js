const request = require('supertest');
const { app, server } = require('../../app');
const jwt = require('jsonwebtoken');

describe('User Registration Integration Tests', () => {
    afterAll(() => {
        server.close();
    });

    it('should successfully register a new account', async () => {
        const data = {
            fullName: 'Jane Doe',
            email: 'dinajaya126@gmail.com',
            password: 'securePassword123',
            phoneNumber: '6281234567888',
        };

        const response = await request(app).post('/register').send(data);

        
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            status: 'Success',
            statusCode: 201,
            message:
                'Registrasi berhasil. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.',
            data: {
                user: {
                    id: response.body.data.user.id,
                    email: 'dinajaya126@gmail.com',
                    phoneNumber: '6281234567888',
                },
            },
        });
    });
});

  it('should fail to register a new account with a registered email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe7@example.com',
        phoneNumber: '6281234567861',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(409);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 409,
      message: "Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut."
    });
  });

  it('should fail to register a new account with a registered phone number', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe56@example.com',
        phoneNumber: '6281234567870',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(409);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 409,
      message: "Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain."
    });
  });

  it('should fail to register a new account with an invalid email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe7example.com',
        phoneNumber: '6281234567871',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
    });
  });

  it('should fail to register a new account with an invalid phone number', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe11@example.com',
        phoneNumber: '081234567890', 
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit."
    });
  });

  
  it('should fail to register a new account with incomplete field', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        phoneNumber: '6281234567871',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Validasi gagal. Pastikan email, phoneNumber, fullName, dan password telah diisi."
    });
  });


  it('should fail to register a new account with an invalid password', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe777@example.com',
        phoneNumber: '6281234567800',
        fullName: 'Jane Doe',
        password: 'pass',
      });

    expect(response.status).toBe(400); 
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Validasi gagal. password harus memiliki 8 hingga 70 digit."
    });
  });

  it('should successfully verify OTP for user registration', async () => {
    const response = await request(app)
    .post('/register/otp')
    .send({
      email: 'dinajaya126@gmail.com',
      otp: '494684',
    });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

  expect(response.status).toBe(201); 
  expect(response.body).toMatchObject({
    status: "Success",
    message: "Verifikasi OTP berhasil. Akun Anda sekarang aktif dan dapat digunakan.",
    statusCode: 201,
    data: {
      user: {
          id: response.body.data.user.id,
          email: 'dinajaya126@gmail.com',
          phoneNumber: '6281234567888',
      },
      // accessToken
  },
  });
});

  it('should fail to verify OTP with required field', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        otp: '123456'
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Validasi gagal. Pastikan email dan otp telah diisi."
    });
  });

  // Test Verifikasi OTP yang Gagal karena Email Tidak Terdaftar
  it('should fail to verify OTP with unregistered email', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'not.registered@example.com',  
        otp: '123456',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Email tidak terdaftar. Silahkan melakukan registrasi akun terlebih dahulu."
    });
  });

  it('should fail to verify OTP with registered and verified email', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe444@example.com',  
        otp: '232410',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Email sudah terdaftar. Silahkan login menggunakan email ini atau registrasi akun baru menggunakan email lain."
    });
  });

  it('should fail to verify OTP with invalid email', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe444example.com',  
        otp: '232410',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
    });
  });

  it('should fail to verify OTP with invalid otp type', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe445@example.com',  
        otp: 232410,
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Validasi gagal. OTP harus berupa string."
    });
  });

  it('should fail to verify OTP with invalid otp number', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe444@example.com',  
        otp: '23241A',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Validasi gagal. OTP harus berisikan angka."
    });
  });

  it('should fail to verify OTP with invalid otp length', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe444@example.com',  
        otp: '232411111111',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message: "Validasi gagal, OTP harus berisikan 6 digit angka."
    });
  });

  it('should fail to verify OTP with wrong otp', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe0@example.com',  
        otp: '111111',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message:  "Verifikasi OTP gagal. Pastikan kode OTP yang dimasukkan benar dan belum kedaluwarsa."
    });
  });

  it('should fail to verify OTP with expired otp', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe0@example.com',  
        otp: '410876',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: "Failed",
      statusCode: 400,
      message:  "Verifikasi OTP gagal. Pastikan kode OTP yang dimasukkan benar dan belum kedaluwarsa."
    });
  });
  
  
  // Test Pengiriman Ulang OTP
  it('should successfully resend OTP for user registration', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({
        email: 'dinajaya126@gmail.com'
      });

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

    expect(response.status).toBe(200);  
    expect(response.body).toMatchObject({
      status: 'Success',
      message:  "Kode OTP telah berhasil dikirim ulang. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.",
    });
  });

  it('should fail to resend OTPwith already confirmed & registered user email', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({
        email: 'jane.doe444@example.com',  
      });

    expect(response.status).toBe(409);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 409,
      message: "Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.",
    });
  });

  it('should fail to resend OTP with invalid email', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({
        email: 'jane.doe444example.com',  
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
    });
  });

  it('should fail to resend OTP without required field)', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({
             "differentField": "Not"
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal. Pastikan email telah diisi."
    });
  });

  it('should fail to resend OTP with unregistered email)', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({
        email: 'jane.doe69@example.com',  
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Email tidak terdaftar. Silahkan melakukan registrasi akun terlebih dahulu."
    });
  });

  it('should successfully login', async () => {
    const data = {
      email:  'affudina663@gmail.com',
      password: 'password',
    };

    const response = await request(app).post('/login').send(data);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
        status: 'Success',
        statusCode: 200,
        message:'Login berhasil.',
        data: {
            user: {
                id: response.body.data.user.id,
                fullName: "John Doe",
                email: 'affudina663@gmail.com',
                phoneNumber: '62813424422555',
        },
        // accestoken
      },
    });
  });


  it('should successfully login as an admin', async () => {
    const data = {
      email:  'affudina663@gmail.com',
      password: 'password',
    };

    const response = await request(app).post('/login').send(data);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
        status: 'Success',
        statusCode: 200,
        message:'Login berhasil.',
        data: {
            user: {
                id: response.body.data.user.id,
                fullName: "John Doe",
                email: 'affudina663@gmail.com',
                phoneNumber: '62813424422555',
                role: "Buyer"
        },
        // accestoken
      },
    });
  });


  it('should fail login with wrong password)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email:  'affudina663@gmail.com',
        password: 'wrongpass',
      });

    expect(response.status).toBe(401);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: "Email atau kata sandi yang Anda masukkan salah."
    });
  });


  it('should fail login with unregistered email)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email:  'affudina6633@gmail.com',
        password: 'password',
      });

    expect(response.status).toBe(401);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: "Email atau kata sandi yang Anda masukkan salah."
    });
  });

  
  it('should fail login with invalid email)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email:  'affudina663gmail.com',
        password: 'password',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
    });
  });


  it('should fail login with invalid password)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email:  'affudina663@gmail.com',
        password: 'pass',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal. password harus memiliki 8 hingga 70 digit."
    });
  });



  it('should successfully forget-password', async () => {
    const data = {
      email:  'affudina663@gmail.com'
    };

    const response = await request(app).post('/forgot-password').send(data);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
        status: 'Success',
        statusCode: 200,
        message:"Tautan reset password berhasil dikirim. Silahkan cek email Anda."
    });
  });

  it('should failed forget-password without email', async () => {
    const data = {
      // email:  'affudina663@gmail.com'
    };

    const response = await request(app).post('/forgot-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
        status: 'Failed',
        statusCode: 400,
        message:"Validasi gagal. Pastikan email telah diisi."
    });
  });

  it('should failed forget-password with invalid email', async () => {
    const data = {
      email:  'affudina663gmail.com'
    };

    const response = await request(app).post('/forgot-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
        status: 'Failed',
        statusCode: 400,
        message:"Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar."
    });
  });

  it('should failed forget-password with unregistered email', async () => {
    const data = {
      email:  'affudina6633@gmail.com'
    };

    const response = await request(app).post('/forgot-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
        status: 'Failed',
        statusCode: 400,
        message:"Email tidak terdaftar. Pastikan email yang Anda masukkan benar."
    });
  });

  it('should successfully reset-password', async () => {
    const data = {
      passwordResetToken: "53627ba62a175464a0651e716213f7e32f9de5e6785ffd563856995623c1526e",
      newPassword: "newpasswordlah",
      confirmNewPassword: "newpasswordlah"
    };

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    const response = await request(app).post('/reset-password').send(data);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
        status: 'Success',
        statusCode: 200,
        message:"Reset password berhasil!",
    });
});

it('should failed reset-password without required field', async () => {
  const data = {
      newPassword: "newpasswordlah",
      confirmNewPassword: "newpasswordlah",
  };

  const response = await request(app).post('/reset-password').send(data);
  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({
        status: 'Failed',
        statusCode: 400,
        message: "Validasi gagal. Pastikan passwordResetToken, newPassword, dan confirmNewPassword telah diisi."
    });
  });

  it('should failed reset-password with invalid field type', async () => {
    const data = {
        passwordResetToken: 123 ,
        newPassword: "newpasswordlah",
        confirmNewPassword: "newpasswordlah",
    };
  
    const response = await request(app).post('/reset-password').send(data);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
          status: 'Failed',
          statusCode: 400,
          message: "Validasi gagal. passwordResetToken, newPassword, dan confirmNewPassword harus berupa string."
      });
    });

    it('should failed reset-password with invalid password length', async () => {
      const data = {
          passwordResetToken: "8a46b0b6dfe8e9bf68d3d29554a2191f12bf57180ff92ea8abd5ac7877e364d5",
          newPassword: "satudua",
          confirmNewPassword: "satudua",
      };
    
      const response = await request(app).post('/reset-password').send(data);
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
            status: 'Failed',
            statusCode: 400,
            message: "Password tidak valid. Pastikan password memiliki antara 8 hingga 70 karakter."
        });
      });

      it('should failed reset-password with different new password and confirm new password', async () => {
        const data = {
            passwordResetToken: "8a46b0b6dfe8e9bf68d3d29554a2191f12bf57180ff92ea8abd5ac7877e364d5",
            newPassword: "newpasswordlah1",
            confirmNewPassword: "newpasswordlah",
        };
      
        const response = await request(app).post('/reset-password').send(data);
        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
              status: 'Failed',
              statusCode: 400,
              message: "Validasi gagal. Pastikan newPassword dan confirmNewPassword sama."
          });
        });

        it('should failed reset-password with expired token', async () => {
          const data = {
              passwordResetToken: "8a46b0b6dfe8e9bf68d3d29554a2191f12bf57180ff92ea8abd5ac7877e364d5",
              newPassword: "newpasswordlah",
              confirmNewPassword: "newpasswordlah",
          };
        
          const response = await request(app).post('/reset-password').send(data);
          expect(response.status).toBe(400);
          expect(response.body).toMatchObject({
                status: 'Failed',
                statusCode: 400,
                message:"Token reset password tidak valid atau telah kedaluwarsa. Silakan lakukan permintaan reset password kembali."
            });
          });

          const generateToken = (payload, expiresIn = '7d') => {
            return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
          };


describe('Integration Test: User Logout', () => {
  let validToken, expiredToken;

  beforeAll(() => {
    validToken = generateToken({ userId: 1 }, '7d');

    expiredToken = generateToken({ userId: 1 }, '1ms'); 
  });

  test('[Success] User logout successfully', async () => {
    const response = await request(app)
        .get('/logout')
        .set('Authorization', `Bearer ${validToken}`);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
        status: 'Success',
        statusCode: 200,
        message: 'Logout berhasil. Anda telah keluar dari akun Anda.',
        data: {
            accessToken: expect.any(String),
        },
    });
});

  test('[Failed] User logout failed (without token)', async () => {
    const response = await request(app).get('/logout');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.",
    });
  });

  test('[Failed] User logout failed (expired token)', async () => {
    const response = await request(app)
      .get('/logout')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.",
    });
  });

  test('[Failed] User logout failed (invalid token)', async () => {
    const response = await request(app)
      .get('/logout')
      .set('Authorization', 'Bearer invalid.token.here');
    
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: "Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.",
    });
  });
});