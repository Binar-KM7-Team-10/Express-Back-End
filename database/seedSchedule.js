const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let total = 0;
const seedDatabase = async () => {
    try {
        const flightSize = await prisma.flight.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= flightSize; i++) { // For each flight 
            for (let j = 0; j < 4; j++) { // For each seat class (4 seat classes)
                const seatClass = ['Economy', 'Premium Economy', 'Business', 'First Class'][j];

                for (let k = 0; k < 7; k++) { // For each day (7 days)
                    const day = new Date(today);
                    day.setDate(day.getDate() + k);

                    for (let l = 0; l < 5; l++) { // For each schedule (5 schedules per day)
                        const departureDateTime = new Date(day);
    
                        departureDateTime.setHours(
                            parseInt(getRandomInt(0, 23)),
                            parseInt(getRandomInt(0, 59)),
                            parseInt(getRandomInt(0, 59)),
                            parseInt(getRandomInt(0, 999))
                        );
    
                        const duration = parseInt(getRandomInt(45, 300));
                        const arrivalDateTime = new Date(departureDateTime);
                        arrivalDateTime.setMinutes(arrivalDateTime.getMinutes() + duration);
    
                        const ticketPrice = getRandomInt(1000, 9900) * 1000;
                        const seatAvailability = 72;
                        const terminalGate = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C"][getRandomInt(0, 8)];

                        await prisma.schedule.create({
                            data: {
                                flightId: i,
                                departureDateTime: departureDateTime.toISOString(),
                                arrivalDateTime: arrivalDateTime.toISOString(),
                                duration,
                                ticketPrice,
                                seatAvailability,
                                seatClass,
                                terminalGate
                            }
                        });

                        total++;
                        console.log(`Seeding Schedule: ${total}/${flightSize * 4 * 7 * 5}`);
                        clearLastLine();
                    }
                }

            }
        }
    } catch (err) {
        console.error(err);
    }
}

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of Schedule`))
    .catch((err) => console.log(`Failed seeding Schedule\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });