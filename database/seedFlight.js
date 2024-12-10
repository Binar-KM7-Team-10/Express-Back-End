const { PrismaClient } = require('@prisma/client');
const airline = require('./seeds/airline.json');
const airport = require('./seeds/airport.json');
const city = require('./seeds/city.json');

const prisma = new PrismaClient();

function getRandomInt(min, max, exclude) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);

    let randomInt;
    do {
        randomInt = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
    } while (randomInt === exclude);

    return randomInt;
}

function getRandomThreeDigitNumber() {
    return Math.floor(Math.random() * (999 - 100 + 1)) + 100;
}

const seedDatabase = async () => {
    const airportNumber = airport.length;
    let total = 0;

    for (const data of airline) {
        try {
            total++;
            const departureAirportId = getRandomInt(1, airportNumber + 1, 0);
            const arrivalAirportId = getRandomInt(1, airportNumber + 1, departureAirportId);

            const departureCountry = city[airport[departureAirportId - 1].cityId - 1].country;
            const arrivalCountry = city[airport[arrivalAirportId - 1].cityId - 1].country;

            const flightType = departureCountry === arrivalCountry ? 'Domestik' : 'Internasional';
            const airlineId = total;
            const flightNumber = `${data.iataCode}${getRandomThreeDigitNumber()}`;

            await prisma.flight.create({
                data: {
                    departureAirportId,
                    arrivalAirportId,
                    airlineId,
                    flightNumber,
                    flightType,
                },
            });
        } catch (err) {
            console.error(err);
        }
    }

    return total;
};

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of Flight`))
    .catch((err) => console.log(`Failed seeding Flight\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
