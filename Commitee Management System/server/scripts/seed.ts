import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { AuditLog } from '../src/models/audit-log.model.js';
import { Committee } from '../src/models/committee.model.js';
import { Member } from '../src/models/member.model.js';
import { Notification } from '../src/models/notification.model.js';
import { Payment } from '../src/models/payment.model.js';
import { Report } from '../src/models/report.model.js';
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
    Report.deleteMany({}),
    AuditLog.deleteMany({}),
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

  const operationsLead = await User.create({
    fullName: 'Operations Lead',
    email: 'ops@committeeplus.app',
    password: 'OpsLead1234!',
    role: 'admin',
    isEmailVerified: true,
  });

  const supportManager = await User.create({
    fullName: 'Support Manager',
    email: 'support@committeeplus.app',
    password: 'Support1234!',
    role: 'manager',
    isEmailVerified: true,
  });

  const goldCommittee = await Committee.create({
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

  const silverCommittee = await Committee.create({
    name: 'Silver Growth 2026',
    description: 'Mid-sized committee focused on steady payout cycles.',
    monthlyAmount: 15000,
    durationMonths: 10,
    memberLimit: 10,
    status: 'active',
    startDate: dayjs().subtract(4, 'month').toDate(),
    payoutDayOfMonth: 12,
    autoRotationEnabled: true,
    createdBy: supportManager._id,
    approvedBy: operationsLead._id,
    currentRotationIndex: 4,
    nextPayoutDate: dayjs().add(15, 'day').toDate(),
    tags: ['standard', 'growth'],
  });

  const familyCommittee = await Committee.create({
    name: 'Family Secure 2026',
    description: 'Low-risk family committee waiting for admin approval.',
    monthlyAmount: 8000,
    durationMonths: 8,
    memberLimit: 6,
    status: 'draft',
    startDate: dayjs().add(1, 'month').toDate(),
    payoutDayOfMonth: 9,
    autoRotationEnabled: false,
    createdBy: manager._id,
    tags: ['family', 'starter'],
  });

  const pausedCommittee = await Committee.create({
    name: 'Legacy Circle 2025',
    description: 'Paused committee from previous cycle retained for records.',
    monthlyAmount: 10000,
    durationMonths: 6,
    memberLimit: 5,
    status: 'paused',
    startDate: dayjs().subtract(10, 'month').toDate(),
    payoutDayOfMonth: 6,
    autoRotationEnabled: false,
    createdBy: supportManager._id,
    approvedBy: admin._id,
    currentRotationIndex: 5,
    nextPayoutDate: dayjs().add(1, 'month').toDate(),
    tags: ['legacy'],
  });

  const goldMembers = await Member.insertMany([
    {
      committee: goldCommittee._id,
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
      committee: goldCommittee._id,
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
      committee: goldCommittee._id,
      fullName: 'Hina Tariq',
      email: 'hina@example.com',
      cnic: '35202-3234567-8',
      phone: '+923007778899',
      position: 3,
      iban: 'PK36SCBL0000009988776655',
      accountTitle: 'Hina Tariq',
      createdBy: manager._id,
    },
    {
      committee: goldCommittee._id,
      fullName: 'Usman Ali',
      email: 'usman@example.com',
      cnic: '35202-4234567-8',
      phone: '+923115551122',
      position: 4,
      iban: 'PK36SCBL0000002233445566',
      accountTitle: 'Usman Ali',
      createdBy: manager._id,
    },
  ]);

  const silverMembers = await Member.insertMany([
    {
      committee: silverCommittee._id,
      fullName: 'Sana Iqbal',
      email: 'sana@example.com',
      cnic: '42101-1111111-1',
      phone: '+923021231231',
      position: 1,
      iban: 'PK20MEZN0000002211004455',
      accountTitle: 'Sana Iqbal',
      createdBy: supportManager._id,
    },
    {
      committee: silverCommittee._id,
      fullName: 'Hamza Rehman',
      email: 'hamza@example.com',
      cnic: '42101-2222222-2',
      phone: '+923054545454',
      position: 2,
      iban: 'PK20MEZN0000009988112233',
      accountTitle: 'Hamza Rehman',
      createdBy: supportManager._id,
    },
    {
      committee: silverCommittee._id,
      fullName: 'Maria Javed',
      email: 'maria@example.com',
      cnic: '42101-3333333-3',
      phone: '+923066666777',
      position: 3,
      iban: 'PK20MEZN0000006677441122',
      accountTitle: 'Maria Javed',
      createdBy: supportManager._id,
    },
  ]);

  const goldPayments = goldMembers.flatMap((member, memberIndex) =>
    Array.from({ length: 3 }, (_, monthOffset) => {
      const dueDate = dayjs().subtract(monthOffset, 'month').date(goldCommittee.payoutDayOfMonth).toDate();
      const isLatestMonth = monthOffset === 0;
      const paidAmount = isLatestMonth ? (memberIndex % 2 === 0 ? goldCommittee.monthlyAmount : 0) : goldCommittee.monthlyAmount;
      const status = paidAmount === 0 ? 'pending' : paidAmount < goldCommittee.monthlyAmount ? 'partial' : 'paid';

      return {
        committee: goldCommittee._id,
        member: member._id,
        dueDate,
        amount: goldCommittee.monthlyAmount,
        paidAmount,
        status,
        fineAmount: paidAmount === 0 && isLatestMonth ? 750 : 0,
        createdBy: manager._id,
        paidAt: paidAmount > 0 ? dayjs(dueDate).add(2, 'day').toDate() : undefined,
        transactionRef: paidAmount > 0 ? `GOLD-${member.position}-${monthOffset}-${Date.now()}` : undefined,
      };
    }),
  );

  const silverPayments = silverMembers.flatMap((member, memberIndex) =>
    Array.from({ length: 2 }, (_, monthOffset) => {
      const dueDate = dayjs().subtract(monthOffset, 'month').date(silverCommittee.payoutDayOfMonth).toDate();
      const paidAmount = monthOffset === 0 && memberIndex === 1 ? silverCommittee.monthlyAmount / 2 : silverCommittee.monthlyAmount;
      const status = paidAmount === silverCommittee.monthlyAmount ? 'paid' : 'partial';

      return {
        committee: silverCommittee._id,
        member: member._id,
        dueDate,
        amount: silverCommittee.monthlyAmount,
        paidAmount,
        status,
        fineAmount: paidAmount < silverCommittee.monthlyAmount ? 300 : 0,
        createdBy: supportManager._id,
        paidAt: dayjs(dueDate).add(1, 'day').toDate(),
        transactionRef: `SILVER-${member.position}-${monthOffset}-${Date.now()}`,
      };
    }),
  );

  const payments = await Payment.insertMany([...goldPayments, ...silverPayments]);

  const paymentTransactions = payments
    .filter((payment) => payment.paidAmount > 0)
    .map((payment) => ({
      committee: payment.committee,
      member: payment.member,
      payment: payment._id,
      type: 'collection' as const,
      amount: payment.paidAmount,
      description: `Installment received for due date ${dayjs(payment.dueDate).format('YYYY-MM-DD')}`,
      processedBy: payment.createdBy,
      processedAt: payment.paidAt ?? new Date(),
      reference: payment.transactionRef,
    }));

  await Transaction.insertMany([
    ...paymentTransactions,
    {
      committee: goldCommittee._id,
      member: goldMembers[1]?._id,
      type: 'fine',
      amount: 750,
      description: 'Late payment fine applied',
      processedBy: manager._id,
      processedAt: dayjs().subtract(2, 'day').toDate(),
      reference: `FINE-${Date.now()}`,
    },
    {
      committee: goldCommittee._id,
      member: goldMembers[2]?._id,
      type: 'payout',
      amount: goldCommittee.monthlyAmount * goldMembers.length,
      description: 'Monthly payout released to rotation member',
      processedBy: manager._id,
      processedAt: dayjs().subtract(10, 'day').toDate(),
      reference: `PAYOUT-${Date.now()}`,
    },
    {
      committee: silverCommittee._id,
      member: silverMembers[0]?._id,
      type: 'payout',
      amount: silverCommittee.monthlyAmount * silverMembers.length,
      description: 'Silver committee payout completed',
      processedBy: supportManager._id,
      processedAt: dayjs().subtract(20, 'day').toDate(),
      reference: `PAYOUT-SILVER-${Date.now()}`,
    },
  ]);

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
    {
      user: supportManager._id,
      type: 'success',
      title: 'Committee reached 30% completion',
      body: 'Silver Growth 2026 has completed 30% of its payout cycle.',
    },
    {
      user: operationsLead._id,
      type: 'warning',
      title: 'Approval pending',
      body: 'Family Secure 2026 is waiting for final admin approval.',
    },
    {
      user: admin._id,
      type: 'info',
      title: 'System seed completed',
      body: 'Demo environment was refreshed with latest fixture data.',
    },
  ]);

  await Report.insertMany([
    {
      generatedBy: manager._id,
      committee: goldCommittee._id,
      type: 'monthly',
      format: 'pdf',
      period: {
        start: dayjs().startOf('month').toDate(),
        end: dayjs().endOf('month').toDate(),
      },
      summary: {
        collections: goldCommittee.monthlyAmount * 3,
        payouts: goldCommittee.monthlyAmount * goldMembers.length,
        pendingPayments: 2,
      },
    },
    {
      generatedBy: operationsLead._id,
      committee: silverCommittee._id,
      type: 'financial',
      format: 'xlsx',
      period: {
        start: dayjs().subtract(1, 'month').startOf('month').toDate(),
        end: dayjs().subtract(1, 'month').endOf('month').toDate(),
      },
      summary: {
        collections: silverCommittee.monthlyAmount * 2,
        payouts: silverCommittee.monthlyAmount * silverMembers.length,
        pendingPayments: 1,
      },
    },
  ]);

  await AuditLog.insertMany([
    {
      actor: admin._id,
      action: 'seed.bootstrap',
      resourceType: 'System',
      metadata: { environment: 'demo' },
    },
    {
      actor: manager._id,
      action: 'committee.create',
      resourceType: 'Committee',
      resourceId: goldCommittee._id.toString(),
      metadata: { source: 'seed-script' },
    },
    {
      actor: supportManager._id,
      action: 'committee.create',
      resourceType: 'Committee',
      resourceId: silverCommittee._id.toString(),
      metadata: { source: 'seed-script' },
    },
    {
      actor: manager._id,
      action: 'committee.create',
      resourceType: 'Committee',
      resourceId: familyCommittee._id.toString(),
      metadata: { source: 'seed-script' },
    },
    {
      actor: supportManager._id,
      action: 'committee.update',
      resourceType: 'Committee',
      resourceId: pausedCommittee._id.toString(),
      metadata: { status: pausedCommittee.status },
    },
  ]);

  console.log('Seed complete');
  console.log('Demo users:');
  console.log('  super_admin -> admin@committeeplus.app / Admin1234!');
  console.log('  admin       -> ops@committeeplus.app / OpsLead1234!');
  console.log('  manager     -> manager@committeeplus.app / Manager1234!');
  console.log('  manager     -> support@committeeplus.app / Support1234!');
  console.log('Created committees:', {
    gold: goldCommittee._id.toString(),
    silver: silverCommittee._id.toString(),
    familyDraft: familyCommittee._id.toString(),
    paused: pausedCommittee._id.toString(),
  });
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
