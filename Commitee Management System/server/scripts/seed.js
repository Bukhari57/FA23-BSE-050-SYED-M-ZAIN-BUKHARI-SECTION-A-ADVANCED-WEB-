import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Committee } from '../src/models/committee.model.js';
import { Member } from '../src/models/member.model.js';
import { Notification } from '../src/models/notification.model.js';
import { Payment } from '../src/models/payment.model.js';
import { Transaction } from '../src/models/transaction.model.js';
import { User } from '../src/models/user.model.js';
const run = async () => {
    await connectDatabase();
    await Promise.all([
        User.deleteMany({}),
        Committee.deleteMany({}),
        Member.deleteMany({}),
        Payment.deleteMany({}),
        Transaction.deleteMany({}),
        Notification.deleteMany({}),
    ]);
    const admin = await User.create({
        fullName: 'System Admin',
        email: 'admin@committeeplus.app',
        password: 'Admin1234!',
        role: 'super_admin',
        isEmailVerified: true,
    });
    const manager = await User.create({
        fullName: 'Committee Manager',
        email: 'manager@committeeplus.app',
        password: 'Manager1234!',
        role: 'manager',
        isEmailVerified: true,
    });
    const committee = await Committee.create({
        name: 'Gold Circle 2026',
        description: 'Premium monthly savings circle for verified members.',
        monthlyAmount: 25000,
        durationMonths: 12,
        memberLimit: 8,
        status: 'active',
        startDate: dayjs().subtract(2, 'month').toDate(),
        payoutDayOfMonth: 5,
        autoRotationEnabled: true,
        createdBy: manager._id,
        approvedBy: admin._id,
        currentRotationIndex: 2,
        nextPayoutDate: dayjs().add(8, 'day').toDate(),
        tags: ['premium', '2026'],
    });
    const memberDocs = await Member.insertMany([
        {
            committee: committee._id,
            fullName: 'Ayesha Noor',
            email: 'ayesha@example.com',
            cnic: '35202-1234567-8',
            phone: '+923001112233',
            position: 1,
            iban: 'PK36SCBL0000001122334455',
            accountTitle: 'Ayesha Noor',
            createdBy: manager._id,
        },
        {
            committee: committee._id,
            fullName: 'Bilal Khan',
            email: 'bilal@example.com',
            cnic: '35202-2234567-8',
            phone: '+923004445566',
            position: 2,
            iban: 'PK36SCBL0000006677889900',
            accountTitle: 'Bilal Khan',
            createdBy: manager._id,
        },
        {
            committee: committee._id,
            fullName: 'Hina Tariq',
            email: 'hina@example.com',
            cnic: '35202-3234567-8',
            phone: '+923007778899',
            position: 3,
            iban: 'PK36SCBL0000009988776655',
            accountTitle: 'Hina Tariq',
            createdBy: manager._id,
        },
    ]);
    await Payment.insertMany(memberDocs.map((member, i) => ({
        committee: committee._id,
        member: member._id,
        dueDate: dayjs().subtract(i, 'day').toDate(),
        amount: committee.monthlyAmount,
        paidAmount: i === 0 ? committee.monthlyAmount : 0,
        status: i === 0 ? 'paid' : 'pending',
        fineAmount: i === 0 ? 0 : 500,
        createdBy: manager._id,
        paidAt: i === 0 ? new Date() : undefined,
        transactionRef: i === 0 ? `TXN-${Date.now()}-${i}` : undefined,
    })));
    await Transaction.create({
        committee: committee._id,
        member: memberDocs[0]._id,
        type: 'collection',
        amount: committee.monthlyAmount,
        description: 'Monthly installment received',
        processedBy: manager._id,
    });
    await Notification.insertMany([
        {
            user: manager._id,
            type: 'warning',
            title: '2 payments pending',
            body: 'Gold Circle 2026 has pending installments due this week.',
        },
        {
            user: manager._id,
            type: 'info',
            title: 'Next payout approaching',
            body: 'Next committee payout is scheduled in 8 days.',
        },
    ]);
    console.log('Seed complete');
    await mongoose.connection.close();
    process.exit(0);
};
run().catch(async (error) => {
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
});
