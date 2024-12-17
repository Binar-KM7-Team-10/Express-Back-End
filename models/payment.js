const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Payment {
    static async getDTO(invoiceId){
        const payment = await prisma.payment.findUnique({
            where: {
                invoiceId: parseInt(invoiceId),
            }
        });

        return payment ? {
            paymentId: payment.id,
            date: payment.date,
            method: payment.method,
        } : null;
    }
}

module.exports = Payment;