const { PrismaClient } = require('@prisma/client');
const city = require('./seeds/city.json');

const prisma = new PrismaClient();

const seedDatabase = async () => {
    let total = 0;
    for (const data of city) {
        try {
            await prisma.city.create({ data });
            total++;
        } catch (err) {
            console.error(err);
        }
    }

    return total;
};

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of City`))
    .catch((err) => console.log(`Failed seeding City\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
