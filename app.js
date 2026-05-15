const state = {
  activeTab: "agent",
  topic: "all",
  sort: "new",
  distance: "all",
  messageFilter: "all",
  selectedChat: null,
  profile: {
    name: "Leo",
    avatarText: "L",
    avatarImage: "",
    bio: "上海 · AI 产品 · 低压社交 · city walk",
    tags: ["公共场所优先", "可自然退出", "低频高质量"],
    completion: 78
  },
  messages: [
    {
      type: "welcome",
      role: "assistant",
      content: "Leo，早上好。你可以直接说一个想找搭子的场景，我会帮你整理成可以发布、可以匹配、也方便开口的版本。",
      suggestions: [
        ["继续完善档案", "补充边界、节奏和可见范围", "帮我从零建立一个搭子档案。"],
        ["发布一个需求", "把模糊想法变成搭子邀请", "我想周六下午找一个低压 city walk 搭子。"],
        ["生成开场白", "给已匹配对象发得自然一点", "帮我写一个不尴尬、有边界感的开场白。"]
      ]
    }
  ],
  draft: null,
  currentPerson: null
};

const threads = [
  ["低压 city walk 搭子", "今天 14:20"],
  ["帮我完善个人档案", "昨天"],
  ["AI 产品共创桌开场", "周三"],
  ["第一次见面边界说明", "上周"]
];

const activities = [
  {
    id: "ab-test",
    type: "test",
    title: "WorthMatch 冷启动 AB Test 体验场",
    label: "官方",
    badge: "AB",
    summary: "体验新版 Agent 建档、活动卡片和消息解锁流程。适合内测用户反馈真实使用感。",
    time: "本周持续开放",
    place: "线上 + 校园用户访谈",
    distance: 0,
    people: "28 人参与",
    tags: ["测试", "反馈", "官方功能"],
    detail: ["完成一次 AI 建档", "从探索页加入一个活动", "体验消息页的信息逐步解锁", "提交 5 分钟反馈"],
    cta: "参加测试"
  },
  {
    id: "city-walk",
    type: "group",
    title: "周六低压 City Walk",
    label: "附近",
    badge: "Sat",
    summary: "不赶路，不打卡，走到舒服的咖啡店就停。适合慢热、想轻松认识人的用户。",
    time: "周六 15:00",
    place: "复兴公园北门",
    distance: 2.4,
    people: "3/5 人",
    tags: ["city walk", "咖啡", "低压"],
    detail: ["15:00 公园北门集合", "先走 40 分钟", "状态舒服再去咖啡店", "18:00 前自然结束"],
    cta: "想一起试试"
  },
  {
    id: "agent-lab",
    type: "official",
    title: "AI Agent 共创桌",
    label: "官方",
    badge: "AI",
    summary: "每人带一个产品问题，让 Agent 帮你整理背景，再和小组一起拆方案。",
    time: "周五 20:00",
    place: "大学路咖啡店",
    distance: 3.1,
    people: "4/6 人",
    tags: ["AI 产品", "脑暴", "小组"],
    detail: ["每人 60 秒介绍问题", "Agent 生成上下文卡", "小组交换建议", "结束时写下一步动作"],
    cta: "加入活动"
  },
  {
    id: "library",
    type: "group",
    title: "90 分钟安静自习搭子",
    label: "附近",
    badge: "90",
    summary: "开始前各自说目标，中途不聊天，结束后同步一句进度。",
    time: "今晚 19:30",
    place: "五角场图书馆",
    distance: 1.2,
    people: "2/4 人",
    tags: ["自习", "低打扰", "复盘"],
    detail: ["19:30 开始", "中途静音", "21:00 同步进度", "不比较效率"],
    cta: "加入自习"
  },
  {
    id: "profile-feature",
    type: "official",
    title: "个人档案卡新功能",
    label: "功能",
    badge: "New",
    summary: "你的主页可以设置展示权限：公开标签、匹配后信息、好友可见动态。",
    time: "刚刚发布",
    place: "App 内功能",
    distance: 0,
    people: "系统提示",
    tags: ["档案", "隐私", "权限"],
    detail: ["设置公开标签", "选择匹配后展示的信息", "控制活动足迹可见性"],
    cta: "去设置"
  }
];

