const user = require('./seeds/user.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of user) {
        try {
            await prisma.user.create({ data });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding User'))
    .catch((err) => console.log(`Failed seeding User\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });