const airline = require('./seeds/airline.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of airline) {
        try {
            await prisma.airline.create({ data });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding Airline'))
    .catch((err) => console.log(`Failed seeding Airline\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });