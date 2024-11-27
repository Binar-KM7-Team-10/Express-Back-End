const flight = require('./seeds/flight.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedDatabase = async () => {
    for (const data of flight) {
        try {
            const departureCountry = await prisma.airport.findUnique({ 
                where: {
                    id: data.departureAirportId
                },
                select: {
                    country: true
                }
            });

            const arrivalCountry = await prisma.airport.findUnique({ 
                where: {
                    id: data.arrivalAirportId
                },
                select: {
                    country: true
                }
            });

            const flightType = (departureCountry === arrivalCountry) ? 'Domestic' : 'International';

            await prisma.flight.create({
                data: {
                    ...data,
                    flightType
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding Flight'))
    .catch((err) => console.log(`Failed seeding Flight\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });