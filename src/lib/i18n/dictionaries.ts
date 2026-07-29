export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export const dictionaries = {
  ko: {
    nav: {
      about: "회사소개",
      business: "사업분야",
      products: "제품소개",
      promotion: "홍보센터",
      contact: "고객센터",
    },
    home: {
      heroTitle: "더 나은 미래를 만드는 기업",
      heroSubtitle: "혁신적인 기술과 신뢰로 고객과 함께 성장합니다.",
      cta: "자세히 보기",
      sectionAbout: "회사소개",
      sectionAboutDesc: "우리는 지속가능한 가치를 창출하는 기업입니다.",
      sectionProducts: "주요 제품",
      sectionPromotion: "홍보센터",
    },
    footer: {
      companyName: "주식회사 뉴홈페이지",
      address: "서울특별시 강남구 테헤란로 123",
      tel: "대표전화",
      email: "이메일",
      rights: "모든 권리 보유.",
    },
    about: {
      title: "회사소개",
      body: "저희 회사는 고객의 성공을 최우선 가치로 삼고, 끊임없는 혁신을 통해 산업을 선도하고 있습니다.",
    },
    business: {
      title: "사업분야",
      body: "다양한 산업 분야에서 전문성을 바탕으로 최고의 솔루션을 제공합니다.",
    },
    products: {
      title: "제품소개",
      empty: "등록된 제품이 없습니다.",
    },
    promotion: {
      title: "홍보센터",
      empty: "등록된 게시글이 없습니다.",
    },
    contact: {
      title: "고객센터",
      name: "이름",
      email: "이메일",
      phone: "연락처",
      message: "문의내용",
      submit: "문의하기",
      success: "문의가 접수되었습니다. 감사합니다.",
      error: "문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.",
    },
  },
  en: {
    nav: {
      about: "About Us",
      business: "Business",
      products: "Products",
      promotion: "Promotion Center",
      contact: "Customer Center",
    },
    home: {
      heroTitle: "Building a Better Future",
      heroSubtitle: "We grow with our customers through innovative technology and trust.",
      cta: "Learn More",
      sectionAbout: "About Us",
      sectionAboutDesc: "We are a company that creates sustainable value.",
      sectionProducts: "Featured Products",
      sectionPromotion: "Promotion Center",
    },
    footer: {
      companyName: "NewHomePage Co., Ltd.",
      address: "123 Teheran-ro, Gangnam-gu, Seoul, Korea",
      tel: "Tel",
      email: "Email",
      rights: "All rights reserved.",
    },
    about: {
      title: "About Us",
      body: "Our company puts customer success first and leads the industry through continuous innovation.",
    },
    business: {
      title: "Business",
      body: "We provide the best solutions based on expertise across various industries.",
    },
    products: {
      title: "Products",
      empty: "No products available.",
    },
    promotion: {
      title: "Promotion Center",
      empty: "No posts available.",
    },
    contact: {
      title: "Customer Center",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      submit: "Submit",
      success: "Your inquiry has been submitted. Thank you.",
      error: "An error occurred while submitting. Please try again.",
    },
  },
} as const;

type DeepString<T> = { [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string };

export type Dictionary = DeepString<(typeof dictionaries)["ko"]>;
