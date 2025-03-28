# 孤洞前端项目

基于 Nuxt 3 + Vue 3 + TypeScript + Element Plus 的前端项目。

## 项目结构

```
frontend/
├── assets/                 # 静态资源（图片、字体等）
├── components/             # UI组件
│   ├── common/             # 通用组件
│   ├── layout/             # 布局组件
│   ├── features/           # 功能组件（按业务功能分组）
│       ├── activity/       # 活动相关组件
│       ├── group/          # 群组相关组件  
│       ├── map/            # 地图相关组件
│       └── user/           # 用户相关组件
├── composables/            # 可复用的组合式函数
├── plugins/                # Nuxt插件
├── pages/                  # 页面路由
├── stores/                 # Pinia状态管理
├── types/                  # TypeScript类型定义
├── utils/                  # 工具函数
│   ├── api/                # API调用
│   │   ├── modules/        # 按业务模块分组的API
│   │   ├── index.ts        # API导出
│   │   └── request.ts      # 请求工具
│   ├── auth/               # 认证相关工具
│   ├── helpers/            # 辅助函数
│   └── constants/          # 常量定义
└── middleware/             # 路由中间件
```

## 开发规范

### 1. 代码组织

- **按功能模块组织**：相关功能的组件、API、类型等应集中放置
- **代码复用**：提取共用逻辑到composables或工具函数
- **小而专注的组件**：遵循单一职责原则，组件应该短小精悍，专注一个功能

### 2. 状态管理

- **Pinia使用规范**：
  - Store按业务领域划分
  - 使用持久化插件统一管理需要持久化的状态
  - 避免在组件中直接修改store状态，使用actions
  
- **本地状态vs全局状态**：
  - 组件内部状态使用ref/reactive
  - 跨组件共享状态使用Pinia
  - 避免过度全局化

### 3. API调用

- **请求结构**：
  - API按业务模块划分
  - 统一使用request工具进行请求
  - 错误处理遵循统一流程

### 4. 认证与权限

- **Token管理**：
  - 使用Pinia持久化存储token
  - 定时刷新确保会话有效性
  - 统一认证错误处理

### 5. 类型安全

- **类型定义**：
  - 所有类型定义集中在types目录
  - 严格遵循TypeScript类型定义
  - 避免使用any类型

### 6. 性能优化

- **懒加载**：路由按需加载
- **代码分割**：按功能模块拆分代码
- **优化渲染**：避免不必要的组件渲染

## 开发流程

1. **安装依赖**：`pnpm install`
2. **开发模式**：`pnpm dev`
3. **构建项目**：`pnpm build`
4. **生产预览**：`pnpm preview`

## 项目特性

- **🚀 现代化技术栈**：Vue 3 + Nuxt 3 + TypeScript + Pinia
- **🔒 安全认证**：JWT认证与自动刷新
- **📱 响应式设计**：支持多种设备
- **🌐 地图功能**：集成高德地图
- **�� 实时通讯**：群组聊天功能
- **🌐 模块化设计**：清晰的代码组织结构

# GeoChat - 实时地理位置社交应用

基于Nuxt 3构建的实时地理位置聊天应用，支持基于位置的动态社交互动

❗️**重要提示**：首次打开项目后，请先执行 `pnpm nuxt prepare`，然后在VSCode中运行 `reload window` 命令，以确保类型补全正常工作！

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

## 路线图
- [ ] 实时位置热力图
- [ ] AR模式位置导航
- [ ] 临时匿名聊天室
- [ ] 位置足迹时间轴


## 隐私声明
本应用严格遵循W3C地理位置服务标准，用户位置数据需明确授权后使用

## API类型规范

为确保前后端接口类型定义一致且明确，我们采用以下规范：

### 类型命名规范

- 类型命名应与后端保持一致，避免不同名称表示相同概念
- API返回类型：统一使用`ApiResponse<T>`与后端保持一致
- 请求类型: `XxxRequest`，例如 `CreateUserRequest`
- 响应类型: `XxxResponse`，例如 `CreateUserResponse`
- 对于没有请求体的请求，使用 `EmptyRequest` 类型
- 对于没有响应体的响应，使用 `EmptyResponse` 类型

### API函数规范

所有API调用函数应明确定义请求和响应类型：

```typescript
// 标准格式
export const apiFunction = (params: RequestType): Promise<ApiResponse<ResponseType>> =>
  method<ResponseType, RequestType>(API_PATH, params);

// 无请求体示例
export const apiFunction = (): Promise<ApiResponse<ResponseType>> =>
  method<ResponseType, EmptyRequest>(API_PATH, {});

// 无响应体示例
export const apiFunction = (params: RequestType): Promise<ApiResponse<EmptyResponse>> =>
  method<EmptyResponse, RequestType>(API_PATH, params);
```

通过统一的类型定义，我们确保了：
1. 前后端数据结构一致性
2. TypeScript 提供更准确的类型检查
3. IDE 提供更好的代码补全和错误提示
4. 代码可读性和可维护性更高