const chats = [
  {
    id: "ari",
    type: "person",
    name: "Ari",
    avatar: "A",
    status: "刚刚在线",
    time: "14:22",
    preview: "我可以接受先走一段，再看要不要去咖啡店。",
    unread: 2,
    tags: ["city walk", "低压", "已匹配"],
    profile: "设计研究生，慢热但很会照顾节奏。参加过 3 次线下低压活动。",
    matchSource: "来自 Agent 生成的低压 city walk 卡片",
    permissions: ["公开标签", "基础介绍", "共同活动"],
    members: [],
    shared: ["复兴公园路线", "周六 15:00", "咖啡店备选"],
    messages: [
      {
        kind: "system",
        title: "Agent 匹配提示",
        text: "你们都选择了公共场所、低压节奏和可自然结束。建议先约 40 分钟路线，不直接交换私人联系方式。",
        chips: ["78% 合拍", "公共场所", "可退出"]
      },
      { who: "them", text: "我看到你也偏好低压 city walk。", time: "14:15" },
      { who: "me", text: "对，我比较希望一开始不要太尬，可以先走一段。", time: "14:17" },
      { who: "them", text: "我可以接受先走一段，再看要不要去咖啡店。", time: "14:22" },
      { kind: "location", who: "them", title: "复兴公园北门", text: "周六 15:00 · 只显示集合点，不暴露住址", time: "14:23" }
    ]
  },
  {
    id: "product-group",
    type: "group",
    name: "AI 产品共创桌",
    avatar: "G",
    time: "昨天",
    preview: "周五每人带一个具体产品问题。",
    unread: 0,
    tags: ["群聊", "活动", "6 人"],
    profile: "由 WorthMatch 官方发起的小组活动，成员信息按活动权限展示。",
    status: "6 人 · 周五 20:00",
    matchSource: "来自探索页官方活动",
    permissions: ["群昵称", "活动问题", "活动后互关"],
    members: ["Leo", "Ari", "Momo", "Rin", "Jade", "Worth"],
    shared: ["活动流程", "问题模板", "到场确认", "复盘链接"],
    messages: [
      {
        kind: "system",
        title: "群聊由活动创建",
        text: "活动开始前只开放昵称、标签和问题方向。结束后双方同意才会解锁更多资料。",
        chips: ["官方活动", "权限保护", "6 人"]
      },
      { who: "them", text: "周五共创桌确认 20:00 开始。", time: "昨天 19:04" },
      { who: "them", text: "大家可以提前把产品问题发给 Agent 整理。", time: "昨天 19:08" },
      {
        kind: "event",
        title: "活动待办",
        text: "带一个具体产品问题；到场后每人 60 秒说明背景；结束时写下一步动作。",
        chips: ["20:00", "大学路咖啡店", "小组讨论"]
      }
    ]
  },
  {
    id: "momo",
    type: "person",
    name: "Momo",
    avatar: "M",
    status: "今天 09:40 在线",
    time: "周三",
    preview: "自习结束后同步一句进度就好。",
    unread: 0,
    tags: ["自习", "低打扰"],
    profile: "准备论文，喜欢低打扰 accountability。",
    matchSource: "来自 90 分钟安静自习搭子",
    permissions: ["公开标签", "基础介绍"],
    members: [],
    shared: ["图书馆座位区", "90 分钟计时", "复盘一句话"],
    messages: [
      { who: "them", text: "如果是图书馆自习，我希望中途不聊天。", time: "周三 10:12" },
      { who: "me", text: "可以，结束后同步一句进度就好。", time: "周三 10:14" },
      {
        kind: "system",
        title: "边界已记录",
        text: "这类搭子建议保留低打扰规则：开始同步目标，中途静音，结束同步一句进度。",
        chips: ["低打扰", "不比较效率"]
      }
    ]
  }
];

const settings = [
  ["profile", "个人档案", "头像、昵称、标签、公开介绍"],
  ["history", "活动足迹", "参与过、浏览过和反馈过的活动"],
  ["bookmark", "收藏", "保存的搭子卡、活动和开场白"],
  ["users", "添加好友方式", "二维码、手机号、校园认证"],
  ["lock", "好友权限", "谁能看主页、活动、动态和标签"],
  ["shield", "隐私设置", "位置、学校、真实姓名和 AI 记忆"],
  ["bell", "通知设置", "匹配、活动、消息和 Agent 提醒"],
  ["shield", "账号与安全", "登录方式、黑名单、举报记录"]
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const dom = {
  chatStream: $("#chatStream"),
  agentForm: $("#agentForm"),
  agentInput: $("#agentInput"),
  agentMode: $("#agentMode"),
  attachMenu: $("#attachMenu"),
  threadDrawer: $("#threadDrawer"),
  threadList: $("#threadList"),
  drawerThreadList: $("#drawerThreadList"),
  activityFeed: $("#activityFeed"),
  activitySearch: $("#activitySearch"),
  detailModal: $("#detailModal"),
  detailCard: $("#detailCard"),
  chatList: $("#chatList"),
  chatRoom: $("#chatRoom"),
  conversationList: $(".conversation-list"),
  roomPerson: $("#roomPerson"),
  roomStream: $("#roomStream"),
  roomForm: $("#roomForm"),
  roomInput: $("#roomInput"),
  roomAttachMenu: $("#roomAttachMenu"),
  infoPanel: $("#infoPanel"),
  infoProfile: $("#infoProfile"),
  settingsList: $("#settingsList"),
  avatarInput: $("#avatarInput"),
  toast: $("#toast")
};

init();

function init() {
  bindEvents();
  renderAgent();
  renderThreads();
  renderActivities();
  renderChats();
  openChat(chats[0].id);
  renderProfile();
  renderSettings();
  checkAiMode();
}

function bindEvents() {
  $$(".app-tabs button, .bottom-nav button").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  dom.agentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = dom.agentInput.value.trim();
    if (!value) return;
    await sendAgentMessage(value);
  });

  $("#attachToggle").addEventListener("click", () => dom.attachMenu.classList.toggle("hidden"));
  $("#voiceButton").addEventListener("click", (event) => {
    event.currentTarget.classList.toggle("listening");
    dom.agentInput.value = "我想用语音说：帮我找一个周末低压活动，但不要太社交。";
    showToast("语音输入原型：已转写到输入框。");
  });

  $("#promptStack").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-prompt]");
    if (!button) return;
    dom.agentInput.value = button.dataset.prompt;
    dom.agentInput.focus();
  });

  dom.attachMenu.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-attach]");
    if (!button) return;
    showToast(`已添加${button.dataset.attach}占位，后续可接上传能力。`);
    dom.attachMenu.classList.add("hidden");
  });

  $("#threadToggle")?.addEventListener("click", () => dom.threadDrawer.classList.remove("hidden"));
  $("#closeDrawer")?.addEventListener("click", () => dom.threadDrawer.classList.add("hidden"));
  $("#newChat").addEventListener("click", resetAgent);
  $("#drawerNewChat").addEventListener("click", resetAgent);

  $("#openFilter").addEventListener("click", () => {
    $(".filter-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("筛选器已在左侧展开。");
  });
  $("#topicRow").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-topic]");
    if (!button) return;
    state.topic = button.dataset.topic;
    $$("#topicRow button").forEach((item) => item.classList.toggle("active", item === button));
    renderActivities();
  });

  $("#sortOptions").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-sort]");
    if (!button) return;
    state.sort = button.dataset.sort;
    $$("#sortOptions button").forEach((item) => item.classList.toggle("active", item === button));
    renderActivities();
  });

  $("#distanceOptions").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-distance]");
    if (!button) return;
    state.distance = button.dataset.distance;
    $$("#distanceOptions button").forEach((item) => item.classList.toggle("active", item === button));
    renderActivities();
  });

  dom.activitySearch.addEventListener("input", renderActivities);
  dom.detailModal.addEventListener("click", (event) => {
    if (event.target === dom.detailModal || event.target.closest("[data-close-detail]")) {
      dom.detailModal.classList.add("hidden");
    }
  });

  $("#backToChats").addEventListener("click", closeChatRoom);
  $("#openPerson").addEventListener("click", () => openPersonProfile(state.selectedChat));
  dom.roomPerson.addEventListener("click", () => openPersonProfile(state.selectedChat));
  $("#messageFilters").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-message-filter]");
    if (!button) return;
    state.messageFilter = button.dataset.messageFilter;
    $$("#messageFilters button").forEach((item) => item.classList.toggle("active", item === button));
    renderChats();
  });
  $("#roomAttach").addEventListener("click", () => dom.roomAttachMenu.classList.toggle("hidden"));
  dom.roomAttachMenu.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-room-attach]");
    if (!button || !state.selectedChat) return;
    handleRoomAttachment(button.dataset.roomAttach);
  });
  dom.roomForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = dom.roomInput.value.trim();
    if (!text || !state.selectedChat) return;
    state.selectedChat.messages.push({ who: "me", text, time: "刚刚" });
    state.selectedChat.preview = text;
    state.selectedChat.time = "刚刚";
    state.selectedChat.unread = 0;
    dom.roomInput.value = "";
    renderRoom(state.selectedChat);
    renderChats();
  });

  $("#addContact").addEventListener("click", () => openUtilityPanel("添加好友方式"));
  $("#editProfile").addEventListener("click", () => openProfileEditor("detail"));
  $("#profileHero").addEventListener("click", (event) => {
    if (event.target.closest("#avatarButton, #nameButton")) return;
    openProfileEditor("detail");
  });
  $("#profileHero").addEventListener("keydown", (event) => {
    if (event.key === "Enter") openProfileEditor("detail");
  });
  $("#avatarButton").addEventListener("click", () => dom.avatarInput.click());
  $("#nameButton").addEventListener("click", () => openProfileEditor("name"));
  dom.avatarInput.addEventListener("change", updateAvatarFromFile);
  $$(".stat-grid button[data-profile-action]").forEach((button) => {
    button.addEventListener("click", () => openUtilityPanel(button.dataset.profileAction));
  });
}

async function checkAiMode() {
  try {
    await fetch("/api/health");
    if (dom.agentMode) dom.agentMode.textContent = "在线 · 可建档";
  } catch {
    if (dom.agentMode) dom.agentMode.textContent = "本地原型";
  }
}

function switchTab(tab) {
  state.activeTab = tab;
  $$(".app-tabs button, .bottom-nav button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === tab));
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  if (tab === "messages") closeChatRoom();
}

async function sendAgentMessage(text) {
  state.messages.push({ role: "user", content: text });
  dom.agentInput.value = "";
  renderAgent();

  const thinking = {
    role: "assistant",
    content: "我先拆解一下，再给你一张可执行卡片。",
    loading: true,
    thinking: ["理解你的真实意图", "判断这个需求适合哪种场景", "整理成卡片和下一步问题"],
    todos: ["提取边界", "生成回复或活动草案"]
  };
  state.messages.push(thinking);
  renderAgent();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latest: text,
        messages: state.messages.filter((message) => !message.loading).slice(-10),
        profile: {
          name: "Leo",
          city: "上海",
          boundaries: ["公共场所优先", "低压", "不想一开始很尴尬"],
          needs: ["周末活动", "city walk", "AI 产品"]
        }
      })
    });
    const data = await response.json();
    state.messages = state.messages.filter((message) => message !== thinking);
    state.messages.push(buildAgentReply(data, text));
  } catch {
    state.messages = state.messages.filter((message) => message !== thinking);
    state.messages.push(mockAgentReply(text));
  }

  renderAgent();
}

function buildAgentReply(data, sourceText) {
  data = coerceAiData(data);
  if (looksLikeRawJson(data.reply)) {
    return mockAgentReply(sourceText);
  }
  const draft = data.draft || {};
  const distillation = data.distillation || {};
  const card = draft.title
    ? {
        title: draft.title,
        summary: draft.summary || "Agent 已经把你的需求整理成可匹配卡片。",
        meta: [
          ["时间", draft.time || "待确认"],
          ["地点", draft.place || "待确认"],
          ["人数", draft.group_size || "待确认"],
          ["强度", draft.energy || "待确认"]
        ],
        tags: [...(draft.tags || []), ...(draft.boundaries || [])].slice(0, 7)
      }
    : {
        title: "需求还需要再补一笔",
        summary: distillation.open_question || "Agent 已提取到初步意图，但还需要确认一个关键信息。",
        meta: [
          ["意图", distillation.intent || sourceText],
          ["置信度", `${Math.round((distillation.confidence || 0.62) * 100)}%`]
        ],
        tags: [...(distillation.context || []), ...(distillation.boundaries || [])].slice(0, 6)
      };

  state.draft = card;
  return {
    role: "assistant",
    content: data.reply || "我整理好了，可以继续补充时间、地点和边界。",
    thinking: ["提取用户意图", "压缩为匹配字段", "生成下一步行动"],
    todos: [distillation.open_question || "确认时间地点", "决定是否发布到探索页"],
    card,
    actions: ["发布到探索", "帮我改得更轻松", "生成给对方的开场白"]
  };
}

function looksLikeRawJson(value) {
  if (typeof value !== "string") return false;
  const text = value.trim();
  return text.startsWith("{") || text.startsWith('"{') || text.includes('\\"reply\\"') || text.includes('"reply"');
}

function coerceAiData(data) {
  let candidate = data;
  for (let i = 0; i < 2; i++) {
    if (typeof candidate?.reply !== "string") break;
    let text = candidate.reply.trim();
    if (text.startsWith('"')) {
      try {
        text = JSON.parse(text);
      } catch {
        break;
      }
    }
    if (!text.startsWith("{")) break;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        candidate = { ...candidate, ...parsed };
      }
    } catch {
      break;
    }
  }
  return candidate;
}

function mockAgentReply(text) {
  const isWalk = /walk|散步|咖啡|低压|尴尬/i.test(text);
  const card = isWalk
    ? {
        title: "低压 city walk，顺路喝咖啡",
        summary: "适合慢热用户的轻量见面：先走一段，舒服再坐下聊。",
        meta: [
          ["时间", "周末下午"],
          ["地点", "公共路线 + 咖啡店"],
          ["人数", "1-3 人"],
          ["强度", "轻松聊天"]
        ],
        tags: ["city walk", "低压", "公共场所", "可退出"]
      }
    : {
        title: "一张形成中的搭子卡",
        summary: "Agent 已经记录你的意图，还需要确认场景和时间。",
        meta: [
          ["下一步", "确认活动场景"],
          ["边界", "低压优先"]
        ],
        tags: ["建档", "待确认"]
      };
  state.draft = card;
  return {
    role: "assistant",
    content: isWalk ? "我会把重点放在“低压”和“可自然结束”上，这样第一次见面不会太重。" : "我先把它作为一个形成中的需求，继续补充一点场景就能生成卡片。",
    thinking: ["识别需求", "提取边界", "生成卡片"],
    todos: ["确认时间", "确认是否发布"],
    card,
    actions: ["发布到探索", "继续补充", "生成开场白"]
  };
}

function renderAgent() {
  dom.chatStream.innerHTML = state.messages.map(renderAgentMessage).join("");
  dom.chatStream.querySelectorAll("[data-agent-action]").forEach((button) => {
    button.addEventListener("click", () => handleAgentAction(button.dataset.agentAction));
  });
  requestAnimationFrame(() => {
    dom.chatStream.scrollTop = dom.chatStream.scrollHeight;
  });
}

function renderAgentMessage(message) {
  if (message.type === "welcome") return renderAgentWelcome(message);
  const label = message.role === "user" ? "你" : "Worth Agent";
  return `
    <article class="message ${message.role}">
      <div class="message-label">${label}</div>
      <div class="bubble">
        ${escapeHtml(message.content)}
        ${message.thinking ? renderThinking(message.thinking) : ""}
        ${message.todos ? renderTodos(message.todos) : ""}
        ${message.card ? renderAgentCard(message.card) : ""}
        ${message.actions ? renderActions(message.actions) : ""}
      </div>
    </article>
  `;
}

function renderAgentWelcome(message) {
  return `
    <article class="agent-welcome">
      <p>${escapeHtml(message.content)}</p>
      <div class="welcome-actions">
        ${(message.suggestions || [])
          .map(
            ([title, desc, prompt], index) => `
              <button class="welcome-card tone-${index + 1}" data-agent-action="${escapeHtml(prompt)}">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(desc)}</span>
              </button>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderThinking(items) {
  return `
    <div class="thinking-card">
      <strong>思考过程</strong>
      <ol>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>
  `;
}

