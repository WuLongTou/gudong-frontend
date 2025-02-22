# GeoChat - 实时地理位置社交应用

基于Nuxt 3构建的实时地理位置聊天应用，支持基于位置的动态社交互动

## 主要功能

- 📍 实时地理位置共享
- 🌍 基于地理围栏的聊天室
- 🗺️ 交互式地图浏览
- 🔥 热点区域发现
- 📱 移动端位置适配
- 🔒 隐私保护模式

## 快速开始

### 环境要求
- Node.js 18+
- 现代浏览器（需支持Geolocation API）
- npm/pnpm/yarn

### 安装依赖
```bash
pnpm install
# 或
npm install
```

### 配置环境变量
创建`.env`文件：
```env
NUXT_PUBLIC_AMAP_API_KEY=高德api key
NUXT_PUBLIC_AMAP_SECRET_KEY=高德密钥
```

### 启动开发服务器
```bash
pnpm dev
# 访问 http://localhost:3000
```

## 项目结构

```tree
├── assets/          # 静态资源
├── components/      # 地图组件/聊天组件
├── composables/     # 地理位置逻辑
├── layouts/         # 页面布局
├── pages/          # 主界面/设置页
├── public/          # 地图标记图标
├── server/          # 位置数据处理
├── utils/           # 地理工具函数
└── app.vue          # 主入口文件
```

## 技术栈
- 🚀 Nuxt 3 - 全栈框架
- 🗺️ Leaflet/Mapbox - 地图引擎
- 📡 WebSocket - 实时通信
- 📍 Geolocation API - 位置服务
- 🎨 Tailwind CSS - 样式设计
- 📦 Pinia - 状态管理

## 构建生产
```bash
pnpm build
pnpm preview
```

## 隐私声明
本应用严格遵循W3C地理位置服务标准，用户位置数据需明确授权后使用
