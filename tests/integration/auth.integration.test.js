const request = require('supertest');
const { app, server } = require('../../app');
const jwt = require('jsonwebtoken');
const {generateTOTP, generateSecret } = require ('../../utils/totp')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {generateToken} = require('../../utils/jwtHelper');
const user = require('../../validations/user');

const resetDatabase = async () => {
  const tables = ["User"];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
  }
};

describe('User Registration Integration Tests', () => {
  beforeEach(async () => {
    await resetDatabase()
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await resetDatabase()
    await prisma.$disconnect();
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
          email: data.email,
          phoneNumber: data.phoneNumber,
        },
      },
    });
  });

  it('should fail to register a new account with a registered email', async () => {
    const email = 'jane.doe7@example.com';

    await prisma.user.create({
      data: {
        fullName: 'Existing User',
        email,
        phoneNumber: '6281234567221',
        password: 'somePassword123',
        isVerified: true,
      },
    });

    const response = await request(app)
      .post('/register')
      .send({
        email,
        phoneNumber: '6281234567861',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 409,
      message: 'Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.',
    });
  });

  it('should fail to register a new account with a registered phone number', async () => {
    const phoneNumber = '6281234567870';

    await prisma.user.create({
      data: {
        fullName: 'Existing User',
        email: 'existing.email@example.com',
        phoneNumber,
        password: 'somePassword123',
        isVerified: true,
      },
    });

    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe56@example.com',
        phoneNumber,
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 409,
      message: 'Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain.',
    });
  });

  it('should fail to register a new account with an invalid email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe7example.com', // Invalid format
        phoneNumber: '6281234567871',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.',
    });
  });

  it('should fail to register a new account with an invalid phone number', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe11@example.com',
        phoneNumber: '081234567890', // Invalid phone number
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.",
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

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Validasi gagal. Pastikan email, phoneNumber, fullName, dan password telah diisi.',
    });
  });

  it('should fail to register a new account with an invalid password', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe777@example.com',
        phoneNumber: '6281234567800',
        fullName: 'Jane Doe',
        password: 'pass', // Too short
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Validasi gagal. password harus memiliki 8 hingga 70 digit.',
    });
  });
  
  it('should fail to register a new account with an invalid phoneNumber', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe777@example.com',
        phoneNumber: '02812345',
        fullName: 'Jane Doe',
        password: 'pass', // Too short
      });

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal. Nomor telepon harus dimulai dengan '628' dan memiliki panjang 11-15 digit.",
    });
  });
});

describe('OTP Verification Integration Tests', () => {
  let testUser;
  let secret;

  beforeAll(async () => {
    await resetDatabase()
    secret = generateSecret();
    testUser = await prisma.user.create({
      data: {
        email: 'test.user@example.com',
        phoneNumber: '6281234567890',
        fullName: 'Test User',
        otpSecret: secret,
        isVerified: false,
      },
    });
  });

  afterAll(async () => {
    await resetDatabase()
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    server.close();
  });

  it('should successfully verify OTP for user registration', async () => {
    const otp = generateTOTP(secret); // Generate OTP dengan secret yang sama

    const response = await request(app)
      .post('/register/otp')
      .send({
        email: testUser.email, // Gunakan email dari testUser
        otp: otp,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 201,
      message: 'Verifikasi OTP berhasil. Akun Anda sekarang aktif dan dapat digunakan.',
    });

    const updatedUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    expect(updatedUser.isVerified).toBe(true);
  });

  it('should fail to verify OTP with wrong OTP', async () => {
    const newUser = await prisma.user.create({
      data: {
        email: 'wrong.otp@example.com',
        phoneNumber: '6281111111111',
        fullName: 'Wrong OTP User',
        otpSecret: generateSecret(),
        isVerified: false,
      },
    });
  
    const wrongOtp = '111111'; // OTP yang salah
  
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: newUser.email, // Gunakan email baru
        otp: wrongOtp,
      });
  
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Verifikasi OTP gagal. Pastikan kode OTP yang dimasukkan benar dan belum kedaluwarsa.',
    });
  });

  it('should fail to verify OTP without required field', async () => {
    const newUser = await prisma.user.create({
      data: {
        email: '',
        phoneNumber: '',
        fullName: '',
        otpSecret: generateSecret(),
        isVerified: false,
      },
    });
  
    const wrongOtp = '111111'; // OTP yang salah
  
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: newUser.email, // Gunakan email baru
        otp: wrongOtp,
      });
  
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal. Pastikan email dan otp telah diisi."
    });
  });

  it('should fail to verify OTP with expired OTP', async () => {
  // Simulasikan pengguna dengan OTP yang valid
  const expiredSecret = generateSecret();

  // Buat pengguna tanpa mengatur OTP untuk menghindari validasi backend yang salah
  const expiredUser = await prisma.user.create({
    data: {
      email: 'expired.otp@example.com',
      phoneNumber: '6289999999999',
      fullName: 'Expired OTP User',
      otpSecret: expiredSecret,
      isVerified: false,
    },
  });

  // Gunakan OTP yang tidak valid (bukan hasil generateTOTP dari secret)
  const expiredOtp = '123456'; // OTP tidak valid

  const response = await request(app)
    .post('/register/otp')
    .send({
      email: expiredUser.email,
      otp: expiredOtp,
    });

  expect(response.status).toBe(400); // Harapkan respons gagal
  expect(response.body).toMatchObject({
    status: 'Failed',
    statusCode: 400,
    message: 'Verifikasi OTP gagal. Pastikan kode OTP yang dimasukkan benar dan belum kedaluwarsa.',
  });
});

  it('should fail to verify OTP with invalid email format', async () => {
    const invalidEmail = 'invalid-email';

    const response = await request(app)
      .post('/register/otp')
      .send({
        email: invalidEmail,
        otp: '123456',
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.',
    });
  });

  it('should fail to verify OTP with missing email field', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({ otp: '123456' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Validasi gagal. Pastikan email dan otp telah diisi.',
    });
  });

  it('should fail to verify OTP with unregistered email', async () => {
    const unregisteredEmail = 'unregistered.user@example.com'; // Email yang tidak ada di database
    const otp = '123456'; // OTP acak untuk pengujian
  
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: unregisteredEmail,
        otp: otp,
      });

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Email tidak terdaftar. Silahkan melakukan registrasi akun terlebih dahulu.',
    });
  });

  it('should fail with registered and verified email', async () => {
    const otp = generateTOTP(secret); // Generate OTP dengan secret yang sama
  
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: testUser.email, // Gunakan email dari testUser
        otp: otp,
      });
    expect(response.status).toBe(400); // Conflict karena email sudah diverifikasi
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Email sudah terdaftar. Silahkan login menggunakan email ini atau registrasi akun baru menggunakan email lain.",
    });
  });
  
  it('should fail with invalid otp type', async () => {
    const otp = 'abcdef'; // Generate OTP dengan secret yang sama
  
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: testUser.email, // Gunakan email dari testUser
        otp: otp,
      });
    expect(response.status).toBe(400); // Conflict karena email sudah diverifikasi
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal. OTP harus berisikan angka.",
    });
  });
  
  it('should fail with invalid otp length', async () => {
    const otp = '12345678999'; // Generate OTP dengan secret yang sama
  
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: testUser.email, // Gunakan email dari testUser
        otp: otp,
      });
    expect(response.status).toBe(400); // Conflict karena email sudah diverifikasi
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal, OTP harus berisikan 6 digit angka.",
    });
  });
});
  

describe('Resend OTP Integration Tests', () => {
  let user;

  beforeEach(async () => {
    await resetDatabase()
    await prisma.user.deleteMany({});

    // Membuat user yang belum terverifikasi untuk pengujian
    user = await prisma.user.create({
      data: {
        email: 'test.user@example.com',
        phoneNumber: '6281234567890',
        fullName: 'Test User',
        otpSecret: generateSecret(),
        isVerified: false,
      },
    });
  });

  afterAll(async () => {
    await resetDatabase()
    await prisma.$disconnect();
    server.close();
  });

  it('should successfully resend OTP for an unverified user', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 200,
      message: 'Kode OTP telah berhasil dikirim ulang. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.',
    });
  });

  it('should fail to resend OTP if user is already verified', async () => {
    // Tandai pengguna sebagai terverifikasi
    await prisma.user.update({
      where: { email: user.email },
      data: { isVerified: true },
    });

    const response = await request(app)
      .post('/register/otp/resend')
      .send({ email: user.email });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 409,
      message: 'Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.',
    });
  });

  it('should fail to resend OTP with unregistered email', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({ email: 'unregistered@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Email tidak terdaftar. Silahkan melakukan registrasi akun terlebih dahulu.',
    });
  });

  it('should fail to resend OTP with invalid email format', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({ email: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.',
    });
  });

  it('should fail to resend OTP when email field is missing', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Validasi gagal. Pastikan email telah diisi.',
    });
  });
});

describe('Login Integration Tests', () => {
  let regularUser;
  let adminUser;

  beforeEach(async () => {
    await resetDatabase()
    await prisma.user.deleteMany();
    const bcrypt = require('bcrypt');

    // Hash password sebelum menyimpan ke database
    const hashedPassword = await bcrypt.hash('password', 10);
    
    regularUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: hashedPassword,
        fullName: 'Regular User',
        phoneNumber: '6281234567890',
        role: 'Buyer',
      },
    });
    
    
    // Membuat pengguna admin untuk pengujian login sebagai admin
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'Admin User',
        phoneNumber: '6289876543210',
        role: 'Admin',
      },
    });
  });

  afterAll(async () => {
    await resetDatabase()
    await prisma.$disconnect();
    server.close();
  });

  it('should successfully login as a regular user', async () => {
    const data = {
      email: regularUser.email,
      password: 'password', // Anggap password hashing dan validasi diterapkan dalam implementasi login
    };

    const response = await request(app).post('/login').send(data);

    
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 200,
      message: 'Login berhasil.',
      data: {
        user: {
          id: regularUser.id,
          fullName: regularUser.fullName,
          email: regularUser.email,
          phoneNumber: regularUser.phoneNumber,
        },
      },
    });

    // Pastikan token dikembalikan dalam respons
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('should successfully login as an admin', async () => {
    const data = {
      email: adminUser.email,
      password: 'password',
    };

    const response = await request(app).post('/login').send(data);

    
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 200,
      message: 'Login berhasil.',
      data: {
        user: {
          id: adminUser.id,
          fullName: adminUser.fullName,
          email: adminUser.email,
          phoneNumber: adminUser.phoneNumber,
          role: adminUser.role,
        },
      },
    });

    // Pastikan token dikembalikan dalam respons
    expect(response.body.data.accessToken).toBeDefined();
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
  it('should fail login without required fields)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email:  'affudina663@gmail.com',
      });

    expect(response.status).toBe(400);  
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: "Validasi gagal. Pastikan email dan password telah diisi."
    });
  });
});


describe('Forget Integration Tests', () => {
let user;

beforeEach(async () => {
  await resetDatabase()
  await prisma.user.deleteMany({});

  // Tambahkan dummy user
  user = await prisma.user.create({
    data: {
      email: 'affudina663@gmail.com',
      password: 'securePassword123', // Bisa dihash jika perlu
      fullName: 'Affu Dina',
      phoneNumber: '6281234567890',
      isVerified: true,
    },
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
});

describe('Reset Password Integration Tests', () => {
  let testUser;
  let passwordResetToken;

  beforeAll(async () => {
    await resetDatabase()
    passwordResetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');

    // Buat user dengan token reset password
    testUser = await prisma.user.create({
      data: {
        email: 'test.reset@example.com',
        phoneNumber: `62812${Math.floor(Math.random() * 100000000)}`,
        fullName: 'Test Reset User',
        password: await bcrypt.hash('oldPassword123', 10),
        passwordResetToken: hashedToken,
        passwordResetTokenExpirationTime: new Date(Date.now() + 10 * 60 * 1000), // Token valid selama 10 menit
      },
    });
  });

  afterAll(async () => {
    await resetDatabase()
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    server.close();
  });

  it('should successfully reset the password', async () => {
    const data = {
      passwordResetToken,
      newPassword: 'newSecurePassword123',
      confirmNewPassword: 'newSecurePassword123',
    };

    const response = await request(app).post('/reset-password').send(data);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 200,
      message: 'Reset password berhasil!',
    });

    // Verifikasi bahwa password user telah diperbarui
    const updatedUser = await prisma.user.findUnique({ where: { email: testUser.email } });
    const isPasswordMatch = await bcrypt.compare(data.newPassword, updatedUser.password);

    expect(isPasswordMatch).toBe(true);
    expect(updatedUser.passwordResetToken).toBeNull();
    expect(updatedUser.passwordResetTokenExpirationTime).toBeNull();
  });

  it('should fail reset-password without required field', async () => {
    const data = {
      newPassword: 'newpasswordlah',
      confirmNewPassword: 'newpasswordlah',
    };

    const response = await request(app).post('/reset-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Validasi gagal. Pastikan passwordResetToken, newPassword, dan confirmNewPassword telah diisi.',
    });
  });

  it('should fail reset-password with invalid field type', async () => {
    const data = {
      passwordResetToken: 123,
      newPassword: 'newpasswordlah',
      confirmNewPassword: 'newpasswordlah',
    };

    const response = await request(app).post('/reset-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Validasi gagal. passwordResetToken, newPassword, dan confirmNewPassword harus berupa string.',
    });
  });

  it('should fail reset-password with invalid password length', async () => {
    const data = {
      passwordResetToken: '8a46b0b6dfe8e9bf68d3d29554a2191f12bf57180ff92ea8abd5ac7877e364d5',
      newPassword: 'satudua',
      confirmNewPassword: 'satudua',
    };

    const response = await request(app).post('/reset-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Password tidak valid. Pastikan password memiliki antara 8 hingga 70 karakter.',
    });
  });

  it('should fail reset-password with mismatched new and confirm passwords', async () => {
    const data = {
      passwordResetToken: '8a46b0b6dfe8e9bf68d3d29554a2191f12bf57180ff92ea8abd5ac7877e364d5',
      newPassword: 'newpasswordlah1',
      confirmNewPassword: 'newpasswordlah',
    };

    const response = await request(app).post('/reset-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Validasi gagal. Pastikan newPassword dan confirmNewPassword sama.',
    });
  });

  it('should fail reset-password with expired token', async () => {
    const data = {
      passwordResetToken: '8a46b0b6dfe8e9bf68d3d29554a2191f12bf57180ff92ea8abd5ac7877e364d5',
      newPassword: 'newpasswordlah',
      confirmNewPassword: 'newpasswordlah',
    };

    const response = await request(app).post('/reset-password').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 400,
      message: 'Token reset password tidak valid atau telah kedaluwarsa. Silakan lakukan permintaan reset password kembali.',
    });
  });
});


