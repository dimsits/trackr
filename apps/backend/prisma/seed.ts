import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = getPrisma();

  // ---- CONFIG (edit these if you want) ----
  const seedEmail = 'seed@trackr.dev';
  const seedName = 'Seed User';
  const seedPassword = 'password123'; 
  const workspaceName = 'Personal';
  const pipelineName = 'Default';
  const stages = ['Interested', 'Applied', 'Interview', 'Offer', 'Rejected'];
  const hashed = await bcrypt.hash(seedPassword, 10);

  


  // ---- 1) User (idempotent) ----
  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: {
      name: seedName,
      deletedAt: null,
      hashedPw: hashed,
    },
    create: {
      email: seedEmail,
      name: seedName,
      hashedPw: hashed,
    },
  });

  // ---- 2) Workspace (create if missing) ----
  let workspace = await prisma.workspace.findFirst({
    where: {
      ownerId: user.id,
      name: workspaceName,
      deletedAt: null,
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        ownerId: user.id,
      },
    });
  }

  // ---- 3) Membership OWNER (idempotent) ----
  await prisma.membership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {
      role: 'OWNER',
      deletedAt: null,
    },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  // ---- 4) Default pipeline (one per workspace) ----
  let pipeline = await prisma.pipeline.findFirst({
    where: {
      workspaceId: workspace.id,
      isDefault: true,
      deletedAt: null,
    },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        workspaceId: workspace.id,
        name: pipelineName,
        isDefault: true,
      },
    });
  }

  // ---- 5) Default stages (positions 1..N) ----
  // Ensure all required stage names exist with correct positions.
  for (let i = 0; i < stages.length; i++) {
    const position = i + 1;
    const name = stages[i];

    // Find by (pipelineId, position) due to @@unique([pipelineId, position])
    const existingAtPos = await prisma.stage.findUnique({
      where: {
        pipelineId_position: {
          pipelineId: pipeline.id,
          position,
        },
      },
    });

    if (!existingAtPos) {
      await prisma.stage.create({
        data: {
          pipelineId: pipeline.id,
          name,
          position,
        },
      });
    } else {
      // keep it aligned: update name if needed, un-delete if soft-deleted
      await prisma.stage.update({
        where: { id: existingAtPos.id },
        data: {
          name,
          deletedAt: null,
        },
      });
    }
  }

  console.log('✅ Seed complete');
  console.log({
    userId: user.id,
    workspaceId: workspace.id,
    pipelineId: pipeline.id,
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
