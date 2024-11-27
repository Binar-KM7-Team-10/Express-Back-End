const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const minId = 1;
const maxId = 100;
const seedDatabase = async () => {
    for (let i = minId; i <= maxId; i++) {
        for (let j = 1; j <= 3; j++) {
            try {
                await prisma.flightService.create({ 
                    data: {
                        flightId: i,
                        serviceId: j
                    }
                 });
            } catch (err) {
                console.error(err);
            }
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding FlightService'))
    .catch((err) => console.log(`Failed seeding FlightService\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });