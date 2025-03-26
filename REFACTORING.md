# 前端项目重构说明

## 重构内容

本次重构主要针对以下几个方面：

### 1. 项目结构优化
- 按照功能模块划分目录结构
- 创建清晰的组件、API、工具函数组织方式
- 统一类型定义位置

### 2. API层改进
- 按业务模块拆分API调用
- 统一API响应格式和错误处理
- 提供完善的类型定义

### 3. 认证机制改进
- 使用Pinia统一管理用户状态和token
- 规范化token刷新机制
- 统一错误处理流程

### 4. 类型系统完善
- 集中管理所有类型定义
- 减少any类型的使用
- 提供更严格的类型检查

### 5. Nuxt最佳实践
- 使用Nuxt的文件命名约定（.client.ts/.server.ts）区分客户端和服务器端代码
- 避免在通用代码中使用process.client/process.server
- 使用Nuxt的插件和钩子系统处理请求拦截
- 遵循Nuxt的模块化和组合式API最佳实践

## 目录结构

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
│   ├── *.client.ts         # 仅客户端执行的插件
│   └── *.server.ts         # 仅服务器端执行的插件
├── pages/                  # 页面路由
├── stores/                 # Pinia状态管理
├── types/                  # TypeScript类型定义
├── utils/                  # 工具函数
│   ├── api/                # API调用
│   │   ├── modules/        # 按业务模块分组的API
│   │   ├── index.ts        # API导出
│   │   └── request.ts      # 请求工具
│   ├── auth/               # 认证相关工具
│   │   ├── *.client.ts     # 仅客户端执行的认证工具
│   │   └── *.server.ts     # 仅服务器端执行的认证工具
│   ├── helpers/            # 辅助函数
│   └── constants/          # 常量定义
└── middleware/             # 路由中间件
```

## API模块化设计

API调用按业务领域划分为多个模块：

- `api/modules/user.ts` - 用户相关API
- `api/modules/group.ts` - 群组相关API
- `api/modules/message.ts` - 消息相关API
- `api/modules/activity.ts` - 活动相关API

每个模块有自己的类型定义和API函数，方便维护和扩展。

## 类型系统优化

将所有类型定义集中在types目录下，便于统一管理。主要包括：

- `common.d.ts` - 通用类型定义，如API响应格式
- `api.ts` - API相关类型定义
- `*_type.ts` - 各业务模块类型定义

## Nuxt客户端/服务器端区分最佳实践

本次重构严格遵循Nuxt 3的最佳实践，特别是关于客户端和服务器端代码分离的部分：

1. **使用文件命名约定**：
   - `.client.ts` - 只在客户端执行的代码
   - `.server.ts` - 只在服务器端执行的代码

2. **利用Nuxt的同构API**：
   - 使用Nuxt的`$fetch`进行API调用，它在客户端和服务器端都能正常工作
   - 不需要在请求代码中区分环境

3. **只隔离浏览器特定功能**：
   - 只将真正依赖浏览器环境的功能（如JWT刷新、本地存储）放在`.client.ts`文件中
   - 保持业务逻辑和API请求在通用代码中

4. **使用Nuxt插件系统**：
   - 依赖Nuxt的插件自动区分环境
   - 避免手动检测当前环境

5. **避免使用process**：
   - 不使用 `process.client` 和 `process.server`
   - 依赖Nuxt的构建时分离

6. **使用生命周期钩子**：
   - 使用 `onMounted` 等钩子确保代码只在客户端执行

## 认证机制改进

- JWT处理分为客户端和服务器端版本
- Token刷新只在客户端执行
- 认证状态通过Pinia管理

## 注意事项

1. 在使用API时，应直接从utils/api目录导入
2. 类型定义应该从types目录导入
3. 客户端特定逻辑应放在.client.ts文件中
4. 服务器端特定逻辑应放在.server.ts文件中
5. 避免直接操作localStorage，使用Pinia Store代替 