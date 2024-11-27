const schedule = require('./seeds/schedule.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

let flightId = 1;
const seedDatabase = async () => {
    for (const data of schedule) {
        try {
            const hour = getRandomInt(1, 5);
            const minute = getRandomInt(0, 60);

            const departureDateTime = new Date(data.departureDateTime);
            const arrivalDateTime = new Date(departureDateTime);
            arrivalDateTime.setHours(arrivalDateTime.getHours() + hour);
            arrivalDateTime.setMinutes(arrivalDateTime.getMinutes() + minute);
            const duration = (arrivalDateTime - departureDateTime) / (1000 * 60);

            await prisma.schedule.create({
                data: {
                    ...data,
                    flightId,
                    arrivalDateTime,
                    duration
                }
            });

            flightId++;
            if (flightId === 101) {
                flightId = 1;
            }
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding Schedule'))
    .catch((err) => console.log(`Failed seeding Schedule\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });