const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

const seedDatabase = async () => {
    for (let i = 1; i <= 400; i++) {
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
            } catch (err) {
                console.error(err);
            }
        }
    }
}

seedDatabase()
    .then(() => console.log('Successfully seeding Seat'))
    .catch((err) => console.log(`Failed seeding Seat\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });