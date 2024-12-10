const { PrismaClient } = require('@prisma/client');
const service = require('./seeds/service.json');

const prisma = new PrismaClient();

let total = 0;
const seedDatabase = async () => {
    for (const data of service) {
        try {
            await prisma.service.create({ data });
            total++;
        } catch (err) {
            console.error(err);
        }
    }
};

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of Service`))
    .catch((err) => console.log(`Failed seeding Service\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
