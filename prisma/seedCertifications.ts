import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "../src/lib/databaseUrl";

const databaseUrl = getDatabaseUrl();
const prisma = new PrismaClient(
  databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
);

const certificates = [
  {
    slug: "patent-ball-launcher",
    image: "certificate-patent-ball-launcher.png",
    titleKo: "공 자동 투입 및 발사 장치 특허증",
    titleEn: "Automatic Ball Loading and Launching Device Patent",
  },
  {
    slug: "patent-smartfarm-water",
    image: "certificate-patent-smartfarm-water.png",
    titleKo: "물관리장치를 이용한 스마트팜 서비스 제공 시스템 특허증",
    titleEn: "Smart Farm Water Management Service System Patent",
  },
  {
    slug: "trademark-serial-link",
    image: "certificate-trademark-serial-link.png",
    titleKo: "Serial Link 상표등록증",
    titleEn: "Serial Link Trademark Registration",
  },
  {
    slug: "venture-enterprise-certificate",
    image: "certificate-venture-enterprise.png",
    titleKo: "벤처기업확인서",
    titleEn: "Venture Enterprise Certificate",
  },
  {
    slug: "certification-detail-kc-smartfarm-laser",
    image: "certificate-detail-kc-smartfarm-laser.png",
    titleKo: "KC 방송통신기자재 적합등록증 - 스마트팜·레이저 모듈",
    titleEn: "KC Registration - Smart Farm and Laser Modules",
  },
  {
    slug: "certification-detail-kc-controller-board",
    image: "certificate-detail-kc-controller-board.png",
    titleKo: "KC 방송통신기자재 적합등록증 - 모터 컨트롤러·SerialLink Board",
    titleEn: "KC Registration - Motor Controller and SerialLink Board",
  },
  {
    slug: "certification-detail-test-humidity-1",
    image: "certificate-detail-test-humidity-1.png",
    titleKo: "농업기계 성능시험 성적서 - 습도센서",
    titleEn: "Agricultural Machinery Performance Test - Humidity Sensor",
  },
  {
    slug: "certification-detail-test-humidity-temperature",
    image: "certificate-detail-test-humidity-temperature.png",
    titleKo: "농업기계 성능시험 성적서 - 습도·온도센서",
    titleEn: "Agricultural Machinery Performance Test - Humidity and Temperature Sensors",
  },
  {
    slug: "certification-detail-test-temperature",
    image: "certificate-detail-test-temperature.png",
    titleKo: "농업기계 성능시험 성적서 - 온도센서",
    titleEn: "Agricultural Machinery Performance Test - Temperature Sensor",
  },
  {
    slug: "certification-detail-test-ph-1",
    image: "certificate-detail-test-ph-1.png",
    titleKo: "농업기계 성능시험 성적서 - pH센서",
    titleEn: "Agricultural Machinery Performance Test - pH Sensor",
  },
  {
    slug: "certification-detail-test-ph-2",
    image: "certificate-detail-test-ph-2.png",
    titleKo: "농업기계 성능시험 성적서 - pH센서 시험결과",
    titleEn: "Agricultural Machinery Performance Test Results - pH Sensor",
  },
] as const;

async function main() {
  const category = await prisma.promotionCategory.upsert({
    where: { slug: "patents-certifications" },
    update: { nameKo: "특허 · 인증", nameEn: "Patents · Certifications", order: 6 },
    create: {
      slug: "patents-certifications",
      nameKo: "특허 · 인증",
      nameEn: "Patents · Certifications",
      order: 6,
    },
  });

  for (const certificate of certificates) {
    const data = await readFile(path.join(process.cwd(), "public", "images", certificate.image));
    const post = await prisma.promotionPost.upsert({
      where: { slug: certificate.slug },
      update: {
        categoryId: category.id,
        titleKo: certificate.titleKo,
        titleEn: certificate.titleEn,
        contentKo: certificate.titleKo,
        contentEn: certificate.titleEn,
        isPublished: true,
      },
      create: {
        categoryId: category.id,
        slug: certificate.slug,
        titleKo: certificate.titleKo,
        titleEn: certificate.titleEn,
        contentKo: certificate.titleKo,
        contentEn: certificate.titleEn,
        isPublished: true,
      },
    });

    await prisma.$transaction([
      prisma.imageAsset.deleteMany({ where: { promotionPostId: post.id } }),
      prisma.imageAsset.create({
        data: {
          fileName: certificate.image,
          mimeType: "image/png",
          size: data.byteLength,
          data,
          order: 0,
          promotionPostId: post.id,
        },
      }),
    ]);
  }

  const venturePdf = await readFile(
    path.join(process.cwd(), "public", "documents", "venture-enterprise-certificate.pdf"),
  );
  await prisma.downloadResource.upsert({
    where: { slot: "certificate-venture-enterprise" },
    update: {
      titleKo: "벤처기업확인서",
      titleEn: "Venture Enterprise Certificate",
      fileName: "venture-enterprise-certificate.pdf",
      mimeType: "application/pdf",
      size: venturePdf.byteLength,
      data: venturePdf,
      isPublished: true,
    },
    create: {
      slot: "certificate-venture-enterprise",
      titleKo: "벤처기업확인서",
      titleEn: "Venture Enterprise Certificate",
      fileName: "venture-enterprise-certificate.pdf",
      mimeType: "application/pdf",
      size: venturePdf.byteLength,
      data: venturePdf,
      isPublished: true,
      order: 0,
    },
  });

  console.log(`Seeded ${certificates.length} certification posts and their DB images.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
