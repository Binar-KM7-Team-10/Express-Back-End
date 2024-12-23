const airline = require('./seeds/airline.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

const seedDatabase = async () => {
    let total = 0;
    for (const data of airline) {
        try {
            await prisma.airline.create({ data });
            total++;
            console.log(`Seeding Airline: ${total}/${airline.length}`);
            clearLastLine();
        } catch (err) {
            console.error(err);
        }
    }

    return total;
}

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of Airline`))
    .catch((err) => console.log(`Failed seeding Airline\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });