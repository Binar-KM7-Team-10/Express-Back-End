const passenger = require('./seeds/passenger.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of passenger) {
        try {
            await prisma.passenger.create({ data });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding passenger'))
    .catch((err) => console.log(`Failed seeding passenger\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });