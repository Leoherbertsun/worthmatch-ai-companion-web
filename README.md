# WorthMatch AI Companion Web

这是 WorthMatch 新版四入口网页产品原型，重点验证：

- AI Agent 对话式建档
- 探索活动与需求发布
- 消息、群聊、资料权限与附件入口
- 我的主页、档案编辑与隐私设置
- 桌面端顶部四栏 + 手机端底部四栏的双端适配

## 运行

```bash
cd /Users/leo/Desktop/worthmatch/product_lab/worthmatch_ai_companion
npm start
```

打开：

```text
http://localhost:5177
```

## 接入 DeepSeek

不要把 API key 写进前端文件。需要真实模型时，在本目录创建 `.env.local`：

```text
DEEPSEEK_API_KEY=你的 DeepSeek key
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=5177
```

没有配置 key 时，页面会自动使用本地模拟 AI，方便做 UI 和交互调试。

GitHub Pages 静态预览不会使用本地 API key，会自动走前端模拟回复。

## 文件结构

```text
public/index.html
public/styles.css
public/app.js
public/assets/icons/wm-icons.svg
server.js
```
