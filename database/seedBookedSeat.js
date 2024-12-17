const bookedSeat = require('./seeds/bookedSeat.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of bookedSeat) {
        try {
            await prisma.bookedSeat.create({ data });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding bookedSeat'))
    .catch((err) => console.log(`Failed seeding bookedSeat\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
});