import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

loadLocalEnv();

const PORT = Number(process.env.PORT || 5177);
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8"
};

const systemPrompt = `
你是 WorthMatch 的 AI social concierge，中文名“小云”。

产品判断：
- WorthMatch 不是恋爱交友、不是刷脸、不是大广场。
- 你帮助用户把一句模糊的社交愿望整理成：可发布的搭子邀请、可展示的个人档案、可被匹配系统使用的偏好信号。
- 你像 Perspective AI 的 conversational onboarding：用对话替代表单，但输出必须结构化。
- 你像 BitProfile 的动态 persona：让用户档案可以被理解、被提问、被逐步更新。
- 你像 Meetup 的活动发现：围绕具体时间、地点、场景、人数、边界和能不能成局，而不是泛泛刷人。
- 你像 Headspace Ebb 的 AI 陪伴：克制、透明、保护边界，不做夸张拟人和过度热情。

回答规则：
- 每次自然回复 2-5 句，中文，克制但有洞察。
- 每次最多问 1 个关键追问。
- 优先把用户的话“翻译”为可执行社交结构，而不是泛泛安慰。
- 不要说自己是大模型，不要输出长篇说明。
- 线下相关内容要提醒公共场所、可退出、不要暴露精确住址和隐私联系方式。
- 不要用动物人格、星座、玄学解释用户。

你必须只输出 JSON，不要 Markdown，不要代码块，格式如下：
{
  "reply": "给用户看的自然语言回复",
  "distillation": {
    "intent": "用户此刻最清晰的社交意图",
    "context": ["时间/地点/身份/场景等信号"],
    "boundaries": ["边界或安全偏好"],
    "open_question": "下一步只需要问的一个问题",
    "profile_notes": ["可以沉淀进个人档案的洞察"],
    "confidence": 0.72
  },
  "draft": {
    "title": "如果足够明确，生成一张搭子邀请标题；不明确则为空字符串",
    "summary": "一句话说明这张邀请",
    "time": "时间",
    "place": "地点",
    "group_size": "人数",
    "energy": "安静陪伴/轻松聊天/热闹组局/目标推进",
    "boundaries": ["具体边界"],
    "tags": ["3-5 个标签"]
  }
}
`.trim();

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        model: DEEPSEEK_MODEL,
        ai: DEEPSEEK_KEY ? "deepseek" : "mock"
      });
    }

    if (req.method === "POST" && req.url === "/api/chat") {
      const body = await readJson(req);
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const profile = body.profile || {};
      const latest = String(body.latest || "").slice(0, 1600);

      if (DEEPSEEK_KEY) {
        try {
          const result = await callDeepSeek(messages, profile, latest);
          return sendJson(res, 200, { ...result, source: "deepseek" });
        } catch (error) {
          const fallback = mockCompanionReply(latest, profile);
          return sendJson(res, 200, {
            ...fallback,
            source: "mock-fallback",
            note: "DeepSeek request failed; local concierge logic responded."
          });
        }
      }

      return sendJson(res, 200, { ...mockCompanionReply(latest, profile), source: "mock" });
    }

    if (req.method === "GET") {
      return serveStatic(req, res);
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`WorthMatch prototype running at http://localhost:${PORT}`);
  console.log(`AI mode: ${DEEPSEEK_KEY ? `DeepSeek ${DEEPSEEK_MODEL}` : "local mock"}`);
});

function loadLocalEnv() {
  for (const name of [".env.local", ".env"]) {
    const filePath = path.join(__dirname, name);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

async function callDeepSeek(messages, profile, latest) {
  const compactMessages = messages.slice(-12).map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: String(message.content || "").slice(0, 1400)
  }));

  const profileContext = JSON.stringify(
    {
      name: profile.name || "未填写",
      city: profile.city || "未填写",
      visibility: profile.visibility || "匹配后展示更多",
      notes: profile.notes || [],
      boundaries: profile.boundaries || [],
      needs: profile.needs || [],
      preferences: profile.preferences || {}
    },
    null,
    2
  );

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: `当前用户档案 JSON：\n${profileContext}` },
        ...compactMessages,
        { role: "user", content: latest || "请继续引导我建立 WorthMatch 搭子档案。" }
      ],
      temperature: 0.64,
      max_tokens: 900,
      stream: false
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek request failed: ${response.status} ${text.slice(0, 300)}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty response");
  return normalizeAiPayload(parseJsonPayload(content));
}

function parseJsonPayload(content) {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "string" ? parseJsonPayload(parsed) : parsed;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return {
        reply: content.trim(),
        distillation: {},
        draft: {}
      };
    }
    try {
      const parsed = JSON.parse(match[0]);
      return typeof parsed === "string" ? parseJsonPayload(parsed) : parsed;
    } catch {
      return {
        reply: content.trim(),
        distillation: {},
        draft: {}
      };
    }
  }
}

function normalizeAiPayload(payload) {
  const draft = payload.draft || {};
  const distillation = payload.distillation || {};
  return {
    reply: String(payload.reply || "我先记下这个信号。你可以继续补充时间、地点、人数或边界。").trim(),
    distillation: {
      intent: String(distillation.intent || "").trim(),
      context: asArray(distillation.context),
      boundaries: asArray(distillation.boundaries),
      open_question: String(distillation.open_question || "").trim(),
      profile_notes: asArray(distillation.profile_notes),
      confidence: clampNumber(distillation.confidence, 0.58)
    },
    draft: {
      title: String(draft.title || "").trim(),
      summary: String(draft.summary || "").trim(),
      time: String(draft.time || "").trim(),
      place: String(draft.place || "").trim(),
      group_size: String(draft.group_size || "").trim(),
      energy: String(draft.energy || "").trim(),
      boundaries: asArray(draft.boundaries),
      tags: asArray(draft.tags).slice(0, 5)
    }
  };
}

