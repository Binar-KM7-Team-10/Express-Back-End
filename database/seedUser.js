const user = require('./seeds/user.json');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
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

    try {
        await prisma.user.createMany({
            data: [
                {
                    email: 'buyer@tiketgo.com',
                    fullName: 'Buyer 1',
                    password: await bcrypt.hash('buyer1234', 10),
                    phoneNumber: '6280000000000',
                    isVerified: true,
                    role: 'Buyer'
                },
                {
                    email: 'admin@tiketgo.com',
                    fullName: 'Admin 1',
                    password: await bcrypt.hash('admin1234', 10),
                    phoneNumber: '6280000000001',
                    isVerified: true,
                    role: 'Admin'
                }
            ]
        });
        
        total += 2;
    } catch (err) {
        console.error(err);
    }
}

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of User`))
    .catch((err) => console.log(`Failed seeding User\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });