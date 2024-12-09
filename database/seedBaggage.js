const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

let total = 0;
const seedDatabase = async () => {
    const flightNumber = 100;
    for (let i = 1; i <= flightNumber; i++) {
        try {
            await prisma.baggage.create({
                data: {
                    flightId: i,
                    maxBaggageWeight: getRandomInt(10, 31),
                    maxCabinBaggageWeight: getRandomInt(7, 11)
                }
            });
            total++;
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of Baggage`))
    .catch((err) => console.log(`Failed seeding Baggage\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });