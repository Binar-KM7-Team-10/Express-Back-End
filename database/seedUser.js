const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const user = require('./seeds/user.json');

const prisma = new PrismaClient();

let total = 0;
const seedDatabase = async () => {
    for (const data of user) {
        try {
            await prisma.user.create({ data });
            total++;
        } catch (err) {
            console.error(err);
        }
    }

    // Create an account for admin access
    // email    : admin@tiketku.com
    // password : admin1234
    try {
        const password = await bcrypt.hash('admin1234', 10);
        await prisma.user.create({
            data: {
                email: 'admin@tiketku.com',
                fullName: 'Admin 1',
                password,
                phoneNumber: '6281209981551',
                isVerified: true,
                role: 'Admin',
            },
        });
    } catch (err) {
        console.error(err);
    }
};

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of User`))
    .catch((err) => console.log(`Failed seeding User\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
