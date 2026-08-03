/**
 * Seeds the "Key Industries" (주요 적용 분야) section with the 8 default
 * industries and a labeled placeholder image for each, so the admin only
 * needs to swap the pictures.
 *
 * Run: npm run db:seed:key-industries
 * Safe to re-run — it clears and recreates the KeyIndustry rows.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  titleKo: string;
  titleEn: string;
  emoji: string;
  from: string;
  to: string;
};

const INDUSTRIES: Seed[] = [
  { titleKo: "농업 / 스마트팜", titleEn: "Agriculture / Smart Farm", emoji: "🌱", from: "#16a34a", to: "#065f46" },
  { titleKo: "물류 / 운송", titleEn: "Logistics / Transport", emoji: "🚚", from: "#2563eb", to: "#1e3a8a" },
  { titleKo: "제조 / 설비", titleEn: "Manufacturing / Facilities", emoji: "🏭", from: "#64748b", to: "#1e293b" },
  { titleKo: "환경 / 에너지", titleEn: "Environment / Energy", emoji: "♻️", from: "#0d9488", to: "#134e4a" },
  { titleKo: "교육 / 연구", titleEn: "Education / Research", emoji: "🎓", from: "#4f46e5", to: "#312e81" },
  { titleKo: "스마트 시티", titleEn: "Smart City", emoji: "🏙️", from: "#0891b2", to: "#164e63" },
  { titleKo: "국방 / 안전", titleEn: "Defense / Safety", emoji: "🛡️", from: "#475569", to: "#0f172a" },
  { titleKo: "의료 / 헬스케어", titleEn: "Medical / Healthcare", emoji: "🏥", from: "#dc2626", to: "#7f1d1d" },
];

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string),
  );
}

/** Builds a 4:3 placeholder SVG with a gradient, emoji, title and "SAMPLE" note. */
function placeholderSvg(seed: Seed): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${seed.from}"/>
      <stop offset="1" stop-color="${seed.to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <text x="400" y="270" font-size="180" text-anchor="middle" dominant-baseline="central">${seed.emoji}</text>
  <text x="400" y="410" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#ffffff" text-anchor="middle">${escapeXml(seed.titleEn)}</text>
  <text x="400" y="470" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.75)" text-anchor="middle">${escapeXml(seed.titleKo)}</text>
  <text x="400" y="540" font-family="Arial, sans-serif" font-size="16" letter-spacing="3" fill="rgba(255,255,255,0.6)" text-anchor="middle">SAMPLE · 관리자에서 교체하세요</text>
</svg>`;
  return Buffer.from(svg, "utf8");
}

async function main() {
  // Clear existing rows (ImageAsset rows cascade-delete via the relation).
  await prisma.keyIndustry.deleteMany({});

  for (let i = 0; i < INDUSTRIES.length; i++) {
    const seed = INDUSTRIES[i];
    const data = placeholderSvg(seed);
    await prisma.keyIndustry.create({
      data: {
        titleKo: seed.titleKo,
        titleEn: seed.titleEn,
        order: i,
        isPublished: true,
        images: {
          create: {
            fileName: `${seed.titleEn.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-placeholder.svg`,
            mimeType: "image/svg+xml",
            size: data.byteLength,
            data,
            order: 0,
          },
        },
      },
    });
    console.log(`  ✓ ${seed.titleEn}`);
  }

  console.log(`Seeded ${INDUSTRIES.length} key industries with placeholder images.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
