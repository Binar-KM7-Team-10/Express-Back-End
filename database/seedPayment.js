const payment = require('./seeds/payment.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of payment) {
        try {
            await prisma.payment.create({ data });
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