import { PrismaClient } from '@prisma/client';
import {
  provinces,
  districts,
  sectors,
  cells,
  villages,
} from './seedData/locationUtil'; // adjust path as needed

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding provinces...');
  for (const province of provinces) {
    await prisma.province.create({
      data: {
        name: province.name,
      },
    });
  }

  console.log('🏙️ Seeding districts...');
  for (const district of districts) {
    const province = await prisma.province.findFirst({
      where: { name: district.province },
    });

    if (!province) {
      console.warn(`❌ Province not found for district: ${district.name}`);
      continue;
    }

    await prisma.district.create({
      data: {
        name: district.name,
        provinceId: province.id,
      },
    });
  }

  console.log('📍 Seeding sectors...');
  for (const sector of sectors) {
    const district = await prisma.district.findFirst({
      where: { name: sector.district },
    });

    if (!district) {
      console.warn(`❌ District not found for sector: ${sector.name}`);
      continue;
    }

    await prisma.sector.create({
      data: {
        name: sector.name,
        districtId: district.id,
      },
    });
  }

  console.log('🏢 Seeding cells...');
  for (const cell of cells) {
    const sector = await prisma.sector.findFirst({
      where: { name: cell.sector },
    });
    if (!sector) {
      console.warn(`❌ Sector not found for cell: ${cell.name}`);
      continue;
    }

    await prisma.cell.create({
      data: {
        name: cell.name,
        sectorId: sector.id,
      },
    });
  }

  console.log('🏘️ Seeding villages...');
  for (const village of villages) {
    const cell = await prisma.cell.findFirst({
      where: { name: village.cell },
    });
    if (!cell) {
      console.warn(`❌ Cell not found for village: ${village.name}`);
      continue;
    }

    await prisma.village.create({
      data: {
        name: village.name,
        cellId: cell.id,
      },
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
