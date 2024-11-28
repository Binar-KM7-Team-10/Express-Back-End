const airport = require('./seeds/airport.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of airport) {
        try {
            await prisma.airport.create({ data });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding Airport'))
    .catch((err) => console.log(`Failed seeding Airport\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });