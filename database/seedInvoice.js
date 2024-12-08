const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedInvoice() {
    try {
        // Ambil semua bookings beserta itinerary dan schedule-nya
        const bookings = await prisma.booking.findMany({
            select: {
                id: true,
                date: true,
                Itinerary: {
                    include: {
                        schedule: {
                            select: {
                                id: true,
                                ticketPrice: true,
                            },
                        },
                    },
                },
            },
        });

        // Looping untuk menghitung subtotal, taxAmount, dan totalAmount
        for (const booking of bookings) {
            for (const itinerary of booking.Itinerary) {
                const ticketPrice = itinerary.schedule.ticketPrice;
                const bookingAmount = booking.Itinerary.length; // Asumsi 1 booking = 1 itinerary
                
                // Menghitung subtotal
                const subtotal = ticketPrice * bookingAmount;

                // Menghitung taxAmount (10% dari subtotal)
                const taxAmount = subtotal * 0.1;

                // Menghitung totalAmount
                const totalAmount = subtotal + taxAmount;

                console.log(`Booking ID: ${booking.id}`);
                console.log(`Ticket Price: ${ticketPrice}`);
                console.log(`Booking Amount: ${bookingAmount}`);
                console.log(`Subtotal: ${subtotal}`);
                console.log(`Tax Amount: ${taxAmount}`);
                console.log(`Total Amount: ${totalAmount}`);

                // Tentukan paymentDueDateTime (misalnya menggunakan waktu sekarang)
                const bookingDate = new Date(booking.date);
                bookingDate.setDate(bookingDate.getDate() + 7);
                const paymentDueDateTime = bookingDate.toISOString()

                // Simpan invoice untuk setiap booking
                await prisma.invoice.create({
                    data: {
                        bookingId: booking.id,
                        subtotal: subtotal,
                        taxAmount: taxAmount,
                        totalAmount: totalAmount,
                        paymentDueDateTime: paymentDueDateTime,
                    },
                });
            }
        }
    } catch (error) {
        console.log("Error calculating and creating invoices:", error);
    }
}

seedInvoice()
    .then(() => console.log('Successfully seeding invoices'))
    .catch((err) => console.log(`Failed seeding invoices\nError: ${err.message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
