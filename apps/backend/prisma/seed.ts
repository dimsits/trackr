import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
  const prisma = new PrismaService();

  const seedEmail = 'seed@trackr.dev';
  const seedName = 'Seed User';
  const seedPassword = 'password123';
  const workspaceName = 'Personal';
  const pipelineName = 'Default';
  const stages = ['Interested', 'Applied', 'Interview', 'Offer', 'Rejected'];

  const hashed = await bcrypt.hash(seedPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: { name: seedName, deletedAt: null, hashedPw: hashed },
    create: { email: seedEmail, name: seedName, hashedPw: hashed },
  });

  let workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id, name: workspaceName, deletedAt: null },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: workspaceName, ownerId: user.id },
    });
  }

  await prisma.membership.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: 'OWNER', deletedAt: null },
    create: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' },
  });

  let pipeline = await prisma.pipeline.findFirst({
    where: { workspaceId: workspace.id, isDefault: true, deletedAt: null },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: { workspaceId: workspace.id, name: pipelineName, isDefault: true },
    });
  }

  for (let i = 0; i < stages.length; i++) {
    const position = i + 1;
    const name = stages[i];

    const existingAtPos = await prisma.stage.findUnique({
      where: { pipelineId_position: { pipelineId: pipeline.id, position } },
    });

    if (!existingAtPos) {
      await prisma.stage.create({ data: { pipelineId: pipeline.id, name, position } });
    } else {
      await prisma.stage.update({
        where: { id: existingAtPos.id },
        data: { name, deletedAt: null },
      });
    }
  }

  console.log('✅ Seed complete', {
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
