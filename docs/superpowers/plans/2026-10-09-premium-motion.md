# 小支租车官网高级动效 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有官网上实现高性能的高级滚动编排、车型焦点舞台、数字计数和比价悬停交互，同时完成已确认的 Logo、镜像、字号字重和文案修正。

**Architecture:** 保持 React 单页结构，引入一个纯函数动效模块计算计数与车型姿态；`App` 只管理离散 UI 状态，连续滚动通过 `requestAnimationFrame` 直接更新卡片合成层样式。CSS 负责统一缓动、揭示、高亮轨道、响应式与减少动效降级。

**Tech Stack:** React 19、Vite 8、CSS、Vitest、Testing Library、IntersectionObserver、requestAnimationFrame

**Spec:** `docs/superpowers/specs/2026-10-09-premium-motion-design.md`

## Global Constraints

- 不新增第三方动效依赖，不重建项目。
- 保留当前设计层级、蓝色品牌色和联系我们区 708px 高度。
- 桌面连续动画只改变 `transform`、`opacity`、`clip-path`。
- 支持 `prefers-reduced-motion`；移动端不启用长距离粘性车型舞台。
- 使用 Figma 精确横版 Logo，保留地球水平镜像。
- 所有浏览器标注的字重和文案修改必须同时适用于响应式布局。

## Review Focus

- 浏览器不支持 `IntersectionObserver` 时，内容、目标数字和导航必须仍可读；Task 2 的降级测试覆盖。
- 快速跨越多个车型阶段时，活动索引必须限制在 0–4；Task 3 的边界测试覆盖。
- 反向滚动时车型位置和焦点必须可逆且连续；Task 3 的纯函数单调性测试覆盖。
- 比价列表鼠标离开或焦点离开后必须恢复“安心护航”；Task 4 的交互测试覆盖。
- 减少动效模式必须禁用长滚动与持续计数；Task 2 和 Task 5 的测试/浏览器验收覆盖。

---

### Task 1: 已确认素材、文案、字体与导航滚动态

**Files:**
- Create: `public/assets/header-logo.svg`
- Modify: `src/assets.js`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: `headerScrolled: boolean` 导航状态；横版 `.brand-logo`；镜像 `.compare-decoration`；修正文案与字重。

- [ ] **Step 1: 扩充失败测试** — 断言顶部横版 Logo、地球 `scaleX(-1)`、三处无逗号文案，以及导航顶部/滚动态 class。
- [ ] **Step 2: 运行 `pnpm test -- --run src/App.test.jsx`** — 预期旧实现因滚动态、文案和字体 class 缺失而失败。
- [ ] **Step 3: 最小实现** — 增加被动 scroll 监听和 24px 阈值；应用 Logo、镜像、文案和标注字重。
- [ ] **Step 4: 运行目标测试** — 预期全部通过。
- [ ] **Step 5: 提交** — `git commit -m "更新导航与页面文字细节"`。

### Task 2: 动效纯函数、揭示与数据计数

**Files:**
- Create: `src/motion.js`
- Create: `src/motion.test.js`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: `clamp(value,min,max)`、`easeOutQuart(progress)`、`countAtProgress(target,progress)`、`useCountUp` 消费的确定性计算。

- [ ] **Step 1: 写失败的纯函数与组件测试** — 覆盖 0/中段/终值、负值/超过 1 的 clamp、减少动效直接终值、观察器不可用降级。
- [ ] **Step 2: 运行 `pnpm test -- --run src/motion.test.js src/App.test.jsx`** — 预期因模块和计数行为不存在而失败。
- [ ] **Step 3: 实现纯函数与计数 hook** — 进入视口后用 rAF 在 2000ms 内更新，播放一次，卸载取消帧。
- [ ] **Step 4: 实现统一揭示 class** — 标题 clip reveal、正文上移去模糊、图片轻微缩放，使用统一高级缓动。
- [ ] **Step 5: 运行目标测试并提交** — `git commit -m "添加区块揭示与数据计数动效"`。

### Task 3: 车型滚动焦点舞台

**Files:**
- Modify: `src/motion.js`
- Modify: `src/motion.test.js`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: `getActiveCarIndex(progress,count)` 和 `getCarPose(index,progress)`；五个车型卡 ref 接收 `{x,scale,opacity,zIndex}`。

- [ ] **Step 1: 写失败测试** — 五个阶段活动索引、0/1 边界、反向进度一致性、五段文案完整。
- [ ] **Step 2: 运行目标测试** — 预期函数和文案缺失而失败。
- [ ] **Step 3: 实现纯姿态计算与滚动 rAF** — 连续更新卡片 translate/scale/opacity，只在最近索引变化时更新说明。
- [ ] **Step 4: 实现桌面 sticky 舞台和移动端 scroll-snap 降级**。
- [ ] **Step 5: 运行目标测试并提交** — `git commit -m "实现车型滚动焦点舞台"`。

### Task 4: 小支比价滑动高亮与图标蓝白互换

**Files:**
- Create: `public/assets/compare-price-active.svg`
- Create: `public/assets/compare-shield-inactive.svg`
- Create: `public/assets/compare-list-active.svg`
- Modify: `src/assets.js`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: 比价活动索引 `activeBenefit`。
- Produces: 共享 `.compare-highlight` 通过 `--active-index` 移动；每项默认/活跃图标双层交叉淡化。

- [ ] **Step 1: 写失败交互测试** — 默认索引 1；mouse enter/focus 切换；mouse leave/blur 恢复；所有项目仍无 click 切换。
- [ ] **Step 2: 运行目标测试** — 预期旧静态实现失败。
- [ ] **Step 3: 实现高亮层、状态事件和三份精确换色 SVG**。
- [ ] **Step 4: 运行目标测试并提交** — `git commit -m "实现比价滑动高亮交互"`。

### Task 5: 区块高度、背景比例与响应式降级

**Files:**
- Modify: `src/styles.css`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: 前述 DOM class 与动效状态。
- Produces: 828px Hero、858px 业务规模、桌面 240–260vh 车型舞台、约 1026px 比价、约 1198px 知心租、708px 联系区。

- [ ] **Step 1: 写失败布局契约测试** — 验证区块 class、减少动效和移动端降级标记存在。
- [ ] **Step 2: 运行目标测试** — 预期旧布局失败。
- [ ] **Step 3: 更新高度与布局** — 知心租背景改为 `cover` 并校准位置；联系区高度不变。
- [ ] **Step 4: 运行完整测试** — `pnpm test` 预期 0 失败。
- [ ] **Step 5: 提交** — `git commit -m "扩展区块空间并完善响应式降级"`。

### Task 6: 生产构建与本地视觉验收

**Files:**
- Modify: `design-qa.md`
- Create: `qa/motion-*.png`

**Interfaces:**
- Consumes: 完整实现。
- Produces: 可复核的桌面、移动端与交互证据。

- [ ] **Step 1: 运行 `pnpm test`、`pnpm build`、`git diff --check`** — 全部退出码 0。
- [ ] **Step 2: 本地 1440×900 检查** — 顶部透明、滚动蓝色、计数终值、五段车型焦点、比价 hover/focus、背景无拉伸、无破图和横向溢出。
- [ ] **Step 3: 本地 390×844 检查** — 菜单、横向车型滑动、比价触控布局、减少动效降级、无横向溢出。
- [ ] **Step 4: 更新 `design-qa.md` 并保存校验截图**。
- [ ] **Step 5: 最终提交** — `git commit -m "完成官网高级动效升级"`，确认工作区干净。
