# 🏝️ Animal Island Blog

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)

一个小岛风的图片博客 / 个人站项目，前端使用 **React 19 + TypeScript + Vite**，后端使用 **ElysiaJS + Cloudflare Workers + Cloudflare D1**，媒体资源使用 **Cloudinary**，UI 组件库使用 **animal-island-ui**。

---

## 📖 1. 项目简介

这个项目包含两部分：

- **前端站点**：负责首页、关于页、文章详情页、管理后台 UI
- **后端 API**：负责文章、关于页、站点资料、管理员登录、媒体上传签名等接口

推荐的生产部署架构：

- **前端**：Cloudflare Pages
- **API**：Cloudflare Workers
- **数据库**：Cloudflare D1
- **媒体资源**：Cloudinary
- **人机验证（可选）**：Cloudflare Turnstile

---

## ✨ 2. 功能概览

- 🖼️ 首页图片 / 视频画廊（瀑布流布局，无限滚动加载）
- 📄 文章详情页（桌面端弹窗 + 移动端全屏，封面比例自动适配）
- 🏠 关于页（折叠信息、联系方式、技术栈展示）
- 🎵 背景音乐播放器（网易云音源，支持歌单和单曲）
- 🔐 后台登录（支持 Cloudflare Turnstile 人机验证）
- 📝 后台文章管理（富文本编辑器、图片库、视频库、标签、置顶）
- 👤 后台站点资料管理（头像、昵称、签名、在线状态）
- 📋 后台关于页管理（可折叠问答、联系方式排序）
- 🎶 后台音乐配置（歌曲 ID / 歌单 ID 切换）
- ☁️ Cloudinary 媒体上传与资源管理（图片库、视频库、删除）
- 🎨 小岛风交互 UI（自定义光标、浮动菜单、Toast 通知）

---

## 🛠️ 3. 技术栈

### 前端

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- animal-island-ui
- React Router
- TanStack React Query
- Zustand（状态管理）
- Tiptap（富文本编辑器）
- Lucide React（图标）
- tw-animate-css（动画工具）

### 后端

- Cloudflare Workers
- ElysiaJS（轻量 Web 框架）
- Drizzle ORM
- Cloudflare D1（SQLite 数据库）

### 第三方服务

- Cloudinary（图片 / 视频 CDN 存储与管理）
- Cloudflare Turnstile（可选人机验证）
- 网易云音乐 API（背景音乐音源）

---

## 📁 4. 目录结构

```txt
shlii-web/
├── public/                     静态资源
├── server/                     后端 API
│   ├── drizzle/migrations/     D1 / Drizzle 迁移文件
│   ├── src/routes/             API 路由
│   ├── src/services/           业务逻辑
│   ├── src/db/                 数据库 schema
│   └── index.mjs               本地 JSON API 回退方案
├── src/                        React 前端
│   ├── components/             通用组件（island/ 下为小岛风组件）
│   ├── pages/                  页面级组件
│   │   ├── post-detail/        文章详情页逻辑
│   │   └── admin/              后台管理页面
│   ├── routes/                 路由配置
│   ├── lib/                    API / 工具函数
│   └── data/                   本地默认数据
├── wrangler.jsonc              前端 Workers Sites 配置
├── wrangler.api.jsonc          后端 Worker / D1 配置
├── vite.config.ts              Vite 配置
└── README.md
```

---

## 🚀 5. 本地开发

### 环境要求

- Node.js 20+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发环境

需要开两个终端：

```bash
# 终端 1：前端
npm run dev
```

```bash
# 终端 2：后端 Worker 本地调试
npm run dev:api
```

默认地址：

- 前端：`http://localhost:5173`
- API：`http://localhost:8787`

本地开发时，Vite 会把 `/api` 请求代理到 `http://localhost:8787`。

### 本地检查

```bash
npm run lint
npm run build
```

---

## ⚙️ 6. 环境变量

这个项目分为两类环境变量：

- **前端变量**：构建时注入，变量名必须以 `VITE_` 开头
- **后端变量**：给 Cloudflare Worker 使用

### 6.1 前端环境变量

本地开发放在 `.env.local`，部署到 Cloudflare Pages 时配置到 Pages 的环境变量里。

| 变量名                    | 是否必填 | 说明                                              |
| ------------------------- | -------: | ------------------------------------------------- |
| `VITE_API_BASE_URL`       |       是 | 线上 API 地址，例如 `https://api.your-domain.com` |
| `VITE_ENABLE_TURNSTILE`   |       否 | 是否启用 Turnstile，填 `true` 或 `false`          |
| `VITE_TURNSTILE_SITE_KEY` |       否 | Turnstile 前端 Site Key                           |

示例：

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_ENABLE_TURNSTILE=false
VITE_TURNSTILE_SITE_KEY=
```

### 6.2 后端环境变量

本地开发可放到 `.dev.vars`，线上建议通过 `wrangler secret put` 或 Cloudflare Dashboard 配置。

> ⚠️ 注意：后端现在不会再回退到默认后台密码。未配置 `ADMIN_PASSWORD` 时，管理员登录和本地 JSON API 都会直接报错。

| 变量名                     |           是否必填 | 说明                                                    |
| -------------------------- | -----------------: | ------------------------------------------------------- |
| `ADMIN_PASSWORD`           |                 是 | 初始后台密码                                            |
| `TURNSTILE_ENABLED`        |                 否 | 是否启用 Turnstile，`true` / `false`                    |
| `TURNSTILE_SECRET_KEY`     |                 否 | Turnstile Secret Key                                    |
| `MUSIC_API_BASE_URL`       |                 否 | Music API base URL，默认 `https://music.030456.xyz/api` |
| `CLOUDINARY_CLOUD_NAME`    | 管理后台上传时必填 | Cloudinary cloud name                                   |
| `CLOUDINARY_API_KEY`       | 管理后台上传时必填 | Cloudinary API key                                      |
| `CLOUDINARY_API_SECRET`    | 管理后台上传时必填 | Cloudinary API secret                                   |
| `CLOUDINARY_UPLOAD_FOLDER` |                 否 | Cloudinary 上传目录前缀，默认 `animal-island-blog`      |

