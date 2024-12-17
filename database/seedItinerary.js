const itinerary = require('./seeds/itinerary.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of itinerary) {
        try {
            await prisma.itinerary.create({ data });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding itinerary'))
    .catch((err) => console.log(`Failed seeding Itinerary\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });