const { PrismaClient } = require('@prisma/client');
const airline = require('./seeds/airline.json');

const prisma = new PrismaClient();

const seedDatabase = async () => {
    let total = 0;
    for (const data of airline) {
        try {
            await prisma.airline.create({ data });
            total++;
        } catch (err) {
            console.error(err);
        }
    }

    return total;
};

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of Airline`))
    .catch((err) => console.log(`Failed seeding Airline\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