示例：

```env
ADMIN_PASSWORD=replace-with-a-strong-password
TURNSTILE_ENABLED=false
TURNSTILE_SECRET_KEY=
MUSIC_API_BASE_URL=https://music.030456.xyz/api
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_FOLDER=shlii
```

---

## 🌐 7. 推荐上线方案

推荐使用下面这套组合：

1. **Cloudflare D1**：存文章、站点配置、关于页、管理员信息
2. **Cloudflare Workers**：部署 API
3. **Cloudflare Pages**：部署前端静态站点
4. **Cloudinary**：存图片和视频
5. **Turnstile（可选）**：保护后台登录

这是当前项目最贴合现有代码结构的部署方式。

---

## 📦 8. 上线流程（Cloudflare Pages + Workers + D1）

下面是一套可以直接照着走的流程。

### 第 1 步：安装依赖并登录 Cloudflare

```bash
npm install
npx wrangler login
```

### 第 2 步：创建 D1 数据库

```bash
npx wrangler d1 create animal-island-db
```

执行后你会拿到一个 `database_id`。

把它填到根目录的 `wrangler.api.jsonc` 里：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "animal-island-db",
      "database_id": "替换成你自己的 database_id",
      "migrations_dir": "server/drizzle/migrations",
    },
  ],
}
```

### 第 3 步：配置 Worker secrets

至少先配后台密码：

```bash
npx wrangler secret put ADMIN_PASSWORD --config wrangler.api.jsonc
```

如果你要开启媒体上传，再继续配置：

```bash
npx wrangler secret put CLOUDINARY_CLOUD_NAME --config wrangler.api.jsonc
npx wrangler secret put CLOUDINARY_API_KEY --config wrangler.api.jsonc
npx wrangler secret put CLOUDINARY_API_SECRET --config wrangler.api.jsonc
```

如果你要启用 Turnstile，再配置：

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.api.jsonc
```

`TURNSTILE_ENABLED` 可以保留在 `wrangler.api.jsonc` 的 `vars` 里，也可以在 Dashboard 里设置成 `true` / `false`。

### 第 4 步：执行生产数据库迁移

```bash
npm run db:migrate:remote
```

这一步会把 `server/drizzle/migrations/` 中的表结构同步到 D1。

### 第 5 步：部署 API

```bash
npm run deploy:api
```

部署成功后，你会拿到一个 Worker 地址，例如：

```txt
https://api.your-domain.com
```

记住这个地址，前端要用。

### 第 6 步：部署前端到 Cloudflare Pages

在 Cloudflare Pages 新建项目，连接这个仓库，构建配置填写：

| 配置项                 | 值              |
| ---------------------- | --------------- |
| Framework preset       | Vite            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Node version           | `20` 或更高     |

然后在 Pages 的环境变量里添加：

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_ENABLE_TURNSTILE=false
VITE_TURNSTILE_SITE_KEY=
```

如果你启用了 Turnstile，把后两项改成真实值。

### 第 7 步：绑定自定义域名

建议至少配置两个域名：

- 前端：`www.your-domain.com`
- API：`api.your-domain.com`

如果你给 Worker 绑定了自定义域名，记得同步更新前端的：

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

然后重新触发一次前端构建部署。

---

## 💡 9. 后续功能建议

### 🎯 优先级高

- **文章评论系统**：支持游客评论（Turnstile 验证）或接入第三方评论（如 Giscus）
- **文章搜索**：支持按标题、标签、内容关键词搜索
- **图片懒加载 + 渐进式加载**：画廊和详情页的图片添加骨架屏和模糊占位，提升首屏体验
- **SEO 优化**：添加 meta tags、Open Graph 协议、Sitemap，让文章能被搜索引擎收录
- **RSS 订阅**：生成 RSS feed，方便读者通过 RSS 阅读器订阅

### 🎯 优先级中

- **文章分类 / 专栏**：支持按主题分组浏览，而不只是按时间线
- **文章点赞 / 收藏**：轻量的互动功能，用 D1 存储计数
- **深色模式**：跟随系统或手动切换，提升夜间浏览体验
- **国际化（i18n）**：中英文切换，扩大受众范围
- **图片 Exif 信息展示**：拍摄时间、相机型号、GPS 地点等
- **文章分享卡片**：生成带封面图的分享卡片，适配微信 / Twitter 等社交平台

### 🎯 优先级低

- **PWA 支持**：离线缓存、添加到主屏幕、推送通知
- **阅读统计**：UV / PV 计数、阅读时长统计
- **相邻文章导航**：详情页底部显示上一篇 / 下一篇
- **批量导入**：支持从 Markdown 文件或 JSON 批量导入历史文章
- **Webhook 通知**：新文章发布时自动通知到 Telegram / 飞书 / Discord

---

## 📄 10. License

MIT