describe('Integration Test: User Logout', () => {
  let validToken, expiredToken;

  beforeAll(async () => {
    await resetDatabase()
    validToken = generateToken({ userId: 1, role: 'Buyer' }, '7d');

    // Token kedaluwarsa dalam waktu singkat
    expiredToken = generateToken({ userId: 1 }, '1ms');
  });
  
  afterAll(async () => {
    await resetDatabase()
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    server.close();
  });


  test('[Success] User logout successfully', async () => {
    const response = await request(app)
      .get('/logout') // Endpoint logout
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 200,
      message: 'Logout berhasil. Anda telah keluar dari akun Anda.',
      data: {
        accessToken: expect.any(String), // Token baru dengan durasi singkat
      },
    });
  });

  test('[Failed] User logout without token', async () => {
    const response = await request(app).get('/logout');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.',
    });
  });

  test('[Failed] User logout with expired token', async () => {
    const response = await request(app)
      .get('/logout')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.',
    });
  });

  test('[Failed] User logout with invalid token', async () => {
    const response = await request(app)
      .get('/logout')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.',
    });
  });
});

describe('GET /auth', () => {
  let validToken;
  let invalidToken = 'Bearer invalidtoken';

  beforeAll(async () => {
    await resetDatabase()
    const user = await prisma.user.create({
      data: {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword', 
        phoneNumber: '1234567890',
        isVerified: true,
        otpSecret: 'dummysecret',
      },
    });
    validToken = `Bearer ${generateToken({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    })}`;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    await prisma.$disconnect();
    await resetDatabase()
  });

  it('[Success] Retrieves authentication data', async () => {
    const response = await request(app)
      .get('/auth')
      .set('Authorization', validToken);
  
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
  
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 200,
      message: 'Token valid. Pengguna terautentikasi.',
      data: {
        id: expect.any(Number), 
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        role: 'Buyer', 
      },
    });
  });
  
  it('[Failed] Retrieves authentication data (without authorization header)', async () => {
    const response = await request(app).get('/auth');

    
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message:"Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru.",
    });
  });

  it('[Failed] Retrieves authentication data (with invalid token)', async () => {
    const response = await request(app)
      .get('/auth')
      .set('Authorization', invalidToken);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 'Failed',
      statusCode: 401,
      message: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali untuk mendapatkan token baru',
    });
  });
});

