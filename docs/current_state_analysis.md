# Smart Cat Feeding 代码与功能现状分析

本文档基于当前仓库代码整理，目标是说明 `smart_cat_feeding` 已经实现了什么、核心逻辑如何工作，以及目前仍存在的产品与工程边界。

## 1. 项目概览

`smart_cat_feeding` 是一个基于 Vite + React 的前端单页应用，用来根据猫的体重、年龄、活动量、绝育状态、健康目标和食物热量信息，计算每日建议热量与干/湿粮搭配方案。

当前项目没有后端服务、数据库或持久化存储，所有计算、表单状态、食物目录搜索和 UI 交互都在浏览器端完成。

## 2. 技术栈

- 构建工具：Vite
- UI 框架：React 19
- 样式：纯 CSS，主要集中在 `src/App.css` 和 `src/index.css`
- 数据：本地 JavaScript 数组 `src/foodCatalog.js`
- 计算逻辑：独立模块 `src/calculations.js`
- 入口：`src/main.jsx`

可用脚本：

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## 3. 目录结构

```text
smart_cat_feeding/
  src/
    App.jsx             # 主应用组件，包含主要表单流程、搜索、结果展示和弹窗
    calculations.js     # RER/DER 与喂食计划计算函数
    foodCatalog.js      # MVP 食物目录数据
    main.jsx            # React 挂载入口
    App.css             # 应用级样式
    index.css           # 全局基础样式
    assets/             # 碗、hero、默认资源图片
  public/
    favicon.svg
    icons.svg
  docs/
    current_state_analysis.md
```

## 4. 当前用户流程

应用由四个横向面板组成：

1. Overview
2. Cat Profile
3. Food Details
4. Meal Plan

面板支持展开/收起，应用通过内部状态控制当前步骤。用户一般从 Overview 点击开始，进入猫咪基础信息填写，再进入食物信息输入，最后查看 Meal Plan。

`Cat Profile` 未完成时，`Food Details` 会被锁定，并提示缺少哪些字段。`Food Details` 中食物信息不完整时，无法进入结果步骤。

## 5. 已实现功能

### 5.1 猫咪档案输入

当前已经支持以下输入项：

- 体重：支持 `lbs` 与 `kg`
- 年龄：
  - 小于 1 岁
  - 1 至 11 岁
  - 12 岁以上
- 幼猫月龄：当年龄选择小于 1 岁时显示，支持 0 至 12 个月
- 活动水平：
  - Indoor - Couch Potato
  - Indoor Active / Partial Outdoor
  - Fully Outdoor / Highly Active
- 绝育状态：
  - Neutered/Spayed
  - Intact
- 健康目标：
  - Maintain weight
  - Weight Loss
  - Weight Gain

体重输入会自动换算为千克，后续计算统一使用 `weightKg`。

### 5.2 年龄分组

当前代码将猫按年龄分为四类：

- `kitten`：小于 1 岁
- `adult`：1 至 6 岁
- `senior`：7 至 11 岁
- `geriatric`：12 岁以上

不同年龄组使用不同的 DER 计算策略和安全提示。

### 5.3 RER / DER 计算

基础 RER 公式已经实现：

```text
RER = 70 * weightKg ^ 0.75
```

成年猫 DER：

| 绝育状态 | 活动水平 | 倍数 |
| --- | --- | --- |
| 已绝育 | 室内 / 半户外 | 1.2 |
| 已绝育 | 高活动 / 户外 | 1.4 |
| 未绝育 | 室内 / 半户外 | 1.4 |
| 未绝育 | 高活动 / 户外 | 1.6 |

老年猫 DER：

| 绝育状态 | 活动水平 | 倍数 |
| --- | --- | --- |
| 已绝育 | 室内 / 半户外 | 1.0 |
| 已绝育 | 高活动 / 户外 | 1.2 |
| 未绝育 | 所有活动水平 | 1.2 |

高龄猫 DER：

```text
DER = RER * 1.35
```

幼猫 DER 使用“月龄系数 * 体重千克”的方式，而不是 RER 倍数。当前支持 1 至 12 月龄；0 月龄不会计算，并弹出出生到断奶期提示。

### 5.4 健康目标对应的喂食计划

