# 🧠 Brain Sanage — 在线认知训练与脑力测评工具

<p align="center">
  <a href="https://brain.sanage.xyz">
    <img src="./public/logo.png" alt="Brain Sanage Logo" width="120" height="120" style="border-radius: 24px;" />
  </a>
</p>

<p align="center">
  <strong>基于经典心理学实验范式的纯前端脑力训练与测评平台。打开即测，即时反馈，温暖轻盈。</strong>
</p>

<p align="center">
  <a href="https://brain.sanage.xyz">👉 访问在线演示版本 (https://brain.sanage.xyz)</a>
</p>

---

## 🌟 项目亮点

* 🧪 **科学严谨的实验范式**：基于 Stroop（斯特鲁普效应）、N-Back、Schulte Grid（舒尔特方格）等经典认知心理学与神经科学实验范式设计。
* 🎨 **温暖轻盈的奶油风设计**：摒弃冷酷、硬核的传统科技感，采用专为年轻女性群体打造的和谐奶油色系（`#FDF8F3`），营造解压且专注的训练氛围。
* 📱 **移动端优先（Mobile First）**：针对手机设备进行深度像素级适配，提供至少 **44×44px** 的高响应触控区域与大字号表单，拇指触及区域黄金排布。
* ⚡ **卓越的响应速度**：采用 Next.js 静态导出（Static Export）架构，所有游戏引擎纯函数设计，0 秒延迟，本地极速加载与离线运行。
* 🛡️ **绝对的隐私保护**：无注册、无登录、无数据库，所有训练记录与脑力模型完全存储在用户浏览器的本地（IndexedDB/LocalStorage），数据绝不上云。
* 🤖 **AI Agent 友好**：原生支持 [Agent Skills](https://agentskills.io) 协议与 MCP 服务卡片，AI 助理可直接发现、解读并调用本测评工具。

---

## 🎮 丰富的认知训练维度 (11 款内置游戏)

项目涵盖了**注意力、工作记忆、反应速度、执行控制、放松调节**五大维度的测评与训练：

| 训练类别 | 游戏/练习名称 | 心理学原理 / 科学背景 | 大脑训练益处 |
| :--- | :--- | :--- | :--- |
| **注意力控制** | 🎯 [专注力追踪](https://brain.sanage.xyz/attention-span) | 持续性注意力（Sustained Attention） | 测量与训练持续专注的稳定性，如专注力“平板支撑” |
|  | ❌ [抗干扰训练 (Flanker)](https://brain.sanage.xyz/flanker) | 埃里克森双侧冲突范式（Eriksen Flanker Task） | 屏蔽周围噪音，提升嘈杂环境下的选择性注意 |
|  | 🎨 [专注拉回 (Stroop效应)](https://brain.sanage.xyz/stroop-test) | 斯特鲁普干扰效应（Stroop Effect） | 抑制本能冲动，快速拉回走神的大脑 |
|  | 🔢 [舒尔特方格](https://brain.sanage.xyz/schulte-grid) | 视觉搜索与广度（Visual Search & Span） | 扩大视觉外围周边视野，开工前的大脑热身拉伸 |
| **工作记忆** | 🧠 [工作记忆 (N-Back)](https://brain.sanage.xyz/nback-memory) | 经典的 N-Back 范式（工作记忆金标准） | 训练信息更新与暂存能力，提升多任务处理效率 |
|  | 🔢 [数字广度](https://brain.sanage.xyz/digit-span) | 短期记忆容量评估（Digit Span Task） | 测试和扩充大脑的“运行内存（RAM）” |
| **认知灵活性** | 🔀 [专注切换](https://brain.sanage.xyz/task-switching) | 任务切换范式（Task Switching Paradigm） | 减少“做着 A 想着 B”的思维跳跃与摩擦 |
| **抑制控制** | 🛡️ [冲动控制 (Go/No-Go)](https://brain.sanage.xyz/go-nogo) | 反应抑制测试（Go/No-Go Task） | 强化“喊停”能力，改善浮躁，减少冲动决策 |
| **神经速度** | ⚡ [反应速度测试](https://brain.sanage.xyz/reaction-time) | 视觉简单反应时（Simple Reaction Time） | 测试大脑神经信号的基础处理“网速” |
| **放松与启动** | 👁️ [凝视启动](https://brain.sanage.xyz/focus-gaze) | 蓝斑核激活机制（Locus Coeruleus Activation）| 通过盯住一点激活专注中枢，30秒快速开启专注 |
|  | 🌬️ [4-7-8 呼吸法](https://brain.sanage.xyz/breathing-478) | 副交感神经激活练习（4-7-8 Breathing） | 焦虑或疲惫时的一键“降温”与深度放松 |

---

## 🛠️ 技术栈与架构设计

### 核心技术
- **框架**：Next.js 15+ (App Router)
- **语言**：TypeScript
- **渲染模式**：Static HTML Export (`output: 'export'`)
- **样式方案**：Tailwind CSS v4 (基于全新 CSS 变量定义与 `@import "tailwindcss"`)
- **UI 组件库**：shadcn/ui v4 (底层使用 `@base-ui/react`)
- **交互动效**：Framer Motion (支持无障碍 `prefers-reduced-motion` 偏好)
- **数据存储**：本地浏览器 LocalStorage / IndexedDB

### 🧠 纯函数式游戏引擎架构
为了保证可测试性与平台无关的可移植性，项目采用**逻辑与 UI 彻底解耦**的架构。所有的游戏核心引擎都写在标准 TypeScript 中，严禁引入 React Hook 或任何 DOM API：
```
core/stroop-game/
  ├── types.ts      # 强类型定义 (GameState, Trial, Config 等)
  ├── config.ts     # 规则与难度配置
  ├── engine.ts     # 核心计算逻辑 (出题生成器、反应时统计、百分位数计算)
  └── factory.ts    # 复杂的初始化工厂函数
```
这种设计让您能够将核心引擎轻松移植到 React Native 移动端、微信小程序或任何其他框架中。

---

## 🚀 本地快速启动

### 1. 克隆项目并安装依赖
```bash
git clone https://github.com/your-username/brain.sanage.xyz.git
cd brain.sanage.xyz
npm install
```

### 2. 环境配置
在项目根目录下创建 `.env.local` 文件，配置您的 Google Analytics 测量 ID（可选）：
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. 运行开发服务器
```bash
npm run dev
```
打开 [http://localhost:3000](http://localhost:3000) 即可在本地进行体验与调试。

### 4. 静态打包构建
由于项目完全基于纯前端静态设计，可以极为方便地导出为纯 HTML/JS 静态包，部署于 Vercel、GitHub Pages、Cloudflare Pages 或任何静态托管平台：
```bash
npm run build
```
打包输出的内容将生成在 `out/` 目录下。

---

## 🤝 参与贡献

我们非常欢迎各种形式的贡献！无论是发现 Bug、提出新功能建议，还是提交 PR 增加新的心理学测试范式，请随时提交 Issue 或 Pull Request。

### 如何添加一款新游戏？
1. 在 `core/` 下新建您的纯函数式游戏逻辑目录（如 `core/my-new-game/`）。
2. 在 `components/game/` 下使用奶油风规范编写您的游戏交互组件。
3. 在 `config/games.ts` 中配置游戏的元数据（标题、获益点、分类、图标等）。
4. 在 `app/(marketing)/` 下创建路由页面并接入即可。

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 授权。欢迎自由学习、修改和商用。
