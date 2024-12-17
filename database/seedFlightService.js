const { PrismaClient } = require('@prisma/client');
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

let total = 0;
const seedDatabase = async () => {
    const flightSize = await prisma.flight.count();
    const serviceSize = await prisma.service.count();
    
    for (let i = 1; i <= flightSize; i++) {
        const min = getRandomInt(1, serviceSize + 1, 0);
        const max = min === serviceSize ? serviceSize : getRandomInt(1, serviceSize + 1, min);

        for (let j = min; j <= max; j++) {
            try {
                await prisma.flightService.create({ 
                    data: {
                        flightId: i,
                        serviceId: j
                    }
                });

                total++;
            } catch (err) {
                console.error(err);
            }
        }
    }
}

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of FlightService`))
    .catch((err) => console.log(`Failed seeding FlightService\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });