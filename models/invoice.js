const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

class Invoice {
    static async getDTO(bookingId){
        const invoice = await prisma.invoice.findUnique({
            where: {
                bookingId: parseInt(bookingId),
            },
        });

        return {
            invoiceId: invoice.id,
            paymentDueDateTime: invoice.paymentDueDateTime,
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxAmount,
            totalAmount: invoice.totalAmount,
        };
    }
}

module.exports = Invoice;