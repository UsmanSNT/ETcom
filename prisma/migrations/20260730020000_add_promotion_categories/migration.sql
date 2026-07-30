INSERT INTO "PromotionCategory" ("id", "slug", "nameKo", "nameEn", "order")
VALUES
  ('default-promotion-press', 'press', '보도자료', 'Press Releases', 1),
  ('default-promotion-news', 'news', '뉴스', 'News', 2),
  ('default-promotion-events', 'events', '전시회/행사', 'Exhibitions / Events', 3),
  ('default-promotion-media', 'media', '미디어', 'Media', 4),
  ('default-promotion-resources', 'resources', '자료실', 'Resources', 5),
  ('default-promotion-patents', 'patents-certifications', '특허 · 인증', 'Patents · Certifications', 6)
ON CONFLICT ("slug") DO UPDATE SET
  "nameKo" = EXCLUDED."nameKo",
  "nameEn" = EXCLUDED."nameEn",
  "order" = EXCLUDED."order";