function mockCompanionReply(input) {
  const text = input.trim();
  const lower = text.toLowerCase();
  const has = (...words) => words.some((word) => lower.includes(word.toLowerCase()) || text.includes(word));

  if (!text) {
    return normalizeAiPayload({
      reply: "可以从一个很小的愿望开始。你不用先解释自己是谁，只要说：你想和别人一起做什么、什么时候做、希望多低压。",
      distillation: {
        intent: "开始建立搭子档案",
        context: [],
        boundaries: [],
        open_question: "你最近最想找人一起做的一件小事是什么？",
        profile_notes: ["希望先通过具体事情建立连接"],
        confidence: 0.58
      },
      draft: {}
    });
  }

  if (has("city walk", "散步", "咖啡", "探店", "逛")) {
    return normalizeAiPayload({
      reply: "我把它理解成一个低压城市陪伴需求：重点不是认识很多人，而是找一个节奏舒服的人一起走一段路。它已经可以发布了，只差确认你想一对一，还是接受 2-3 人小局。",
      distillation: {
        intent: "找一个低压 city walk / 咖啡搭子",
        context: ["周末或下午", "城市散步", "咖啡店作为收尾"],
        boundaries: ["低压", "公共场所", "不强行深聊"],
        open_question: "你更想一对一，还是 2-3 人小局？",
        profile_notes: ["喜欢从具体路线和轻聊天开始关系", "对低压和可退出空间有偏好"],
        confidence: 0.86
      },
      draft: {
        title: "低压 city walk，顺路喝咖啡",
        summary: "找一个节奏松弛的人，走一段路，顺路坐下来聊一会儿。",
        time: "周末下午",
        place: "市区公园 / 安静咖啡店",
        group_size: "1-2 人",
        energy: "轻松聊天",
        boundaries: ["公共场所", "不强行深聊", "可提前结束"],
        tags: ["city walk", "咖啡", "低压", "同城"]
      }
    });
  }

  if (has("自习", "学习", "论文", "图书馆", "资料")) {
    return normalizeAiPayload({
      reply: "这不是普通的学习搭子，更像“低打扰 accountability”。我会把核心写成：一起进入状态，结束时同步一句进度，中途不消耗彼此。下一步只需要确认是固定每周，还是先试一次。",
      distillation: {
        intent: "找低打扰学习 / 自习搭子",
        context: ["图书馆或安静空间", "目标同步", "结束复盘"],
        boundaries: ["中途不聊天", "低打扰", "不比较进度"],
        open_question: "你想先试一次，还是希望做成固定每周？",
        profile_notes: ["适合目标明确但情绪消耗低的陪伴关系"],
        confidence: 0.84
      },
      draft: {
        title: "90 分钟安静自习搭子",
        summary: "开始前各自说目标，结束后同步一句进度，中途不打扰。",
        time: "工作日晚间 / 周末上午",
        place: "图书馆 / 自习室",
        group_size: "1-4 人",
        energy: "安静陪伴",
        boundaries: ["中途不聊天", "不评价进度", "准时开始和结束"],
        tags: ["自习", "低打扰", "目标同步", "复盘"]
      }
    });
  }

  if (has("健身", "运动", "跑步", "羽毛球", "户外", "打卡")) {
    return normalizeAiPayload({
      reply: "这个需求的关键不是“找人运动”，而是避免节奏错配。我会先把强度、频率、取消规则写清楚，这样更容易找到靠谱搭子。你想偏轻松恢复，还是认真打卡？",
      distillation: {
        intent: "找稳定运动搭子",
        context: ["运动或健身", "可能需要固定频率"],
        boundaries: ["提前说强度", "提前说取消规则"],
        open_question: "你想偏轻松恢复，还是认真打卡？",
        profile_notes: ["希望搭子关系能帮助自己推进具体目标"],
        confidence: 0.82
      },
      draft: {
        title: "轻量运动打卡搭子",
        summary: "先试一次，提前说好强度和结束时间，不卷但保持节奏。",
        time: "周末上午 / 工作日晚间",
        place: "健身房 / 操场 / 户外路线",
        group_size: "1-3 人",
        energy: "目标推进",
        boundaries: ["不临时加量", "提前确认强度", "可提前取消"],
        tags: ["运动", "打卡", "稳定", "不卷"]
      }
    });
  }

  if (has("慢热", "尴尬", "边界", "安全", "社恐", "不想", "害怕")) {
    return normalizeAiPayload({
      reply: "我会把这条记成你的匹配边界，而不是把它当成缺点。后续推荐应该优先给你低压、公共场所、可退出、不会上来就高频聊天的人。你第一次见面更能接受白天，还是晚上也可以？",
      distillation: {
        intent: "明确社交边界和安全偏好",
        context: ["慢热", "担心尴尬或压力"],
        boundaries: ["低压", "公共场所", "可退出", "不高频追问"],
        open_question: "你第一次见面更能接受白天，还是晚上也可以？",
        profile_notes: ["需要被尊重边界后才会自然靠近"],
        confidence: 0.79
      },
      draft: {}
    });
  }

  return normalizeAiPayload({
    reply: "我先把你的话压缩成三个信号：你想做的事、你能接受的社交强度、你不希望被打扰的边界。现在最值得补的是一个具体场景，因为 WorthMatch 的匹配不是先找人，而是先把一件事讲清楚。",
    distillation: {
      intent: "形成中的搭子需求",
      context: ["需求还不完整"],
      boundaries: [],
      open_question: "你希望这次搭子关系围绕哪件具体事情开始？",
      profile_notes: ["偏好轻量自然、围绕具体事情开始的关系"],
      confidence: 0.62
    },
    draft: {}
  });
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return [String(value).trim()].filter(Boolean);
}

function clampNumber(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(1, number));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const normalized = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, normalized);

  if (!filePath.startsWith(publicDir)) {
    return sendText(res, 403, "Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      return sendText(res, 404, "Not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}