function renderTodos(items) {
  return `
    <div class="todo-card">
      <strong>待办</strong>
      <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderAgentCard(card) {
  return `
    <div class="agent-card">
      <strong>标准化卡片</strong>
      <div class="agent-card-cover">
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.summary)}</p>
      </div>
      <div class="meta-grid">${(card.meta || []).map(([k, v]) => metaCell(k, v)).join("")}</div>
      <div class="chip-row">${renderChips(card.tags || [])}</div>
    </div>
  `;
}

function renderActions(actions) {
  return `
    <div class="agent-actions">
      ${actions.map((action, index) => `<button class="${index === 0 ? "primary" : ""}" data-agent-action="${escapeHtml(action)}">${escapeHtml(action)}</button>`).join("")}
    </div>
  `;
}

function handleAgentAction(action) {
  if (action === "发布到探索") {
    if (!state.draft) return showToast("还没有可发布卡片。");
    activities.unshift({
      id: `draft-${Date.now()}`,
      type: "group",
      title: state.draft.title,
      label: "草案",
      badge: "Me",
      summary: state.draft.summary,
      time: state.draft.meta?.find(([key]) => key === "时间")?.[1] || "待确认",
      place: state.draft.meta?.find(([key]) => key === "地点")?.[1] || "待确认",
      distance: 0,
      people: "待发布",
      tags: state.draft.tags || [],
      detail: ["确认发布范围", "等待系统推荐合适用户", "匹配成功后进入消息页"],
      cta: "继续编辑"
    });
    switchTab("explore");
    renderActivities();
    showToast("已把 Agent 卡片放到探索页顶部。");
    return;
  }
  dom.agentInput.value = action === "生成给对方的开场白" ? "帮我写一个自然、有边界感、不尴尬的开场白。" : action;
  dom.agentInput.focus();
}

function resetAgent() {
  state.messages = [state.messages[0]];
  state.draft = null;
  dom.threadDrawer.classList.add("hidden");
  renderAgent();
  showToast("已新建对话。");
}

function renderThreads() {
  const html = threads
    .map(([title, time]) => `<button class="thread-item"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(time)}</span></button>`)
    .join("");
  if (dom.threadList) dom.threadList.innerHTML = html;
  if (dom.drawerThreadList) dom.drawerThreadList.innerHTML = html;
}

function renderActivities() {
  const query = dom.activitySearch.value.trim().toLowerCase();
  let list = activities.filter((activity) => {
    const topicPass = state.topic === "all" || activity.type === state.topic || activity.label === state.topic;
    const queryPass = !query || `${activity.title} ${activity.summary} ${activity.tags.join(" ")}`.toLowerCase().includes(query);
    const distancePass = state.distance === "all" || activity.distance <= Number(state.distance);
    return topicPass && queryPass && distancePass;
  });
  if (state.sort === "near") list = list.sort((a, b) => a.distance - b.distance);
  if (state.sort === "soon") list = list.sort((a, b) => a.time.localeCompare(b.time, "zh-CN"));

  dom.activityFeed.innerHTML = list.map(renderActivity).join("");
  dom.activityFeed.querySelectorAll("[data-open-activity]").forEach((button) => {
    button.addEventListener("click", () => openActivity(button.dataset.openActivity));
  });
  dom.activityFeed.querySelectorAll("[data-join-activity]").forEach((button) => {
    button.addEventListener("click", () => joinActivity(button.dataset.joinActivity));
  });
}

function renderActivity(activity) {
  return `
    <article class="activity-card">
      <div class="activity-cover">
        <div class="activity-label">${escapeHtml(activity.label)} · ${escapeHtml(activity.badge)}</div>
        <h3>${escapeHtml(activity.title)}</h3>
      </div>
      <div class="activity-body">
        <p>${escapeHtml(activity.summary)}</p>
        <div class="chip-row">${renderChips(activity.tags)}</div>
        <div class="activity-meta">
          ${metaCell("时间", activity.time)}
          ${metaCell("地点", activity.place)}
          ${metaCell("距离", activity.distance ? `${activity.distance} km` : "线上/系统")}
          ${metaCell("人数", activity.people)}
        </div>
        <div class="activity-actions">
          <button data-open-activity="${activity.id}">展开</button>
          <button class="primary" data-join-activity="${activity.id}">${escapeHtml(activity.cta)}</button>
        </div>
      </div>
    </article>
  `;
}

function openActivity(id) {
  const activity = activities.find((item) => item.id === id);
  if (!activity) return;
  dom.detailCard.innerHTML = `
    <button class="modal-close" data-close-detail>关闭</button>
    <div>
      <div class="activity-label">${escapeHtml(activity.label)} · ${escapeHtml(activity.time)}</div>
      <h2>${escapeHtml(activity.title)}</h2>
    </div>
    <p>${escapeHtml(activity.summary)}</p>
    <div class="chip-row">${renderChips(activity.tags)}</div>
    <div class="detail-block">
      <strong>活动流程</strong>
      <ol>${activity.detail.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>
    <div class="detail-block">
      <strong>加入前确认</strong>
      <ul>
        <li>是否接受当前时间和地点</li>
        <li>是否需要先和 Agent 生成开场白</li>
        <li>是否愿意公开必要的匹配信息</li>
      </ul>
    </div>
    <div class="detail-actions">
      <button data-close-detail>先返回</button>
      <button class="primary" data-modal-join="${activity.id}">${escapeHtml(activity.cta)}</button>
    </div>
  `;
  dom.detailCard.querySelector("[data-modal-join]").addEventListener("click", () => joinActivity(activity.id));
  dom.detailModal.classList.remove("hidden");
}

function joinActivity(id) {
  const activity = activities.find((item) => item.id === id);
  if (!activity) return;
  dom.detailModal.classList.add("hidden");
  state.messages.push({
    role: "assistant",
    content: `我已经把「${activity.title}」带回 Agent。你可以让我继续生成报名理由、开场白，或者整理你的边界。`,
    thinking: ["读取活动信息", "匹配你的档案边界", "准备消息页开场"],
    todos: ["确认是否报名", "生成第一句话"],
    card: {
      title: activity.title,
      summary: activity.summary,
      meta: [
        ["时间", activity.time],
        ["地点", activity.place],
        ["人数", activity.people]
      ],
      tags: activity.tags
    },
    actions: ["生成给组织者的开场白", "发布到探索", "我想先收藏"]
  });
  switchTab("agent");
  renderAgent();
}

function renderChats() {
  const list = chats.filter((chat) => {
    if (state.messageFilter === "unread") return chat.unread > 0;
    if (state.messageFilter === "group") return chat.type === "group";
    return true;
  });

  dom.chatList.innerHTML = list
    .map(
      (chat) => `
      <button class="chat-item ${state.selectedChat?.id === chat.id ? "active" : ""}" data-chat="${chat.id}">
        <div class="avatar ${chat.type === "group" ? "group-avatar" : ""}">${escapeHtml(chat.avatar)}</div>
        <div class="chat-copy">
          <strong>${escapeHtml(chat.name)}</strong>
          <span>${escapeHtml(chat.preview)}</span>
          <small>${renderInlineTags(chat.tags.slice(0, 2))}</small>
        </div>
        <div class="chat-meta">
          <time>${escapeHtml(chat.time)}</time>
          ${chat.unread ? `<i class="chat-unread">${chat.unread}</i>` : ""}
        </div>
      </button>
    `
    )
    .join("");
  dom.chatList.querySelectorAll("[data-chat]").forEach((button) => {
    button.addEventListener("click", () => openChat(button.dataset.chat));
  });
}

function openChat(id) {
  const chat = chats.find((item) => item.id === id);
  if (!chat) return;
  state.selectedChat = chat;
  chat.unread = 0;
  renderChats();
  dom.conversationList?.classList.add("hidden-mobile");
  dom.chatRoom.classList.add("active-mobile");
  renderRoom(chat);
  renderInfoPanel(chat);
}

function closeChatRoom() {
  dom.chatRoom.classList.remove("active-mobile");
  dom.conversationList?.classList.remove("hidden-mobile");
}

function renderRoom(chat) {
  dom.roomPerson.innerHTML = `
    <span class="avatar ${chat.type === "group" ? "group-avatar" : ""}">${escapeHtml(chat.avatar)}</span>
    <span class="identity-copy">
      <b>${escapeHtml(chat.name)}</b>
      <small>${escapeHtml(chat.status || chat.matchSource || "匹配会话")}</small>
    </span>
  `;
  dom.roomStream.innerHTML = `
    <div class="day-separator">今天</div>
    ${chat.messages.map(renderRoomMessage).join("")}
  `;
  dom.roomAttachMenu.classList.add("hidden");
  requestAnimationFrame(() => {
    dom.roomStream.scrollTop = dom.roomStream.scrollHeight;
  });
}

function renderInfoPanel(chat) {
  if (!dom.infoPanel || !chat) return;
  const members = chat.type === "group" ? chat.members : ["Leo", chat.name];
  dom.infoPanel.innerHTML = `
    <section class="info-profile">
      <div class="avatar ${chat.type === "group" ? "group-avatar" : ""}">${escapeHtml(chat.avatar)}</div>
      <h2>${escapeHtml(chat.name)}</h2>
      <span class="info-status">${escapeHtml(chat.matchSource)}</span>
      <p>${escapeHtml(chat.profile)}</p>
      <div class="chip-row">${renderChips(chat.tags)}</div>
    </section>
      <section class="info-section">
        <strong>聊天功能</strong>
      <button data-info-action="成员列表">${icon("users")}<span>成员列表</span></button>
      <button data-info-action="共享媒体">${icon("photo")}<span>共享媒体、链接与文件</span></button>
      <button data-info-action="活动记录">${icon("calendar")}<span>共同活动记录</span></button>
      <button data-info-action="权限设置">${icon("lock")}<span>资料可见权限</span></button>
    </section>
    <section class="unlock-list">
      <strong>当前可见信息</strong>
      ${chat.permissions.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </section>
    <section class="member-list">
      <strong>${chat.type === "group" ? "群成员" : "会话成员"}</strong>
      <div>${members.map((item) => `<span class="member-pill"><i>${escapeHtml(item.slice(0, 1))}</i><b>${escapeHtml(item)}</b></span>`).join("")}</div>
    </section>
    <section class="shared-stack">
      <strong>共享内容</strong>
      ${chat.shared.map((item) => `<button class="shared-card" data-info-action="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
    </section>
  `;
  dom.infoPanel.querySelectorAll("[data-info-action]").forEach((button) => {
    button.addEventListener("click", () => showToast(`${button.dataset.infoAction}：这是可接后端的真实入口。`));
  });
}

function renderRoomMessage(message) {
  const item = Array.isArray(message) ? { who: message[0], text: message[1] } : message;
  const avatarText = item.who === "me" ? state.profile.avatarText : state.selectedChat?.avatar || "W";
  const avatarStyle = item.who === "me" && state.profile.avatarImage ? ` style="background-image:url('${escapeHtml(state.profile.avatarImage)}')"` : "";
  const avatarClass = item.who === "me" && state.profile.avatarImage ? "room-avatar image-avatar" : "room-avatar";
  if (item.kind === "system" || item.kind === "event") {
    return `
      <article class="room-system ${item.kind === "event" ? "event" : ""}">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.text)}</p>
        <div class="chip-row">${renderChips(item.chips || [])}</div>
      </article>
    `;
  }
  if (item.kind === "location") {
    return `
      <article class="room-row ${item.who === "me" ? "me" : ""}">
        <span class="${avatarClass}"${avatarStyle}>${state.profile.avatarImage && item.who === "me" ? "" : escapeHtml(avatarText)}</span>
        <div class="room-location">
          <div class="location-map"><span></span></div>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.text)}</p>
            <small>${escapeHtml(item.time || "")}</small>
          </div>
        </div>
      </article>
    `;
  }
  return `
    <article class="room-row ${item.who === "me" ? "me" : ""}">
      <span class="${avatarClass}"${avatarStyle}>${state.profile.avatarImage && item.who === "me" ? "" : escapeHtml(avatarText)}</span>
      <div class="room-bubble ${item.who === "me" ? "me" : ""}">
        ${escapeHtml(item.text)}
        ${item.time ? `<small>${escapeHtml(item.time)}</small>` : ""}
      </div>
    </article>
  `;
}

function handleRoomAttachment(type) {
  dom.roomAttachMenu.classList.add("hidden");
  if (type === "AI润色") {
    dom.roomInput.value = "帮我把这句话改得自然、有边界感、不像群发：";
    dom.roomInput.focus();
    showToast("AI 润色已放入输入框。");
    return;
  }
  const attachmentText = {
    照片: "照片上传位：可用于活动现场、头像或氛围图。",
    文件: "文件上传位：可用于简历、PDF、活动资料。",
    位置: "位置共享预览：只显示大致区域和集合点，不暴露住址。",
    日程: "日程卡片：可选择空闲时间并发起确认。",
    语音: "语音输入原型：后续接入转写后再发送。"
  }[type];
  state.selectedChat.messages.push({
    kind: type === "位置" ? "location" : "system",
    who: "me",
    title: type === "位置" ? "大致位置共享" : `${type}附件`,
    text: attachmentText,
    time: "刚刚",
    chips: [type, "原型入口"]
  });
  state.selectedChat.preview = attachmentText;
  state.selectedChat.time = "刚刚";
  renderRoom(state.selectedChat);
  renderChats();
}

function openPersonProfile(chat) {
  if (!chat) return;
  const members = chat.type === "group" ? chat.members : ["Leo", chat.name];
  dom.detailCard.innerHTML = `
    <button class="modal-close" data-close-detail>关闭</button>
    <div class="chat-detail-head">
      <div class="avatar ${chat.type === "group" ? "group-avatar" : ""}">${escapeHtml(chat.avatar)}</div>
      <div>
        <div class="activity-label">${chat.type === "group" ? "Group info" : "Profile info"}</div>
        <h2>${escapeHtml(chat.name)}</h2>
        <p>${escapeHtml(chat.status || chat.matchSource)}</p>
      </div>
    </div>
    <div class="chip-row">${renderChips(chat.tags)}</div>
    <section class="detail-block">
      <strong>${chat.type === "group" ? "参与者" : "会话成员"}</strong>
      <div class="member-list-inline">
        ${members.map((item) => `<button data-close-detail><i>${escapeHtml(item.slice(0, 1))}</i><span>${escapeHtml(item)}</span></button>`).join("")}
      </div>
    </section>
    <section class="detail-block">
      <strong>资料与权限</strong>
      <div class="setting-mini-list">
        <button>${icon("lock")}<span>资料可见范围</span><b>匹配后展示基础介绍</b></button>
        <button>${icon("photo")}<span>共享媒体</span><b>${chat.shared.length} 项内容</b></button>
        <button>${icon("calendar")}<span>共同活动</span><b>${escapeHtml(chat.tags[0] || "暂无")}</b></button>
        <button>${icon("shield")}<span>隐私与举报</span><b>可屏蔽、可举报</b></button>
      </div>
    </section>
    <section class="detail-block">
      <strong>简介</strong>
      <p>${escapeHtml(chat.profile)}</p>
    </section>
    <div class="detail-actions">
      <button data-close-detail>返回聊天</button>
      <button class="primary" data-close-detail>保存设置</button>
    </div>
  `;
  dom.detailModal.classList.remove("hidden");
}

function renderSettings() {
  dom.settingsList.innerHTML = settings
    .map(
      ([iconName, title, desc]) => `
        <button class="setting-item" data-setting="${escapeHtml(title)}">
          <span class="setting-symbol">${icon(iconName)}</span>
          <div>
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(desc)}</span>
          </div>
          ${icon("chevron")}
        </button>
      `
    )
    .join("");
  dom.settingsList.querySelectorAll("[data-setting]").forEach((button) => {
    button.addEventListener("click", () => openUtilityPanel(button.dataset.setting));
  });
}

function renderProfile() {
  const avatarButton = $("#avatarButton");
  const nameButton = $("#nameButton");
  const profileHero = $("#profileHero");
  if (!avatarButton || !nameButton || !profileHero) return;
  avatarButton.querySelector("span").textContent = state.profile.avatarText;
  avatarButton.classList.toggle("has-image", Boolean(state.profile.avatarImage));
  avatarButton.style.backgroundImage = state.profile.avatarImage ? `url('${state.profile.avatarImage}')` : "";
  nameButton.textContent = state.profile.name;
  profileHero.querySelector("p").textContent = state.profile.bio;
  profileHero.querySelector(".profile-tags").innerHTML = state.profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  profileHero.querySelector(".profile-completion b").textContent = `${state.profile.completion}%`;
  $(".top-status span").textContent = `档案 ${state.profile.completion}%`;
}

function updateAvatarFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.profile.avatarImage = String(reader.result || "");
    renderProfile();
    showToast("头像已更新在当前原型中。");
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function openProfileEditor(mode = "detail") {
  const isName = mode === "name";
  dom.detailCard.innerHTML = `
    <button class="modal-close" data-close-detail>关闭</button>
    <div class="profile-edit-head">
      <div class="avatar ${state.profile.avatarImage ? "image-avatar" : ""}" ${state.profile.avatarImage ? `style="background-image:url('${escapeHtml(state.profile.avatarImage)}')"` : ""}>${state.profile.avatarImage ? "" : escapeHtml(state.profile.avatarText)}</div>
      <div>
        <div class="activity-label">Edit profile</div>
        <h2>${isName ? "修改昵称" : "详细资料"}</h2>
        <p>这里是后续接真实用户资料接口的位置。</p>
      </div>
    </div>
    <div class="profile-form">
      <label><span>昵称</span><input id="profileNameInput" value="${escapeHtml(state.profile.name)}" /></label>
      <label><span>一句话介绍</span><input id="profileBioInput" value="${escapeHtml(state.profile.bio)}" /></label>
      <label><span>公开标签</span><input id="profileTagsInput" value="${escapeHtml(state.profile.tags.join("，"))}" /></label>
    </div>
    <div class="detail-block">
      <strong>资料完整度建议</strong>
      <ul>
        <li>补充你愿意公开的活动偏好。</li>
        <li>设置匹配后才展示的信息。</li>
        <li>明确第一次见面的安全边界。</li>
      </ul>
    </div>
    <div class="detail-actions">
      <button data-close-detail>取消</button>
      <button class="primary" id="saveProfileEdit">保存</button>
    </div>
  `;
  $("#saveProfileEdit").addEventListener("click", () => {
    state.profile.name = $("#profileNameInput").value.trim() || "Leo";
    state.profile.avatarText = state.profile.name.slice(0, 1).toUpperCase();
    state.profile.bio = $("#profileBioInput").value.trim() || state.profile.bio;
    state.profile.tags = $("#profileTagsInput").value
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);
    renderProfile();
    dom.detailModal.classList.add("hidden");
    showToast("个人资料已更新。");
  });
  dom.detailModal.classList.remove("hidden");
  requestAnimationFrame(() => $("#profileNameInput")?.focus());
}

function openUtilityPanel(title) {
  const panels = {
    参与过: ["WorthMatch AB Test 体验场", "低压 City Walk", "90 分钟安静自习"],
    收藏: ["低压 city walk 开场白", "AI 产品共创桌", "复兴公园咖啡路线"],
    浏览记录: ["个人档案卡新功能", "五角场自习搭子", "周六低压 City Walk"],
    好友: ["Ari", "Momo", "AI 产品共创桌"],
    添加好友方式: ["二维码名片", "手机号搜索", "校园认证", "活动后互关"],
    个人档案: ["头像与昵称", "公开标签", "当前想找的搭子", "AI 记忆"],
    活动足迹: ["参与过", "浏览过", "反馈过"],
    好友权限: ["公开信息", "匹配后可见", "好友可见"],
    隐私设置: ["位置范围", "学校与真实姓名", "AI 记忆使用"],
    通知设置: ["匹配提醒", "活动提醒", "消息提醒", "Agent 提醒"],
    账号与安全: ["登录方式", "黑名单", "举报记录"]
  };
  const items = panels[title] || ["功能入口已预留", "后续连接真实后端", "支持继续扩展"];
  dom.detailCard.innerHTML = `
    <button class="modal-close" data-close-detail>关闭</button>
    <div>
      <div class="activity-label">WorthMatch</div>
      <h2>${escapeHtml(title)}</h2>
    </div>
    <div class="setting-mini-list utility-list">
      ${items.map((item, index) => `<button>${icon(index % 2 ? "chevron" : "template")}<span>${escapeHtml(item)}</span><b>可点击入口</b></button>`).join("")}
    </div>
    <div class="detail-actions">
      <button data-close-detail>返回</button>
      <button class="primary" data-close-detail>完成</button>
    </div>
  `;
  dom.detailModal.classList.remove("hidden");
}

function metaCell(label, value) {
  return `<div class="meta-cell"><span>${escapeHtml(label)}</span><b>${escapeHtml(value || "待确认")}</b></div>`;
}

function renderChips(tags = []) {
  const tones = ["green", "blue", "coral", "yellow", "violet"];
  return tags
    .slice(0, 8)
    .map((tag, index) => `<span class="chip ${tones[index % tones.length]}">${escapeHtml(tag)}</span>`)
    .join("");
}

function renderInlineTags(tags = []) {
  return tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join("");
}

function icon(name) {
  return `<svg class="icon"><use href="./assets/icons/wm-icons.svg#${escapeHtml(name)}"></use></svg>`;
}

function showToast(text) {
  dom.toast.textContent = text;
  dom.toast.classList.add("visible");
  window.setTimeout(() => dom.toast.classList.remove("visible"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
