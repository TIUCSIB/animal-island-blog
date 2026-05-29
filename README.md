# animal-island-blog

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-ElysiaJS-F38020?logo=cloudflare)

一个基于 **React 19**、**TypeScript**、**Vite 8**、**Tailwind CSS 4**、**shadcn/ui** 和 **ElysiaJS + Cloudflare D1** 的小岛风图片博客。

## 概览

**animal-island-blog** 是一个以"小岛"为主题的图片博客 / 个人画廊，具有沉浸感的小岛 UI 交互体验。访客可以浏览照片画廊、阅读文章，管理员可以发布内容、管理站点配置。

### 功能

- **照片画廊** — 无限滚动瀑布流图片展示，支持图片/视频内容
- **文章详情** — 响应式桌面/移动端双布局
- **小岛模式** — 沉浸式交互开关，开启后显示浮动菜单、音乐播放器、登录入口
- **音乐播放器** — 支持网易云音乐，在页面角落浮动播放
- **管理后台** — 完整的后台管理：文章编辑器（Tiptap）、媒体资源管理（Cloudinary）、站点配置、关于页编辑
- **认证系统** — JWT 令牌认证 + Refresh Token
- **Cloudflare D1 数据库** — 高性能全球化 SQLite，Drizzle ORM 管理

## 技术栈

### 前端

| 技术 | 用途 |
|---|---|
| React 19 | UI 框架 + React Compiler 自动优化 |
| TypeScript | 类型安全 |
| Vite 8 | 构建工具 + HMR |
| Tailwind CSS 4 | 原子化 CSS |
| shadcn/ui (Radix) | UI 组件库 |
| TanStack React Query 5 | 服务端状态管理 |
| Zustand 5 | 客户端状态管理 |
| Tiptap 3 | 富文本编辑器 |
| Lucide | 图标库 |
| Geist | 字体 |

### 后端

| 技术 | 用途 |
|---|---|
| Cloudflare Workers | 无服务器运行时 |
| ElysiaJS 1.4 | Web 框架 |
| Drizzle ORM 0.45 | 数据库 ORM |
| Cloudflare D1 | 无服务器 SQLite 数据库 |
| Cloudinary | 图片/视频托管 |
| Cloudflare Turnstile | 人机验证 |

## 快速开始

### 环境要求

- Node.js >= 20
- npm 或 pnpm

### 安装

```bash
git clone https://github.com/TIUCSIB/animal-island-blog.git
cd animal-island-blog
npm install
```

### 本地开发

需要同时启动前端和服务端：

```bash
# 终端 1：启动前端（Vite HMR，默认 http://localhost:5173）
npm run dev

# 终端 2：启动 API 服务（Cloudflare Worker，默认 http://localhost:8787）
npm run dev:api
```

前端通过 Vite proxy 将 `/api` 请求转发到 API 服务。

### 构建

```bash
npm run build
npm run preview    # 预览生产构建
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
animal-island-blog/
├── src/                          # React 前端源码
│   ├── App.tsx                   # 根组件
│   ├── main.tsx                  # 入口文件
│   ├── pages/                    # 页面组件
│   │   ├── HomePage.tsx          # 首页（画廊）
│   │   ├── AboutPage.tsx         # 关于页
│   │   ├── AdminPage.tsx         # 管理后台
│   │   ├── PostDetailPage.tsx    # 文章详情
│   │   └── NotFoundPage.tsx      # 404 页面
│   ├── components/               # 组件
│   │   ├── island/               # 小岛主题组件
│   │   └── ui/                   # shadcn/ui 基础组件
│   ├── routes/                   # React Router 配置
│   ├── stores/                   # Zustand 状态管理
│   ├── lib/                      # 工具函数 & API 客户端
│   └── data/                     # 本地数据 & 类型定义
├── server/                       # 后端 API（Cloudflare Worker）
│   ├── src/
│   │   ├── worker.ts             # Elysia Worker 入口
│   │   ├── routes/               # API 路由
│   │   ├── services/             # 业务逻辑
│   │   ├── db/                   # D1 数据库 Schema
│   │   └── ...
│   ├── drizzle/                  # Drizzle 迁移文件
│   └── index.mjs                 # 本地 JSON API 回退方案
├── public/                       # 静态资源
└── dist/                         # 构建输出（不纳入版本控制）
```

## 部署

### 前端（Cloudflare Pages / 静态托管）

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署到 Cloudflare Pages、Vercel 或任意静态托管服务。

### API（Cloudflare Workers + D1）

```bash
npm run deploy:api
```

需要配置以下环境变量 / secrets：

| 变量 | 说明 |
|---|---|
| `ADMIN_PASSWORD` | 管理员密码（默认 `island-admin`） |
| `JWT_SECRET` | JWT 签名密钥 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary 云名 |
| `CLOUDINARY_API_KEY` | Cloudinary API 密钥 |
| `CLOUDINARY_API_SECRET` | Cloudinary API 密钥 |
| `TURNSTILE_SECRET` | Turnstile 验证密钥（可选） |

### 数据库迁移

```bash
# 本地 D1 迁移
npm run db:generate     # 生成迁移文件
npm run db:migrate:local # 应用到本地 D1

# 生产 D1 迁移
npm run db:migrate:remote
```

## 环境变量

复制 `.env.local.example` 为 `.env.local` 并填入配置：

```env
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET=your-turnstile-secret
```

## License

MIT
