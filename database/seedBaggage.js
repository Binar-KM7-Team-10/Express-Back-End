const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const minId = 1;
const maxId = 100;

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

const seedDatabase = async () => {
    for (let i = minId; i <= maxId; i++) {
        try {
            await prisma.baggage.create({
                data: {
                    flightId: i,
                    maxBaggageWeight: getRandomInt(10, 31),
                    maxCabinBaggageWeight: getRandomInt(7, 11)
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding Baggage'))
    .catch((err) => console.log(`Failed seeding Baggage\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });