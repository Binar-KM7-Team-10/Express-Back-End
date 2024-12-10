const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let total = 0;
const seedDatabase = async () => {
    const today = new Date();

    // Generate schedules for 15 rows for each day from today to the next 14 days
    for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
        const currentDay = new Date(today);
        currentDay.setDate(today.getDate() + dayOffset);

        for (let i = 0; i < 15; i++) {
            const flightId = getRandomInt(1, 100);

            const departureDateTime = new Date(currentDay);
            departureDateTime.setHours(getRandomInt(0, 23), getRandomInt(0, 59), 0, 0);

            const arrivalDateTime = new Date(departureDateTime);
            arrivalDateTime.setMinutes(departureDateTime.getMinutes() + getRandomInt(60, 300));

            const duration = Math.round((arrivalDateTime - departureDateTime) / (1000 * 60));
            const ticketPrice = getRandomInt(1000, 9900) * 1000;
            const seatAvailability = 72;

            const seatClass = ['Economy', 'Premium Economy', 'Business', 'First Class'][
                getRandomInt(0, 3)
            ];

            const terminalGate = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C'][
                getRandomInt(0, 8)
            ];

            const data = {
                flightId,
                departureDateTime: departureDateTime.toISOString(),
                arrivalDateTime: arrivalDateTime.toISOString(),
                duration,
                ticketPrice,
                seatAvailability,
                seatClass,
                terminalGate,
            };

            await prisma.schedule.create({ data });
            total++;
        }
    }
};

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of Schedule`))
    .catch((err) => console.log(`Failed seeding Schedule\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
