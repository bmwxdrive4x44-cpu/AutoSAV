const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      isBlocked: true,
    },
  });

  const invalidUsers = users.filter((user) => !["USER", "ADMIN"].includes(user.role));

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const summary = {
    totalUsers: users.length,
    byRole: roleCounts,
    invalidRoleCount: invalidUsers.length,
    invalidRoleUserIds: invalidUsers.map((user) => user.id),
    blockedUsers: users.filter((user) => user.isBlocked).length,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (invalidUsers.length > 0) {
    throw new Error("Invalid roles found. Expected only USER/ADMIN.");
  }
}

main()
  .catch((error) => {
    console.error("ROLE_VERIFICATION_FAILED", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

