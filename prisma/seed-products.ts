import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const IMG_DIR = "C:/Users/jyh91/OneDrive/바탕 화면/Product image";

const PRODUCTS = [
  { file: "01.jpg", ko: "식물재배 챔버", en: "Plant Growth Chamber" },
  { file: "02.png", ko: "DIY 엘리베이터 키트", en: "DIY Elevator Kit" },
  { file: "03.png", ko: "DIY 컨베이어 벨트 키트", en: "DIY Conveyor Belt Kit" },
  { file: "04.png", ko: "아두이노 코딩 키트", en: "Arduino Coding Kit" },
  { file: "05.png", ko: "DIY 크레인 로봇 키트", en: "DIY Crane Robot Kit" },
  { file: "06.png", ko: "메카넘 휠 로봇 플랫폼", en: "Mecanum Wheel Robot Platform" },
  { file: "07.png", ko: "DIY 집게 로봇 키트", en: "DIY Gripper Robot Kit" },
  { file: "08.png", ko: "RFID 자판기 키트", en: "RFID Vending Machine Kit" },
  { file: "09.jpg", ko: "LED 식물재배기", en: "LED Plant Cultivator" },
  { file: "10.jpg", ko: "스마트 수경재배 시스템", en: "Smart Hydroponic System" },
  { file: "11.jpg", ko: "수경재배 스탠드", en: "Hydroponic Stand" },
  { file: "12.jpg", ko: "태양광 추적 장치", en: "Solar Tracker Device" },
  { file: "13.jpg", ko: "IoT 교육 실습 키트", en: "IoT Education Training Kit" },
  { file: "14.jpg", ko: "아두이노 센서 키트", en: "Arduino Sensor Kit" },
  { file: "15.png", ko: "4족 보행 로봇", en: "Quadruped Walking Robot" },
  { file: "16.png", ko: "LED 전통 한옥 무드등", en: "LED Traditional House Mood Lamp" },
  { file: "17.jpg", ko: "DIY 피아노 키트", en: "DIY Piano Kit" },
  { file: "18.png", ko: "SerialLink 환기 시스템", en: "SerialLink Ventilation System" },
  { file: "19.png", ko: "LED 아크릴 무드등 세트", en: "LED Acrylic Mood Light Set" },
  { file: "20.png", ko: "스마트 화분 관리기", en: "Smart Plant Monitor" },
  { file: "21.jpg", ko: "자동 환기 창문 제어기", en: "Auto Window Ventilation Controller" },
  { file: "22.png", ko: "SerialLink 환기 시스템 B", en: "SerialLink Ventilation System B" },
  { file: "23.jpg", ko: "미니 스마트팜 챔버", en: "Mini Smart Farm Chamber" },
  { file: "24.png", ko: "DIY 공기청정기 키트", en: "DIY Air Purifier Kit" },
  { file: "25.png", ko: "SerialLink 환기 시스템 C", en: "SerialLink Ventilation System C" },
  { file: "26.jpg", ko: "미니 스마트팜 챔버 B", en: "Mini Smart Farm Chamber B" },
  { file: "27.png", ko: "로봇 암 키트", en: "Robot Arm Kit" },
  { file: "28.png", ko: "미세먼지 측정기 키트", en: "Fine Dust Sensor Kit" },
  { file: "29.png", ko: "CNC 미니 조각기", en: "CNC Mini Engraver" },
  { file: "30.png", ko: "초음파 쓰레기통 키트", en: "Ultrasonic Trash Bin Kit" },
  { file: "31.png", ko: "인장 시험기", en: "Tensile Testing Machine" },
  { file: "32.jpg", ko: "자동 환기 창문 제어기 B", en: "Auto Window Ventilation Controller B" },
  { file: "33.jpg", ko: "라즈베리파이 Zero W 키트", en: "Raspberry Pi Zero W Kit" },
  { file: "34.jpg", ko: "스마트 디스플레이 스탠드 A", en: "Smart Display Stand A" },
  { file: "35.jpg", ko: "스마트 디스플레이 스탠드 B", en: "Smart Display Stand B" },
  { file: "36.jpg", ko: "스마트 디스플레이 스탠드 C", en: "Smart Display Stand C" },
  { file: "37.jpg", ko: "스마트 디스플레이 스탠드 D", en: "Smart Display Stand D" },
  { file: "38.jpg", ko: "자동 환기 시스템 모듈", en: "Auto Ventilation System Module" },
  { file: "43.jpg", ko: "DIY 공기청정기", en: "DIY Air Purifier" },
  { file: "44.png", ko: "자율주행 로봇카", en: "Autonomous Robot Car" },
  { file: "45.png", ko: "DIY 디지털 시계 키트", en: "DIY Digital Clock Kit" },
  { file: "46.png", ko: "DIY 블루투스 스피커 키트", en: "DIY Bluetooth Speaker Kit" },
];

function getMime(f: string) {
  return f.endsWith(".png") ? "image/png" : "image/jpeg";
}

async function main() {
  // Find 교육용키트 category
  const eduCat = await prisma.productCategory.findFirst({
    where: { nameKo: "교육용키트", parentId: null },
  });
  if (!eduCat) {
    console.error("교육용키트 category not found");
    return;
  }

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const filePath = path.join(IMG_DIR, p.file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skip: ${p.file} not found`);
      continue;
    }
    const data = fs.readFileSync(filePath);
    const mime = getMime(p.file);

    const product = await prisma.product.create({
      data: {
        titleKo: p.ko,
        titleEn: p.en,
        descriptionKo: p.ko,
        descriptionEn: p.en,
        categoryKo: "교육용키트",
        categoryEn: "Education Kits",
        categoryId: eduCat.id,
        isPublished: true,
        order: i + 1,
      },
    });

    await prisma.imageAsset.create({
      data: {
        fileName: p.file,
        mimeType: mime,
        size: data.length,
        data: data,
        order: 0,
        productId: product.id,
      },
    });

    console.log(`Created: ${p.ko} (${p.file})`);
  }
  console.log("Done! All products seeded.");
}

main().finally(() => prisma.$disconnect());
