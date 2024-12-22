const airport = require('./seeds/airport.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

const seedDatabase = async () => {
    let total = 0;
    for (const data of airport) {
        try {
            await prisma.airport.create({ data });
            total++;
            console.log(`Seeding Airport: ${total}/${airport.length}`);
            clearLastLine();
        } catch (err) {
            console.error(err);
        }
    }

    return total;
}

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of Airport`))
    .catch((err) => console.log(`Failed seeding Airport\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });