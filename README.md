# 🚀 ContentFlow

> **Nền tảng Tự động hóa & Phân phối Nội dung Đa kênh (Lean Architecture & Multi-Channel Distribution Platform)**

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 1. Giới thiệu tổng quan (Description)

### ContentFlow là gì?
**ContentFlow** là giải pháp phân phối và tự động hóa xuất bản nội dung số đa nền tảng (Facebook, LinkedIn, X/Twitter,...) được thiết kế theo triết lý **Lean Code** & **YAGNI (You Aren't Gonna Need It)**.

### Vấn đề giải quyết:
- **Tốn thời gian đăng thủ công**: Không còn phải copy/paste cùng một nội dung lên từng mạng xã hội riêng lẻ.
- **Tắc nghẽn xuất bản khi lưu lượng tăng**: Sử dụng hàng đợi tin cậy (RabbitMQ Worker) để xử lý tác vụ background mượt mà, không làm nghẽn tiến trình API.
- **Rủi ro lộ Token mạng xã hội**: Bảo vệ tuyệt đối Access Token của người dùng với chuẩn mã hóa bảo mật cấp công nghiệp **AES-256-GCM** kèm `authTag` chống giả mạo.
- **Bí ý tưởng sáng tạo nội dung**: Tích hợp trực tiếp **Gemini AI** giúp viết nháp, chỉnh sửa giọng văn (tone of voice) theo thời gian thực.

---

## ✨ 2. Tính năng nổi bật (Features)

- ⚡ **Kiến trúc Tinh gọn (Lean Architecture)**: Không over-engineering, loại bỏ các tầng trừu tượng rườm rà. Code ngắn gọn, dễ bảo trì và dễ mở rộng.
- 🤖 **Trợ lý viết bài với Gemini AI**: Tạo nhanh bài viết tiếp thị, bản tin công nghệ hoặc thông báo ra mắt chỉ với 1 câu lệnh (prompt).
- 📅 **Lên lịch & Hàng đợi bất đồng bộ**: Hỗ trợ xuất bản tức thì hoặc lên lịch đăng tự động thông qua RabbitMQ message queue.
- 🔒 **Bảo mật mã hóa chuẩn AES-256-GCM**: Toàn bộ OAuth Access Tokens lưu trữ trong cơ sở dữ liệu đều được mã hóa bằng chuẩn AES-256-GCM từ module gốc `node:crypto`.
- 🎨 **Giao diện hiện đại & Siêu nhẹ**: Xây dựng bằng React 18, Vite, TailwindCSS và **Zustand** cho quản lý trạng thái đơn giản, mượt mà thay vì Redux cồng kềnh.
- 📦 **Đóng gói Docker tối ưu (Multi-stage Build)**:
  - Backend API: Docker image Alpine siêu nhỏ gọn (< 150MB).
  - Frontend SPA: Nginx Alpine phân phối tĩnh kèm Reverse Proxy API (< 25MB).
- 🚀 **Kịch bản Deploy VPS 1 dòng lệnh**: Tự động sinh khóa bí mật, migrate database và tích hợp Let's Encrypt SSL tự động qua Certbot.

---

## 🛠️ 3. Ngăn xếp công nghệ (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò |
| :--- | :--- | :--- |
| **Backend** | Node.js (v20+), Express, TypeScript | RESTful API Server |
| **ORM & Database** | Prisma ORM, MySQL 8.0 | Quản lý dữ liệu quan hệ chuẩn 3NF |
| **Message Queue** | RabbitMQ (amqplib) | Điều phối hàng đợi tác vụ xuất bản bài viết |
| **Cache & Store** | Redis 7 Alpine | Bộ nhớ đệm và quản lý phiên tạm thời |
| **AI Integration** | Google Gen AI SDK (`gemini-2.5-flash`) | Sáng tạo & tối ưu nội dung thông minh |
| **Validation** | Zod | Xác thực dữ liệu đầu vào chặt chẽ |
| **Frontend** | React 18, Vite, TypeScript | Giao diện người dùng Single Page App (SPA) |
| **State Management**| Zustand | Quản lý trạng thái client gọn nhẹ |
| **Styling & Icons** | TailwindCSS, Lucide React | Thiết kế giao diện phẳng, linh hoạt |
| **Testing** | Vitest, Supertest | Kiểm thử tích hợp nhanh chóng |
| **Container & Reverse Proxy** | Docker Compose, Nginx Alpine, Certbot | Triển khai và bảo mật SSL tự động |

---

## 🚀 4. Hướng dẫn cài đặt & Chạy ứng dụng (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản `20.x` trở lên ([Tải tại đây](https://nodejs.org/))
- **Docker & Docker Compose**: Khuyến nghị dùng Docker Desktop hoặc Docker Engine trên Linux ([Tải tại đây](https://www.docker.com/))
- **Git**

---

### Cách 1: Khởi chạy nhanh bằng Docker Compose (Khuyến nghị)

Toàn bộ hệ thống (MySQL, Redis, RabbitMQ, Backend API, Frontend Nginx) có thể khởi chạy chỉ với 1 bước:

```bash
# 1. Clone mã nguồn
git clone https://github.com/your-username/contentflow.git
cd contentflow

# 2. Tạo file biến môi trường từ mẫu
cp .env.example .env
sed -i "s/^APP_SECRET=.*/APP_SECRET=$(openssl rand -hex 32)/" .env
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env

# 3. Khởi động toàn bộ container
docker compose up -d --build
```

Ứng dụng sẵn sàng tại:
- **Giao diện Web**: [http://localhost](http://localhost) (Port 80)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **RabbitMQ Management Dashboard**: [http://localhost:15672](http://localhost:15672) (User: `guest` / Pass: `guest`)

Backend tự chạy migration khi khởi động Docker. Lần đầu mở ứng dụng sẽ tự tạo ba kênh demo Facebook, LinkedIn và X/Twitter; kênh demo mô phỏng việc đăng bài, chưa kết nối tài khoản mạng xã hội thật.

Tạo tài khoản bằng email và mật khẩu (tối thiểu 8 ký tự) ngay trên màn hình đăng nhập. Mật khẩu được băm bằng scrypt; API bài viết và kênh yêu cầu JWT hợp lệ. Trước khi đăng ký tài khoản quản trị đầu tiên, đặt `ADMIN_EMAIL` bằng email đó trong `.env`; nếu tài khoản đã tồn tại, đăng xuất rồi đăng nhập lại bằng email đã cấu hình để bootstrap quyền admin. Trước khi triển khai công khai, cấu hình `JWT_SECRET` ngẫu nhiên tối thiểu 32 ký tự và phục vụ giao diện qua HTTPS.

Với VPS, chạy `deploy.sh` cùng `DOMAIN` và `EMAIL`; sau khi Certbot cấp chứng chỉ, frontend sẽ tự bật HTTPS và chuyển hướng HTTP sang HTTPS. Chế độ local dùng HTTP tại `http://localhost`.

---

### Cách 2: Chạy môi trường Phát triển cục bộ (Local Development)

Nếu muốn phát triển code và debug trực tiếp:

#### Bước 1: Khởi động Database & Message Queue
```bash
# Khởi động riêng MySQL, Redis, RabbitMQ
docker compose up -d mysql redis rabbitmq
```

#### Bước 2: Thiết lập Backend
```bash
cd backend

# Cài đặt thư viện
npm install

# Tạo cấu trúc database với Prisma
npx prisma generate
npx prisma migrate dev --name init

# Chạy Backend ở chế độ Hot-reload
npm run dev
```
> Backend API chạy local mặc định tại: `http://localhost:4001`

> Nếu đang giữ Docker backend chạy trên cổng `4000`, backend local dùng cổng `4001` để không bị `EADDRINUSE`; frontend Vite proxy API sang `4001`.

Đặt `ADMIN_EMAIL` trong `.env` trước khi đăng ký tài khoản quản trị đầu tiên. Sau đó đăng nhập bằng email đó để thấy mục **Admin**. Người dùng có thêm trang chủ, lịch, kênh, thống kê và hồ sơ/đổi mật khẩu; admin có quản lý tài khoản, khóa/mở khóa, thống kê, bài đăng và nhật ký hoạt động. Các kênh hiện là demo; OAuth và số liệu tương tác mạng xã hội thật chưa được cấu hình.

#### Bước 3: Thiết lập Frontend
Mở một cửa sổ Terminal mới:
```bash
cd frontend

# Cài đặt thư viện
npm install

# Chạy ứng dụng frontend
npm run dev
```
> Frontend Vite sẽ mở tại: `http://localhost:3000`

---

## 🧪 5. Kiểm thử (Testing)

Dự án áp dụng triết lý **Just-Enough Testing** (không lãng phí thời gian tạo mock thừa thãi), tập trung vào các luồng tích hợp cốt lõi:
- Xác thực & quyền truy cập JWT.
- Ràng buộc dữ liệu (Zod validation).
- Tính toàn vẹn mã hóa và phát hiện giả mạo dữ liệu (AES-256-GCM authTag tampering test).

```bash
cd backend
npm test
```

---

## 🌐 6. Triển khai lên máy chủ VPS (Production Deployment)

Dự án cung cấp sẵn script [`deploy.sh`](file:///d:/ContentFlow/contentflow/deploy.sh) cho phép triển khai thẳng lên VPS (Ubuntu/Debian) kèm SSL Let's Encrypt chỉ với một dòng lệnh duy nhất:

```bash
DOMAIN=contentflow.yourdomain.com EMAIL=admin@yourdomain.com bash deploy.sh
```

**Các tác vụ script tự động thực hiện:**
1. Tạo khóa bảo mật ngẫu nhiên `APP_SECRET` nếu chưa tồn tại.
2. Build các Docker container tối ưu (Multi-stage Alpine).
3. Chạy lệnh migrate database schema `prisma migrate deploy`.
4. Gọi Certbot cấp phát chứng chỉ HTTPS tự động và reload Nginx cấu hình SSL.

---

## 💻 7. Cấu trúc thư mục (Project Structure)

```text
contentflow/
├── docker-compose.yml       # Điều phối toàn bộ hạ tầng containers
├── deploy.sh                # Script 1-line auto deploy & SSL
├── .env.example             # Mẫu cấu hình môi trường chuẩn
│
├── backend/
│   ├── Dockerfile           # Multi-stage Node.js Alpine build
│   ├── prisma/
│   │   └── schema.prisma    # Schema MySQL 3NF tinh gọn
│   └── src/
│       ├── controllers/     # Điều hướng request, validate với Zod
│       ├── services/        # Logic Gemini AI, publish các nền tảng
│       ├── workers/         # RabbitMQ Consumer xử lý đăng bài ngầm
│       ├── utils/           # AES-256-GCM crypto & JWT helpers
│       └── tests/           # Integration tests (Vitest + Supertest)
│
└── frontend/
    ├── Dockerfile           # Multi-stage Nginx Alpine build
    ├── nginx.conf           # Cấu hình Reverse Proxy & Webroot Certbot
    └── src/
        ├── components/      # UI components (PostForm, PostCard)
        ├── store/           # Zustand state store
        ├── services/        # Fetch API Client tập trung
        └── pages/           # Màn hình Dashboard quản trị
```

---

## 🤝 8. Đóng góp mã nguồn (Contributing)

Mọi sự đóng góp giúp hoàn thiện dự án đều được chào đón nồng nhiệt! Để đóng góp:

1. **Fork** dự án về tài khoản GitHub của bạn.
2. Tạo nhánh tính năng mới (`git checkout -b feature/AmazingFeature`).
3. Cam kết các thay đổi của bạn (`git commit -m 'feat: Add some AmazingFeature'`).
4. Đẩy nhánh lên repository của bạn (`git push origin feature/AmazingFeature`).
5. Tạo một **Pull Request (PR)** mới với mô tả chi tiết các thay đổi.

> **Quy chuẩn Code:**
> - Luôn duy trì phong cách **Lean Code**: Ưu tiên sự rõ ràng, không thêm abstraction nếu chưa có từ 3 trường hợp sử dụng trở lên.
> - Đảm bảo chạy `npm test` thành công trước khi gửi PR.

---

## 📄 9. Giấy phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Vui lòng tham khảo file `LICENSE` để biết thêm chi tiết.

---

<p align="center">
  Xây dựng với niềm đam mê kiến trúc phần mềm tinh gọn ❤️ <strong>ContentFlow Team</strong>
</p>