成年猫：

- 维持体重：`DER * 1.0`
- 增重：`DER * 1.1`
- 减重：
  - 第 1-2 周：`RER * 0.9`
  - 第 3 周以后：`RER * 0.8`

老年猫：

- 维持体重：`DER * 1.0`
- 增重：`DER * 1.2`
- 减重：
  - 第 1-2 周：`RER * 0.9`
  - 第 3 周以后：`RER * 0.8`

高龄猫：

- 维持体重：`DER * 1.0`
- 增重：`DER * 1.1`
- 减重：不直接给出减重目标，而是进入 vet alert 流程，并在结果中显示维持热量作为参考

幼猫：

- 使用幼猫月龄系数计算每日热量
- 1 至 9 月龄时，代码会自动隐藏减重目标
- 10 至 12 月龄时，会触发 rib check 流程；如果用户仍选择减重，会显示额外安全提醒

### 5.5 食物输入

应用支持两种已启用的食物输入模式：

- Manual Entry
- Database Search

`Photo Scan` 已在 UI 中出现，但处于禁用状态，提示 Coming soon。

用户可以选择：

- 只喂干粮
- 只喂湿粮
- 干粮 + 湿粮

干粮输入：

- 手动输入 `kcal/kg`
- 数据库模式选择产品后自动填充 `kcalPerKg`

湿粮输入：

- 支持 `kcal/can`
- 支持 `kcal/pouch`
- 需要选择每天喂食的罐/袋比例

湿粮份量选择器已经实现为弹窗，支持：

- 1
- 2/3
- 1/2
- 1/3
- 1/4
- 2
- 1 + 2/3
- 1 + 1/2
- 1 + 1/3
- 1 + 1/4

### 5.6 食物目录搜索

`src/foodCatalog.js` 当前包含 274 条食物数据。

按 `foodType` 统计：

- dry：95
- wet：161
- treat：4
- 空值：14

按 `lifeStage` 统计：

- adult：171
- kitten：32
- senior：24
- all_life_stages：10
- not_specified：37

品牌来源共 6 类，当前数量最多的是：

- Hill's Pet Nutrition：104
- Mars, Incorporated：63
- General Mills, Inc.：34
- Nestle Purina PetCare：33
- Champion Petfoods：26

搜索逻辑在 `App.jsx` 中实现，不依赖外部搜索服务。当前具备：

- 文本标准化：大小写、重音符号、标点、空格归一
- 简单拼写纠错：
  - `purin` -> `purina`
  - `chiken` -> `chicken`
  - `canine` -> `canin`
- Levenshtein 距离容错
- 品牌、产品名、食物类型、search tokens 混合评分
- 结果按评分降序，再按产品名排序

当用户同时选择干粮与湿粮，并使用数据库模式时，应用会进入顺序搜索流程：先选干粮，再开放湿粮搜索。

需要注意：虽然目录中存在 `treat` 和空 `foodType` 数据，但当前搜索和计算流程只实际使用 `dry` 与 `wet`。

### 5.7 Meal Plan 与 Menu Maker

结果面板已实现以下内容：

- Suggested Feeding：展示每日建议热量或减重阶段区间
- The Menu Maker：把湿粮热量和剩余干粮热量组合成每日菜单
- 干粮克数换算：

```text
dryFoodKcalPerGram = dryFoodCalories / 1000
remainingDryGrams = remainingCalories / dryFoodKcalPerGram
```

对于干粮 + 湿粮组合：

- 湿粮热量 = `湿粮每单位热量 * 选择的份量`
- 剩余热量 = `目标每日热量 - 湿粮热量`
- 干粮克数 = `剩余热量 / 干粮每克热量`

对于只选择干粮的场景，当前也会计算每天需要的干粮克数。

减重场景会生成两个阶段的 Menu Maker 条目：

- Week 1-2
- Week 3+

### 5.8 安全提示与防错逻辑

当前 UI 中已经实现了多种 guardrail：

