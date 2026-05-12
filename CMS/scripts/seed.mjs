import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NG_APP_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY or NG_APP_SUPABASE_URL in .env.local");
  process.exit(1);
}

// Initialize Supabase client - create a new instance for seeding
let supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Function to refresh Supabase client after auth operations
async function refreshSupabaseClient() {
  // Create a fresh instance to ensure schema cache is updated
  supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  // Small delay to allow backend to sync
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

const demoUsers = [
  {
    email: "admin@demo.local",
    password: "AdminDemo123!",
    fullName: "Admin User",
    isAdmin: true,
  },
  {
    email: "alice@demo.local",
    password: "AliceDemo123!",
    fullName: "Alice Johnson",
    isAdmin: false,
  },
  {
    email: "bob@demo.local",
    password: "BobDemo123!",
    fullName: "Bob Smith",
    isAdmin: false,
  },
  {
    email: "charlie@demo.local",
    password: "CharlieDemo123!",
    fullName: "Charlie Brown",
    isAdmin: false,
  },
];

async function seedData() {
  try {
    console.log("🌱 Starting data seeding...\n");

    // 1. Create demo users
    console.log("📝 Creating demo users...");
    const createdUsers = {};
    const credentials = [];

    for (const user of demoUsers) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) throw authError;

        createdUsers[user.email] = authUser.user.id;
        console.log(`✅ Created user: ${user.email}`);

        // Update user profile
        const { error: profileError } = await supabase
          .from("users")
          .update({
            full_name: user.fullName,
            is_admin: user.isAdmin,
            trust_score: user.isAdmin ? 100 : 85,
            is_banned: false,
          })
          .eq("id", authUser.user.id);

        if (profileError) throw profileError;

        credentials.push({
          email: user.email,
          password: user.password,
          role: user.isAdmin ? "Admin" : "Member",
        });
      } catch (err) {
        console.warn(`⚠️  Could not create ${user.email}: ${err.message}`);
      }
    }

    // Refresh Supabase client after creating auth users
    await refreshSupabaseClient();

    // 2. Create demo committees
    console.log("\n🏛️  Creating demo committees...");
    const committees = [
      {
        name: "Monthly Savings Circle",
        description: "A rotating savings group focused on monthly contributions.",
        duration_months: 12,
        monthly_amount: 100,
        max_members: 5,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        status: "active",
      },
      {
        name: "Education Fund Committee",
        description: "Dedicated to saving for educational expenses and scholarships.",
        duration_months: 6,
        monthly_amount: 150,
        max_members: 4,
        start_date: new Date().toISOString(),
        status: "open",
      },
      {
        name: "Community Development",
        description: "Building infrastructure and community projects together.",
        duration_months: 3,
        monthly_amount: 200,
        max_members: 8,
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: "open",
      },
    ];

    const createdCommittees = {};
    for (const committee of committees) {
      try {
        // Use raw SQL to avoid schema cache issues
        const { data: newCommittee, error } = await supabase.rpc(
          "create_committee",
          {
            p_name: committee.name,
            p_description: committee.description,
            p_duration_months: committee.duration_months,
            p_monthly_amount: committee.monthly_amount,
            p_max_members: committee.max_members,
            p_start_date: committee.start_date,
            p_status: committee.status,
            p_creator_id: createdUsers["admin@demo.local"],
          }
        );

        if (error) {
          // Fallback to direct insert with prepared statement
          const { data: fallbackCommittee, error: fallbackError } = await supabase
            .from("committees")
            .insert({
              name: committee.name,
              description: committee.description,
              duration_months: committee.duration_months,
              monthly_amount: committee.monthly_amount,
              max_members: committee.max_members,
              start_date: committee.start_date,
              status: committee.status,
              creator_id: createdUsers["admin@demo.local"],
            })
            .select()
            .single();

          if (fallbackError) {
            // Direct SQL approach
            console.log(
              `⚠️  Falling back to direct SQL for ${committee.name}: ${error.message}`
            );
            continue;
          }
          createdCommittees[committee.name] = fallbackCommittee.id;
        } else {
          createdCommittees[committee.name] = newCommittee[0]?.id || newCommittee?.id;
        }

        console.log(`✅ Created committee: ${committee.name} (${committee.status})`);
      } catch (err) {
        console.error(
          `❌ Failed to create committee ${committee.name}: ${err.message}`
        );
      }
    }

    // 3. Add members to committees
    console.log("\n👥 Adding members to committees...");
    const memberStatuses = ["approved", "pending"];
    const userEmails = Object.keys(createdUsers);

    for (const [committeeTitle, committeeId] of Object.entries(createdCommittees)) {
      // Add all users to the first two committees
      const membersToAdd = [1, 2, 3].map((idx) => {
        const email = userEmails[idx % userEmails.length];
        const status = idx === 1 ? "approved" : "pending";
        return {
          committee_id: committeeId,
          user_id: createdUsers[email],
          status,
          joined_date: new Date().toISOString(),
          turn_position: idx,
        };
      });

      for (const member of membersToAdd) {
        const { error } = await supabase.from("committee_members").insert(member);

        if (error) {
          console.warn(`⚠️  Could not add member: ${error.message}`);
        }
      }

      console.log(
        `✅ Added ${membersToAdd.length} members to ${committeeTitle}`
      );
    }

    // 4. Create demo payments
    console.log("\n💰 Creating demo payments...");
    let paymentCount = 0;
    const paymentStatuses = ["pending", "paid", "confirmed"];

    for (const [committeeTitle, committeeId] of Object.entries(createdCommittees)) {
      const { data: members } = await supabase
        .from("committee_members")
        .select("user_id, turn_position")
        .eq("committee_id", committeeId);

      if (members) {
        for (const member of members.slice(0, 2)) {
          const paymentStatus = paymentStatuses[paymentCount % paymentStatuses.length];
          const { error } = await supabase.from("payments").insert({
            committee_id: committeeId,
            user_id: member.user_id,
            amount: 100,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: paymentStatus,
            proof_url:
              paymentStatus === "paid"
                ? "https://via.placeholder.com/150?text=Payment+Proof"
                : null,
            created_at: new Date().toISOString(),
          });

          if (!error) paymentCount++;
        }
      }
    }

    console.log(`✅ Created ${paymentCount} demo payments`);

    // 5. Create demo reputation logs
    console.log("\n⭐ Creating demo reputation logs...");
    let reputationCount = 0;

    for (const email of userEmails.slice(1)) {
      // Skip admin
      const userId = createdUsers[email];
      const actions = [
        { action: "payment_confirmed", delta: 10 },
        { action: "attendance", delta: 5 },
        { action: "leadership", delta: 15 },
      ];

      for (const { action, delta } of actions) {
        const { error } = await supabase.from("reputation_logs").insert({
          user_id: userId,
          action,
          delta,
          reason: `Bonus for ${action}`,
          created_at: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        if (!error) reputationCount++;
      }
    }

    console.log(`✅ Created ${reputationCount} demo reputation logs`);

    // 6. Create demo notifications
    console.log("\n🔔 Creating demo notifications...");
    let notificationCount = 0;

    const notifications = [
      {
        type: "payment_due",
        title: "Payment Due",
        message: "Your monthly payment is due in 3 days",
      },
      {
        type: "member_joined",
        title: "New Member",
        message: "A new member has joined your committee",
      },
      {
        type: "turn_upcoming",
        title: "Your Turn Coming Up",
        message: "It will be your turn to receive funds in 2 weeks",
      },
      {
        type: "reputation_update",
        title: "Reputation Updated",
        message: "Your trust score has improved by 10 points",
      },
    ];

    for (const email of userEmails.slice(1)) {
      // Skip admin
      const userId = createdUsers[email];
      for (const notif of notifications) {
        const { error } = await supabase.from("notifications").insert({
          user_id: userId,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          read: Math.random() > 0.5,
          created_at: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        if (!error) notificationCount++;
      }
    }

    console.log(`✅ Created ${notificationCount} demo notifications`);

    // 7. Print credentials
    console.log("\n" + "=".repeat(60));
    console.log("✨ SEEDING COMPLETE! Demo Credentials:");
    console.log("=".repeat(60));
    credentials.forEach((cred) => {
      console.log(`\n📧 ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
      console.log(`   Role: ${cred.role}`);
    });
    console.log("\n" + "=".repeat(60));
    console.log(`App URL: http://localhost:4200/`);
    console.log("=".repeat(60) + "\n");

    // Save to file for documentation
    const credentialsMarkdown = `# Demo Credentials

The following test accounts have been seeded into the Supabase database:

\`\`\`
${credentials.map((c) => `${c.email} | ${c.password} | ${c.role}`).join("\n")}
\`\`\`

## Test Data Included:
- 4 demo user accounts (1 admin + 3 members)
- 3 sample committees (active, open, upcoming)
- Committee memberships with various statuses
- Sample payments (pending, paid, confirmed)
- Reputation logs for trust score tracking
- Notifications for users

## Testing the App:

1. Start the dev server: \`npm start\`
2. Open http://localhost:4200/
3. Log in with any credential above
4. Admin can access /admin for system overview and user management
5. Members can browse committees, join, and track payments

---
Generated at: ${new Date().toISOString()}
`;

    // Optionally save to file
    try {
      import("fs").then((fs) => {
        fs.writeFileSync(
          "docs/DEMO_CREDENTIALS.md",
          credentialsMarkdown
        );
        console.log("💾 Credentials saved to docs/DEMO_CREDENTIALS.md");
      });
    } catch (err) {
      console.log("Note: Could not save credentials file");
    }
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seedData();
