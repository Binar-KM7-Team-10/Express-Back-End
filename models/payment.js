const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Payment {
    static async getDTO(invoiceId){
        const payment = await prisma.payment.findUnique({
            where: {
                invoiceId: parseInt(invoiceId),
            }
        });

        return {
            paymentId: payment.id,
            date: payment.date,
            method: payment.method,
        }
    }
}

module.exports = Payment;