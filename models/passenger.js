const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Passenger {
    static async getById(id){
        const passenger = await prisma.passenger.findUnique({
            where: {
                id: parseInt(id),
            },
            select: {
                id: true,
                label: true,
                ageGroup: true,
                title: true,
                fullName: true,
                familyName: true,
                bookedSeat: {
                    select: {
                        seat: true,
                    }
                },
            }
        });

        return {
            passengerId: passenger.id,
            label: passenger?.label,
            title: passenger?.title,
            fullName: passenger?.fullName,
            familyName: passenger?.familyName,
            ageGroup: passenger.ageGroup,
            seatNumber: {
                outbound: passenger.bookedSeat?.seat.seatNumber,
                inbound: null
            }
        };
    }

    static async getDTO(bookingId){
        const passengers = await prisma.passenger.findMany({
            where: {
                bookingId: parseInt(bookingId),
            }
        });

        let adult = 0;
        let child = 0;
        let baby = 0;

        passengers.map((passenger) => {
            if (passenger.ageGroup === 'Adult') {
                adult++;
            }

            if (passenger.ageGroup === 'Child') {
                child++;
            }

            if (passenger.ageGroup === 'Baby') {
                baby++;
            }
        });

        const data = await Promise.all(passengers.map((p) => this.getById(p.id)));

        return {
            total: adult + child,
            adult,
            child,
            baby,
            data
        };
    }
}

module.exports = Passenger;