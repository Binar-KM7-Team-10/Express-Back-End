const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

let total = 0;
const seedDatabase = async () => {
    const flightSize = await prisma.flight.count();
    for (let i = 1; i <= flightSize; i++) {
        try {
            await prisma.baggage.create({
                data: {
                    flightId: i,
                    maxBaggageWeight: getRandomInt(10, 31),
                    maxCabinBaggageWeight: getRandomInt(7, 11)
                }
            });
            total++;
            console.log(`Seeding Baggage: ${total}/${flightSize}`);
            clearLastLine();
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