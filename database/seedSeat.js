const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

let total = 0;
const seedDatabase = async () => {
    const scheduleNumber = await prisma.schedule.count();

    for (let i = 1; i <= scheduleNumber; i++) {
        let col = 'A';
        let row = 1;
        for (let j = 1; j <= 72; j++) {
            try {
                if (j % 12 === 1 && j != 1) {
                    col = nextChar(col);
                    row = 1;
                }
    
                const seatNumber = col + row;
                row++;
    
                await prisma.seat.create({
                    data: {
                        scheduleId: i,
                        seatNumber
                    }
                });
                total++;
                console.clear();
                console.log(`Inserted ${total}/${scheduleNumber * 72} rows on Seat table`);
            } catch (err) {
                console.error(err);
            }
        }
    }
}

seedDatabase()
    .then(() => console.log(`Successfully seeding ${total} rows of Seat`))
    .catch((err) => console.log(`Failed seeding Seat\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });