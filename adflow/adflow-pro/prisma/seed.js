const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.package.deleteMany();
  await prisma.category.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  const [basic, standard, premium] = await Promise.all([
    prisma.package.create({ data: { name: 'Basic', price: 99, durationDays: 7, priority: 1, featured: false } }),
    prisma.package.create({ data: { name: 'Standard', price: 199, durationDays: 14, priority: 2, featured: false } }),
    prisma.package.create({ data: { name: 'Premium', price: 349, durationDays: 30, priority: 3, featured: true } }),
  ]);

  const [retail, technology, travel] = await Promise.all([
    prisma.category.create({ data: { name: 'Retail', description: 'Consumer-facing campaigns' } }),
    prisma.category.create({ data: { name: 'Technology', description: 'Software and hardware promotions' } }),
    prisma.category.create({ data: { name: 'Travel', description: 'Hospitality and travel offers' } }),
  ]);

  await Promise.all([
    prisma.setting.create({ data: { key: 'site_name', value: 'AdFlow Pro' } }),
    prisma.setting.create({ data: { key: 'featured_threshold', value: '2' } }),
  ]);

  const password = await bcrypt.hash('password', 10);

  const [admin, moderator, superAdmin, client] = await Promise.all([
    prisma.user.create({ data: { name: 'Admin', email: 'admin@adflow.local', password, role: 'ADMIN' } }),
    prisma.user.create({ data: { name: 'Moderator', email: 'moderator@adflow.local', password, role: 'MODERATOR' } }),
    prisma.user.create({ data: { name: 'Super Admin', email: 'superadmin@adflow.local', password, role: 'SUPER_ADMIN' } }),
    prisma.user.create({ data: { name: 'Client', email: 'client@adflow.local', password, role: 'USER' } }),
  ]);

  const now = new Date();
  const createAd = async (data) => prisma.ad.create({ data });

  const demoAds = [
    { title: 'Premium Launch Campaign', description: 'Featured launch with high visibility.', packageId: premium.id, userId: client.id, categoryId: retail.id, status: 'LIVE', featured: true, startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/premium.jpg' },
    { title: 'Standard Winter Offer', description: 'Seasonal ad with strong standard ranking.', packageId: standard.id, userId: client.id, categoryId: travel.id, status: 'LIVE', featured: false, startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/standard.jpg' },
    { title: 'Basic Local Promotion', description: 'Short-term local promotion for a smaller budget.', packageId: basic.id, userId: client.id, status: 'LIVE', featured: false, startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/basic.jpg' },
    { title: 'Premium Weekend Spotlight', description: 'Top placement over the weekend.', packageId: premium.id, userId: client.id, status: 'LIVE', featured: true, startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/spotlight.jpg' },
    { title: 'Standard Brand Awareness', description: 'Medium visibility for a brand refresh.', packageId: standard.id, userId: client.id, status: 'LIVE', featured: false, startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/brand.jpg' },
    { title: 'Premium Flash Sale', description: 'Featured ad for a time-sensitive campaign.', packageId: premium.id, userId: client.id, status: 'LIVE', featured: true, startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/flashsale.jpg' },
    { title: 'Standard Citywide Promotion', description: 'Strong exposure for a city-level campaign.', packageId: standard.id, userId: client.id, status: 'LIVE', featured: false, startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/citywide.jpg' },
    { title: 'Basic Weekend Deal', description: 'Budget-friendly ad with local reach.', packageId: basic.id, userId: client.id, status: 'LIVE', featured: false, startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/weekend.jpg' },
    { title: 'Premium Holiday Feature', description: 'High-priority holiday campaign.', packageId: premium.id, userId: client.id, status: 'LIVE', featured: true, startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/holiday.jpg' },
    { title: 'Standard Product Launch', description: 'New product ad with solid visibility.', packageId: standard.id, userId: client.id, status: 'LIVE', featured: false, startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/product.jpg' },
    { title: 'Basic Community Event', description: 'Small budget ad for a local event.', packageId: basic.id, userId: client.id, status: 'LIVE', featured: false, startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/community.jpg' },
    { title: 'Scheduled Summer Push', description: 'Pre-approved ad waiting to go live.', packageId: standard.id, userId: client.id, status: 'SCHEDULED', featured: false, startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/scheduled.jpg' },
    { title: 'Upcoming Promo Plan', description: 'Approved and scheduled to launch soon.', packageId: premium.id, userId: client.id, status: 'SCHEDULED', featured: true, startDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 34 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/upcoming.jpg' },
    { title: 'Approved Featured Campaign', description: 'Ready for scheduling after admin verification.', packageId: premium.id, userId: client.id, status: 'APPROVED', featured: true, mediaUrl: 'https://example.com/approved.jpg' },
    { title: 'Approved Standard Blast', description: 'Approved but not scheduled yet.', packageId: standard.id, userId: client.id, status: 'APPROVED', featured: false, mediaUrl: 'https://example.com/approved-standard.jpg' },
    { title: 'Pending Submission Boost', description: 'Submitted and waiting for moderator review.', packageId: basic.id, userId: client.id, status: 'SUBMITTED', featured: false, mediaUrl: 'https://example.com/pending1.jpg' },
    { title: 'Pending Submission Growth', description: 'Submitted and queued for moderation.', packageId: standard.id, userId: client.id, status: 'SUBMITTED', featured: false, mediaUrl: 'https://example.com/pending2.jpg' },
    { title: 'Pending Payment Review', description: 'Payment proof still under admin review.', packageId: premium.id, userId: client.id, categoryId: technology.id, status: 'SUBMITTED', featured: true, suspiciousMedia: true, mediaUrl: 'https://example.com/pending3.jpg' },
    { title: 'Pending Approval Strategy', description: 'Payment submitted and awaiting final approval.', packageId: standard.id, userId: client.id, status: 'SUBMITTED', featured: false, mediaUrl: 'https://example.com/pending4.jpg' },
    { title: 'Pending Launch Brief', description: 'Submission complete and under review.', packageId: basic.id, userId: client.id, status: 'SUBMITTED', featured: false, mediaUrl: 'https://example.com/pending5.jpg' },
    { title: 'Draft Ad Concept', description: 'Draft ad still being prepared.', packageId: basic.id, userId: client.id, status: 'DRAFT', featured: false, mediaUrl: 'https://example.com/draft.jpg' },
    { title: 'Expired Campaign 1', description: 'A campaign that already reached its end date.', packageId: basic.id, userId: client.id, status: 'EXPIRED', featured: false, startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/expired1.jpg' },
    { title: 'Expired Campaign 2', description: 'Another expired campaign for testing.', packageId: standard.id, userId: client.id, status: 'EXPIRED', featured: false, startDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/expired2.jpg' },
    { title: 'Expired Campaign 3', description: 'Expired ad that should no longer show.', packageId: premium.id, userId: client.id, status: 'EXPIRED', featured: false, startDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), mediaUrl: 'https://example.com/expired3.jpg' },
    { title: 'Rejected Creative Ad', description: 'Rejected after moderation feedback.', packageId: basic.id, userId: client.id, status: 'REJECTED', featured: false, mediaUrl: 'https://example.com/rejected1.jpg' },
    { title: 'Rejected Payment Proof', description: 'Rejected due to payment issues.', packageId: premium.id, userId: client.id, status: 'REJECTED', featured: true, mediaUrl: 'https://example.com/rejected2.jpg' },
  ];

  await Promise.all(demoAds.map((ad) => createAd(ad)));

  const submittedAds = await prisma.ad.findMany({ where: { status: 'SUBMITTED' } });
  await Promise.all(submittedAds.map((ad, index) => prisma.payment.create({ data: { adId: ad.id, transactionId: `TX-${1000 + index}`, proofUrl: `https://example.com/proof-${index + 1}.png`, status: 'PENDING' } })));

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
