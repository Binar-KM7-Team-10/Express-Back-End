const airline = require('./seeds/airline.json');
const airport = require('./seeds/airport.json');
const city = require('./seeds/city.json');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clearLastLine = () => {
    process.stdout.moveCursor(0, -1) // up one line
    process.stdout.clearLine(1) // from cursor to end
}

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
    let count = 0, total = 0;
    
    for (let i = 0; i < 10; i++) {
        try {
            for (let j = 0; j < airport.length; j++) {
                if (airport[i].name !== airport[j].name) {
                    const departureAirportId = parseInt(count + 1);
                    const arrivalAirportId = parseInt(j + 1);
                    const airlineId = parseInt(getRandomInt(1, airline.length + 1, 0));
                    const airlineData = airline[airlineId - 1];
                    const flightNumber = `${airlineData.iataCode}${getRandomThreeDigitNumber()}`;
                    const flightType = city[airport[departureAirportId - 1].cityId - 1].country === city[airport[arrivalAirportId - 1].cityId - 1].country ? 'Domestic' : 'International';

                    await prisma.flight.create({
                        data: {
                            departureAirportId,
                            arrivalAirportId,
                            airlineId,
                            flightNumber,
                            flightType
                        }
                    });

                    total++;
                    console.log(`Seeding Flight: ${total}/${10 * (airport.length - 1)}`);
                    clearLastLine();
                }
            }
            
            count++;
        } catch (err) {
            console.error(err);
        }
    }

    return total;
}

seedDatabase()
    .then((total) => console.log(`Successfully seeding ${total} rows of Flight`))
    .catch((err) => console.log(`Failed seeding Flight\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });