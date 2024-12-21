const city = require('./seeds/city.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

const seedDatabase = async () => {
    let total = 0;
    for (const data of city) {
        try {
            await prisma.city.create({
                data: {
                    ...data,
                    imageUrl: `https://ik.imagekit.io/itsbibbb/TiketGo/${data.name}.jpg`
                }
            });
            total++;
            console.log(`Seeding City: ${total}/${city.length}`);
            clearLastLine();
        } catch (err) {
            console.error(err);
        }
    }

    return total;
}

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of City`))
    .catch((err) => console.log(`Failed seeding City\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });