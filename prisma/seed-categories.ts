import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    nameKo: "교육용키트",
    nameEn: "Education Kits",
    order: 1,
    children: [
      { nameKo: "작품용&캡스톤", nameEn: "Project & Capstone", order: 1 },
      { nameKo: "코딩키트", nameEn: "Coding Kits", order: 2 },
      { nameKo: "전자DIY키트", nameEn: "Electronics DIY Kits", order: 3 },
    ],
  },
  {
    nameKo: "산업용제품",
    nameEn: "Industrial Products",
    order: 2,
    children: [
      { nameKo: "데이터로거", nameEn: "Data Loggers", order: 1 },
      { nameKo: "스마트팜", nameEn: "Smart Farm", order: 2 },
      { nameKo: "센서류", nameEn: "Sensors", order: 3 },
      { nameKo: "기타악세사리", nameEn: "Other Accessories", order: 4 },
    ],
  },
  {
    nameKo: "IoT/인공지능개발",
    nameEn: "IoT / AI Development",
    order: 3,
    children: [
      { nameKo: "시리얼링크", nameEn: "Serial Link", order: 1 },
      { nameKo: "모빌리티", nameEn: "Mobility", order: 2 },
    ],
  },
  {
    nameKo: "혁신제품",
    nameEn: "Innovative Products",
    order: 4,
    children: [
      { nameKo: "스마트팜", nameEn: "Smart Farm", order: 1 },
      { nameKo: "교육기자재", nameEn: "Education Equipment", order: 2 },
    ],
  },
  {
    nameKo: "전자부품",
    nameEn: "Electronic Components",
    order: 5,
    children: [
      { nameKo: "보드", nameEn: "Boards", order: 1 },
      { nameKo: "센서", nameEn: "Sensors", order: 2 },
      { nameKo: "모듈", nameEn: "Modules", order: 3 },
      { nameKo: "통신", nameEn: "Communication", order: 4 },
      { nameKo: "모터/관련부품", nameEn: "Motors & Parts", order: 5 },
      { nameKo: "케이블/전선류", nameEn: "Cables & Wires", order: 6 },
      { nameKo: "기타/부품", nameEn: "Other Parts", order: 7 },
    ],
  },
  {
    nameKo: "건축모형/디오라마",
    nameEn: "Architecture Models / Diorama",
    order: 6,
    children: [],
  },
  {
    nameKo: "생활용품/기타",
    nameEn: "Lifestyle / Others",
    order: 7,
    children: [],
  },
];

async function main() {
  // Delete existing categories
  await prisma.productCategory.deleteMany({});

  for (const cat of CATEGORIES) {
    const parent = await prisma.productCategory.create({
      data: { nameKo: cat.nameKo, nameEn: cat.nameEn, order: cat.order },
    });
    for (const child of cat.children) {
      await prisma.productCategory.create({
        data: { nameKo: child.nameKo, nameEn: child.nameEn, order: child.order, parentId: parent.id },
      });
    }
  }
  console.log("Categories seeded successfully");
}

main().finally(() => prisma.$disconnect());
