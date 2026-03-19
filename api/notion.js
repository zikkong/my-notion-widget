// api/notion.js
// Vercel Serverless Function - 노션 API 프록시
// 환경변수: NOTION_TOKEN, NOTION_DB_ID

export default async function handler(req, res) {
  // CORS 허용
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const TOKEN = process.env.NOTION_TOKEN;
  const DB_ID = process.env.NOTION_DB_ID;

  if (!TOKEN || !DB_ID) {
    return res.status(500).json({
      error: "서버 환경변수가 설정되지 않았습니다. Vercel 대시보드에서 NOTION_TOKEN과 NOTION_DB_ID를 설정해주세요.",
    });
  }

  const notionHeaders = {
    Authorization: `Bearer ${TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  try {
    // 오늘 할 일 목록 가져오기
    if (req.method === "POST" && req.url.includes("/query")) {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${DB_ID}/query`,
        {
          method: "POST",
          headers: notionHeaders,
          body: JSON.stringify(req.body),
        }
      );
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // 체크박스 업데이트
    if (req.method === "PATCH") {
      const pageId = req.query.pageId;
      if (!pageId) return res.status(400).json({ error: "pageId 없음" });

      const response = await fetch(
        `https://api.notion.com/v1/pages/${pageId}`,
        {
          method: "PATCH",
          headers: notionHeaders,
          body: JSON.stringify(req.body),
        }
      );
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(405).json({ error: "허용되지 않는 메서드" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
