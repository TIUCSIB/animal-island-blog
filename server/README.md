# Island API

后端已改为：

```txt
ElysiaJS + Drizzle ORM + Cloudflare D1
```

图片 / 视频建议继续放 Cloudinary，D1 只保存文章、标签、Cloudinary URL / public_id 等结构化数据。

## 本地开发

第一次本地运行 D1 之前，先执行 migration：

```bash
pnpm db:migrate:local
```

启动 API：

```bash
pnpm dev:api
```

默认地址：

```txt
http://localhost:8787
```

默认后台密码：

```txt
island-admin
```

## 主要接口

- `GET /api/health`
- `POST /api/admin/login`
- `GET /api/posts`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/music`
- `PUT /api/music`

## 文件说明

```txt
server/src/worker.ts        Elysia Worker 入口和 API 路由
server/src/db/schema.ts     Drizzle / D1 表结构
server/drizzle/migrations   Drizzle 生成的 SQL migration
wrangler.api.jsonc          Cloudflare Worker / D1 配置
drizzle.config.ts           Drizzle Kit 配置
```

## 线上部署

1. 创建 D1 数据库：

```bash
pnpm wrangler d1 create shlii-db
```

2. 把返回的 `database_id` 写入 `wrangler.api.jsonc`。

3. 应用远程 migration：

```bash
pnpm db:migrate:remote
```

4. 部署 Worker：

```bash
pnpm deploy:api
```

前端部署到 Cloudflare Pages 后，把前端环境变量设为你的 Worker 地址：

```txt
VITE_API_BASE_URL=https://你的-worker.workers.dev
```

## 旧 JSON 后端

旧的本地 JSON 后端还保留在：

```txt
server/index.mjs
```

如需临时回退：

```bash
pnpm dev:api:json
```
