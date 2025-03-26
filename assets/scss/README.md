# 样式管理系统

本项目采用模块化的SCSS样式管理系统，基于最新的 Sass 模块系统（`@use` 和 `@forward`），实现了样式的组织、复用和多主题支持。

## 目录结构

```
scss/
├── components/             # 组件样式
│   ├── common/             # 通用组件样式（已移至组件内部）
│   ├── features/           # 功能组件样式
│   ├── layout/             # 布局组件样式
│   ├── user/               # 用户相关组件样式
│   └── index.scss          # 组件样式索引
├── pages/                  # 页面特定样式
│   ├── home.scss           # 首页样式
│   └── ...                 # 其他页面样式
├── themes/                 # 主题样式
│   ├── default.scss        # 默认主题
│   ├── dark.scss           # 暗色主题
│   └── index.scss          # 主题索引
├── variables.scss          # 全局变量
├── mixins.scss             # 混合器
├── common.scss             # 全局通用样式
├── main.scss               # 主样式文件
└── README.md               # 本文档
```

## 使用指南

### Sass 模块系统

本项目严格采用最新的 Sass 模块系统：

- **@use**：用于导入模块，创建命名空间
- **@forward**：用于重新导出模块内容
- **不使用 @import**：避免全局命名空间污染和重复导入

### 样式优先级

按照以下优先级组织样式：

1. **全局通用样式**：定义在 `common.scss` 中
2. **组件样式**：定义在组件内的 `<style lang="scss" scoped>` 中
3. **只有通用样式**：才放在 `components/` 目录下的相应文件中

### 添加组件样式

所有组件样式推荐直接在组件文件中定义：

1. 使用 `<style lang="scss" scoped>` 标签
2. 在样式顶部导入变量和混合器
   ```scss
   @use '@/assets/scss/variables' as v;
   @use '@/assets/scss/mixins' as m;
   ```
3. 在样式标签内定义组件的所有样式

示例：

```vue
<template>
  <div class="wx-button">
    <!-- 组件内容 -->
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.wx-button {
  display: inline-flex;
  align-items: center;
  
  // 所有按钮样式直接定义在这里
  &.btn-primary {
    background-color: v.$primary-color;
    color: white;
  }
  
  // 其他样式...
}
</style>
```

对于可能在多个组件中重复使用的通用样式：

1. 考虑使用混合器（mixins）封装复用逻辑
2. 对于真正通用的样式，仍可以放在 `components/{类别}/` 目录下并在 `index.scss` 中引用

### 变量与混合器

- 使用 `@use` 导入并指定命名空间
- 变量使用: `v.$variable-name`
- 混合器使用: `@include m.mixin-name()`

```scss
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.your-class {
  color: v.$primary-color;
  @include m.flex(center, center);
}
```

### 主题管理

- 默认主题在 `themes/default.scss` 中定义
- 暗色主题在 `themes/dark.scss` 中定义
- 切换主题示例:
  ```js
  // 切换到暗色主题
  document.documentElement.classList.add('dark-theme');
  // 切换回亮色主题
  document.documentElement.classList.remove('dark-theme');
  ```

## 最佳实践

1. **组件封装**: 组件样式与组件代码放在一起，提高组件的封装性和独立性
2. **模块化**: 严格使用 `@use` 和 `@forward`，不使用 `@import`
3. **命名空间**: 为导入的模块指定简短有意义的别名，如 `v` 和 `m`
4. **样式复用**: 尽量使用变量和混合器实现样式复用
5. **避免重复定义**: 不要在全局和组件内部重复定义相同的样式
6. **响应式设计**: 使用混合器实现响应式布局
   ```scss
   @include m.mobile {
     // 移动端样式
   }
   ```
7. **主题支持**: 使用CSS变量实现多主题支持
8. **避免全局污染**: 使用作用域样式（scoped）避免样式冲突
9. **通用样式优先**: 只将真正通用的样式（如变量、混合器、全局重置样式）放在全局文件中