const service = require('./seeds/service.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

const seedDatabase = async () => {
    let total = 0;
    for (const data of service) {
        try {
            await prisma.service.create({ data });
            total++;
            console.log(`Seeding Service: ${total}/${service.length}`);
            clearLastLine();
        } catch (err) {
            console.error(err);
        }
    }
    return total;
}

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of Service`))
    .catch((err) => console.log(`Failed seeding Service\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });