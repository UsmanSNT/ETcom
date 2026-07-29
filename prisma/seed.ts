import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    titleKo: "스마트팜 통합 제어 시스템",
    titleEn: "Smart Farm Integrated Control System",
    categoryKo: "스마트팜",
    categoryEn: "Smart Farm",
    price: 2980000,
    thumbnailUrl: "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?w=600&q=80",
    descriptionKo: "온실/재배 환경을 통합 제어하고 원격 모니터링하는 솔루션입니다.",
    descriptionEn: "A solution for integrated control and remote monitoring of greenhouse environments.",
  },
  {
    titleKo: "GPS 위치추적기",
    titleEn: "GPS Tracker",
    categoryKo: "위치추적기",
    categoryEn: "Tracker",
    price: 198000,
    thumbnailUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=600&q=80",
    descriptionKo: "LTE 기반 실시간 위치 추적 및 관제 솔루션입니다.",
    descriptionEn: "LTE-based real-time location tracking and control solution.",
  },
  {
    titleKo: "원격 모니터링 장치",
    titleEn: "Remote Monitoring Device",
    categoryKo: "모니터링 장치",
    categoryEn: "Monitoring",
    price: 89000,
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    descriptionKo: "산업 설비의 데이터를 수집하고 원격으로 모니터링하는 장치입니다.",
    descriptionEn: "A device that collects industrial equipment data for remote monitoring.",
  },
  {
    titleKo: "온습도 CO2 측정기",
    titleEn: "Temp/Humidity/CO2 Sensor",
    categoryKo: "환경 센서",
    categoryEn: "Sensor",
    price: 165000,
    thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80",
    descriptionKo: "온습도, CO2, 조도, 수질 등 다양한 환경 센서 라인업입니다.",
    descriptionEn: "A sensor lineup covering temperature, humidity, CO2, light and water quality.",
  },
  {
    titleKo: "식물재배 챔버",
    titleEn: "Plant Cultivation Chamber",
    categoryKo: "스마트팜",
    categoryEn: "Smart Farm",
    price: 1650000,
    thumbnailUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
    descriptionKo: "연구 및 실험을 위한 스마트 식물 재배 시스템입니다.",
    descriptionEn: "A smart plant cultivation system for research and experimentation.",
  },
  {
    titleKo: "식물생장 LED",
    titleEn: "Plant Growth LED",
    categoryKo: "LED",
    categoryEn: "LED",
    price: 128000,
    thumbnailUrl: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600&q=80",
    descriptionKo: "식물 생장에 최적화된 고효율 LED 조명입니다.",
    descriptionEn: "High-efficiency LED lighting optimized for plant growth.",
  },
];

const NEWS = [
  {
    titleKo: "IoT 데이터로거 '시리얼링크' APP 출시",
    titleEn: "Launched IoT Data Logger 'SerialLink' App",
    contentKo: "식물생장 LED 신제품과 함께 스마트 데이터 관리의 새로운 기준을 제시합니다.",
    contentEn: "Sets a new standard for smart data management, alongside our new plant-growth LED product.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  },
  {
    titleKo: "스마트팜 통합 환경 제어기 신제품 출시",
    titleEn: "New Smart Farm Integrated Environment Controller Released",
    contentKo: "최적의 환경 관리로 생산성 향상과 에너지 효율을 동시에 실현합니다.",
    contentEn: "Achieves both improved productivity and energy efficiency through optimal environment control.",
    thumbnailUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
  },
  {
    titleKo: "AFPRO 2026 전시회 참가 보고서",
    titleEn: "AFPRO 2026 Exhibition Report",
    contentKo: "AI 기반 탐지 정확도 향상과 원격 제어 기능을 추가하여 실증 운영을 확대합니다.",
    contentEn: "Expanding field operations with improved AI-based detection accuracy and remote control features.",
    thumbnailUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&q=80",
  },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@newhomepage.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin1234!";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Admin", role: "admin" },
  });

  const category = await prisma.promotionCategory.upsert({
    where: { slug: "news" },
    update: {},
    create: { slug: "news", nameKo: "뉴스", nameEn: "News", order: 0 },
  });

  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    for (let i = 0; i < PRODUCTS.length; i++) {
      await prisma.product.create({ data: { ...PRODUCTS[i], order: i } });
    }
  }

  const existingPosts = await prisma.promotionPost.count();
  if (existingPosts === 0) {
    for (const post of NEWS) {
      await prisma.promotionPost.create({
        data: { ...post, categoryId: category.id },
      });
    }
  }

  console.log(`Seeded admin user: ${email} / ${password}`);
  console.log(`Seeded ${PRODUCTS.length} products and ${NEWS.length} news posts.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