- 0 月龄幼猫：提示出生到断奶阶段暂未覆盖，建议咨询兽医
- 10-12 月龄幼猫：触发 rib check 弹窗
- 幼猫减重：显示增长优先与兽医建议
- 12 岁以上猫减重：强制显示 Vet Alert，需要用户确认
- 湿粮热量超过每日目标：弹窗与结果面板提示
- 湿粮轻微超标：使用更温和的提示
- 成年/老年/高龄猫异常体重提示：
  - 小于 1.5 kg
  - 大于 10 kg
  - 大于等于 25 kg 时阻断计算
  - 大于 50 kg 时显示强烈错误提示
- 干粮手动热量异常提示：
  - 小于等于 1000 kcal/kg
  - 小于 2800 kcal/kg
  - 大于 4800 且小于 6500 kcal/kg
  - 大于等于 6500 kcal/kg
- 湿粮罐头热量异常提示：
  - 大于 300 且小于 500 kcal/can
  - 大于 500 kcal/can

这些提示主要用于防止单位输错、热量数值离谱或高风险减重场景。

### 5.9 UI 与响应式能力

当前页面采用四列横向布局，并通过状态动态调整各面板宽度。样式文件中已经包含响应式断点：

- `max-width: 1080px`
- `max-width: 760px`

在较小屏幕上，布局会切换为单列，面板收起状态也会被弱化，以适配移动端。

应用中还使用了本地图片资产展示空碗、干粮碗、湿粮碗、干湿混合碗等视觉状态。

## 6. 当前工程特点

### 优点

- 计算函数已从主组件中拆出，核心 RER/DER 逻辑相对独立。
- 表单流程较完整，已覆盖用户从基础信息到食物输入再到结果的主路径。
- 安全提示做得比较丰富，尤其是幼猫、高龄猫、减重和热量超标场景。
- 食物目录搜索不依赖网络，MVP 能离线完成核心匹配。
- CSS 覆盖了弹窗、搜索结果、份量图表、进度条和响应式布局。

### 主要技术债

- `App.jsx` 过大，当前超过 2500 行，包含状态管理、搜索算法、计算衔接、渲染和大量文案，后续维护成本较高。
- 搜索逻辑、UI 组件和业务规则都在 `App.jsx` 中，建议逐步拆分为 hooks、组件和工具函数。
- 当前没有测试文件。`calculations.js` 非常适合补充单元测试。
- `README.md` 仍是 Vite 模板默认内容，没有项目说明、运行方式或产品介绍。
- `foodCatalog.js` 是大型静态数组，数据质量存在不一致：例如 `foodType` 为空、存在 `treat` 类型但 UI 未使用。
- 没有持久化能力。刷新页面后，用户输入和选择都会丢失。
- 没有后端校验，所有规则都依赖前端实现。
- 没有明确的医疗免责声明和公式来源说明，虽然 UI 中多处提示咨询兽医。

## 7. 已实现但仍可增强的方向

短期可优先处理：

- 为 `calculations.js` 添加单元测试，覆盖 RER、各年龄组 DER、减重阶段、高龄猫 vet alert。
- 将食物搜索函数从 `App.jsx` 抽出，补充搜索排序测试。
- 拆分 `App.jsx`：
  - `CatProfilePanel`
  - `FoodDetailsPanel`
  - `MealPlanPanel`
  - `Modal` 相关组件
  - `useFeedingCalculator`
  - `useFoodSearch`
- 更新 `README.md`，说明项目目标、运行方法和当前功能。
- 清理或标注 `foodCatalog` 中暂未支持的 `treat` 与空 `foodType` 数据。

中期可考虑：

- 增加本地保存或分享链接能力。
- 增加食物目录数据来源、更新时间和可信度字段展示。
- 支持更多单位，例如干粮 `kcal/cup` 与杯/克换算。
- Photo Scan 功能真正接入图片识别或 OCR。
- 将营养规则配置化，便于后续调整公式和倍数。

## 8. 总结

当前 `smart_cat_feeding` 已经是一个功能较完整的 MVP 前端应用，主路径包括猫咪档案输入、每日热量计算、手动/数据库食物输入、干湿粮组合换算、减重阶段方案以及多种安全提醒。

项目下一阶段最值得投入的是工程结构整理和测试补齐。尤其是 `App.jsx` 的拆分、`calculations.js` 的单元测试、食物目录数据清洗，以及 README 更新，会显著提升后续迭代速度和稳定性。
