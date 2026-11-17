# Hướng dẫn Deploy SRMS PTIT lên Vercel

Repo này là **pnpm Monorepo** gồm 2 ứng dụng:
- `apps/web` (React + Vite + Ant Design)
- `apps/api` (NestJS + Prisma + PostgreSQL)

## Bước 1: Chuẩn bị PostgreSQL Cloud (Neon / Supabase / Vercel Postgres)
1. Tạo 1 database PostgreSQL miễn phí trên **Neon** (`neon.tech`) hoặc **Supabase** (`supabase.com`) và lấy `DATABASE_URL`.
2. Đẩy schema và dữ liệu mẫu lên DB cloud (chạy từ máy local):
   ```bash
   set DATABASE_URL=postgresql://...
   pnpm prisma:generate
   pnpm --filter @srms/api exec prisma db push --schema=../../prisma/schema.prisma
   pnpm prisma:seed
   ```

## Bước 2: Deploy Backend (`apps/api`) lên Vercel
1. Vào **Vercel Dashboard → Add New Project → Import Git Repo**.
2. Chọn **Root Directory**: `apps/api` (file `apps/api/vercel.json` đã cấu hình sẵn `buildCommand` và serverless entrypoint `api/index.ts`).
3. Thêm **Environment Variables**:
   - `DATABASE_URL`: chuỗi kết nối PostgreSQL ở Bước 1
   - `JWT_SECRET`: chuỗi bí mật ngẫu nhiên (VD: `srms-ptit-prod-2026-secret`)
   - `APP_URL`: URL frontend Vercel (có thể cập nhật sau Bước 3)
4. Bấm **Deploy** và lấy domain backend (VD: `https://srms-api.vercel.app`). Kiểm tra nhanh: `https://srms-api.vercel.app/api/projects`.

## Bước 3: Deploy Frontend (`apps/web`) lên Vercel
1. Tạo **Project thứ 2** trên Vercel từ cùng Git Repo.
2. Chọn **Root Directory**: `apps/web` (file `apps/web/vercel.json` đã cấu hình sẵn SPA rewrite).
3. Thêm **Environment Variable**:
   - `VITE_API_URL`: domain backend vừa deploy ở Bước 2 (VD: `https://srms-api.vercel.app`)
4. Bấm **Deploy**!
