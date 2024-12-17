const request = require('supertest');
const app = require('../../app'); 
const user = require('../../validations/user');

describe('User Registration Integration Tests', () => {
  it('should successfully register a new account', async () => {
    const response = await request(app)
      .post('/register')
      .send(
        { 
          email: 'jane.doe1@example.com',
          phoneNumber: '6281234567892',
          fullName: 'Jane Doe',
          password: 'securePassword123',}
      );

    expect(response.status).toBe(201);  
    expect(response.body).toMatchObject({
      status: 'Success',
      statusCode: 201,
      message: 'Registrasi berhasil. Silakan verifikasi akun Anda melalui kode OTP yang telah dikirimkan ke email Anda.',
      data: {
          user: {
            id: response.body.data.user.id,
            email: 'jane.doe1@example.com',
            fullName: 'Jane Doe',
            phoneNumber: '6281234567892'
          }
      }
    });
  });

  it('should fail to register a new account with a registered email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'existing.email@example.com',  // Email yang sudah terdaftar
        phoneNumber: '6281234567891',
        fullName: 'John Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(409);  // Mengharapkan status 400 (Bad Request)
    expect(response.body).toMatchObject({
      status: 'Error',
      message: 'Email sudah terdaftar',  // Pesan error sesuai harapan
    });
  });

  // Test Format Email Tidak Valid
  it('should fail to register a new account with an invalid email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'invalid-email',  // Email yang tidak valid
        phoneNumber: '6281234567891',
        fullName: 'John Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(400);  // Mengharapkan status 400
    expect(response.body).toMatchObject({
      status: 'Failed',
      message: 'Format email tidak valid. Pastikan Anda memasukkan email dengan format yang benar.',
    });
  });

  // Test Nomor Telepon Tidak Valid
  it('should fail to register a new account with an invalid phone number', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe@example.com',
        phoneNumber: '1234567890',  // Nomor telepon yang tidak valid
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(400);  // Mengharapkan status 400
    expect(response.body).toMatchObject({
      status: 'Failed',
      message: 'Nomor telepon tidak valid. Pastikan nomor telepon dimulai dengan "628" dan memiliki panjang 11-15 digit.',
    });
  });

  // Test Password Tidak Valid
  it('should fail to register a new account with an invalid password', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe@example.com',
        phoneNumber: '6281234567891',
        fullName: 'Jane Doe',
        password: '123',  // Password terlalu pendek
      });

    expect(response.status).toBe(400);  // Mengharapkan status 400
    expect(response.body).toMatchObject({
      status: 'Error',
      message: 'Password tidak valid. Pastikan password Anda memiliki panjang minimal 8 karakter.',
    });
  });

  // Test Nomor Telepon Tidak Valid pada Registrasi
  it('should fail to register a new account with an invalid phone number', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe@example.com',
        phoneNumber: '1234567890',  // Nomor telepon tidak valid
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    expect(response.status).toBe(400);  // Mengharapkan status 400
    expect(response.body).toMatchObject({
      status: 'Error',
      message: 'Nomor telepon tidak valid. Pastikan nomor telepon dimulai dengan "628" dan memiliki panjang 11-15 digit.',
    });
  });

  // Test Verifikasi OTP yang Sukses
  it('should successfully verify OTP for user registration', async () => {
    const registerResponse = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe@example.com',
        phoneNumber: '6281234567891',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    const otp = registerResponse.body.data.otp;  // Ambil OTP dari response registrasi

    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe@example.com',
        otp: otp,  // Kirim OTP yang benar
      });

    expect(response.status).toBe(200);  // Mengharapkan status 200
    expect(response.body).toMatchObject({
      status: 'Success',
      message: 'OTP berhasil diverifikasi',
    });
  });

  // Test Verifikasi OTP yang Gagal karena Email Tidak Terdaftar
  it('should fail to verify OTP with unregistered email', async () => {
    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'not.registered@example.com',  // Email yang tidak terdaftar
        otp: '123456',
      });

    expect(response.status).toBe(400);  // Mengharapkan status 400
    expect(response.body).toMatchObject({
      status: 'Failed',
      message: 'Email tidak terdaftar',
    });
  });

  // Test OTP yang Expired
  it('should fail to verify OTP with expired OTP', async () => {
    const registerResponse = await request(app)
      .post('/register')
      .send({
        email: 'jane.doe@example.com',
        phoneNumber: '6281234567891',
        fullName: 'Jane Doe',
        password: 'securePassword123',
      });

    const otp = registerResponse.body.data.otp;  // Ambil OTP dari response

    // Simulasi OTP kadaluarsa (delay waktu)
    await new Promise(resolve => setTimeout(resolve, 60000));  // Tunggu 1 menit untuk kadaluarsa

    const response = await request(app)
      .post('/register/otp')
      .send({
        email: 'jane.doe@example.com',
        otp: otp,
      });

    expect(response.status).toBe(400);  // Mengharapkan status 400
    expect(response.body).toMatchObject({
      status: 'Failed',
      message: 'OTP telah kadaluarsa',
    });
  });

  // Test Pengiriman Ulang OTP
  it('should successfully resend OTP for user registration', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({
        email: 'jane.doe@example.com',  // Email yang terdaftar
      });

    expect(response.status).toBe(200);  // Mengharapkan status 200
    expect(response.body).toMatchObject({
      status: 'Success',
      message: 'Kode OTP berhasil dikirim ulang',
    });
  });

  // Test Pengiriman Ulang OTP untuk Email yang Tidak Terdaftar
  it('should fail to resend OTP for unregistered email', async () => {
    const response = await request(app)
      .post('/register/otp/resend')
      .send({
        email: 'not.registered@example.com',  // Email yang tidak terdaftar
      });

    expect(response.status).toBe(400);  // Mengharapkan status 400
    expect(response.body).toMatchObject({
      status: 'Failed',
      message: 'Email tidak terdaftar',
    });
  });

});