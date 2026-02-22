# 五险一金计算器 - 项目上下文管理中枢

## 项目概述

构建一个迷你"五险一金"计算器Web应用，根据员工工资数据和城市社保标准，计算公司应缴纳的社保公积金费用，并将结果清晰展示。

---

## 技术栈

| 类别 | 技术选型 |
|------|----------|
| 前端框架 | Next.js (App Router) |
| UI/样式 | Tailwind CSS |
| 数据库/后端 | Supabase |
| Excel解析 | xlsx (SheetJS) |
| 语言 | TypeScript |

---

## 数据库设计 (Supabase)

### 1. cities (城市标准表)

```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键，自增 |
| city_name | text | 城市名 |
| year | text | 年份 |
| base_min | int | 社保基数下限 |
| base_max | int | 社保基数上限 |
| rate | float | 简化综合缴纳比例 (如 0.15) |

### 2. salaries (员工工资表)

```sql
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键，自增 |
| employee_id | text | 员工工号 |
| employee_name | text | 员工姓名 |
| month | text | 年份月份 (YYYYMM) |
| salary_amount | int | 该月工资金额 |

### 3. results (计算结果表)

```sql
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL
);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键，自增 |
| employee_name | text | 员工姓名 |
| city_name | text | 城市名 (计算标准) |
| avg_salary | float | 年度月平均工资 |
| contribution_base | float | 最终缴费基数 |
| company_fee | float | 公司缴纳金额 |

---

## 核心业务逻辑

### 计算流程

```
步骤1: 从 salaries 表读取所有数据
       ↓
步骤2: 按 employee_name 分组
       计算每位员工的"年度月平均工资" = Σ月工资 / 月份数
       ↓
步骤3: 从 cities 表获取佛山市的 base_min, base_max, rate
       ↓
步骤4: 对每位员工确定"最终缴费基数":
       ┌─────────────────────────────────────┐
       │ 平均工资 < base_min → 使用 base_min  │
       │ 平均工资 > base_max → 使用 base_max  │
       │ 否则 → 使用平均工资本身              │
       └─────────────────────────────────────┘
       ↓
步骤5: 计算公司应缴纳金额
       company_fee = 最终缴费基数 × rate
       ↓
步骤6: 将结果存入 results 表
```

### 核心函数签名

```typescript
// 计算函数
async function calculateAndStoreResults(cityName: string): Promise<void>

// 缴费基数确定函数
function determineContributionBase(
  avgSalary: number,
  baseMin: number,
  baseMax: number
): number
```

---

## 前端页面设计

### 页面路由

| 路由 | 页面名称 | 功能描述 |
|------|----------|----------|
| `/` | 主页 | 入口页面，两个导航卡片 |
| `/upload` | 数据上传页 | Excel上传和计算触发 |
| `/results` | 结果查询页 | 表格展示计算结果 |

### `/` - 主页布局

```
┌────────────────────────────────────────┐
│           五险一金计算器                │
├──────────────────┬─────────────────────┤
│                  │                     │
│    数据上传       │     结果查询        │
│                  │                     │
│  上传员工工资和   │   查看五险一金      │
│  城市标准数据     │   计算结果          │
│                  │                     │
│   [点击进入]      │    [点击进入]       │
│                  │                     │
└──────────────────┴─────────────────────┘
```

### `/upload` - 数据上传页功能

- **按钮1**: 上传城市标准 (Excel → cities表)
- **按钮2**: 上传员工工资 (Excel → salaries表)
- **按钮3**: 执行计算并存储结果

### `/results` - 结果展示页

| 员工姓名 | 城市 | 月平均工资 | 缴费基数 | 公司缴纳金额 |
|----------|------|------------|----------|--------------|
| 张三 | 佛山 | 8000.00 | 8000.00 | 1200.00 |
| 李四 | 佛山 | 15000.00 | 12000.00 | 1800.00 |

---

## Excel 文件格式

### 城市标准 Excel (cities.xlsx)

| city_name | year | base_min | base_max | rate |
|-----------|------|----------|----------|------|
| 佛山 | 2024 | 4000 | 20000 | 0.15 |

### 员工工资 Excel (salaries.xlsx)

| employee_id | employee_name | month | salary_amount |
|-------------|---------------|-------|---------------|
| E001 | 张三 | 202401 | 8000 |
| E001 | 张三 | 202402 | 8500 |
| E002 | 李四 | 202401 | 15000 |

---

## 文件结构

```
shebao-0222/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 主页 (/)
│   ├── upload/
│   │   └── page.tsx            # 上传页面 (/upload)
│   ├── results/
│   │   └── page.tsx            # 结果页面 (/results)
│   └── api/
│       ├── cities/
│       │   └── route.ts        # 城市标准 CRUD API
│       ├── salaries/
│       │   └── route.ts        # 员工工资 CRUD API
│       ├── calculate/
│       │   └── route.ts        # 执行计算 API
│       └── results/
│           └── route.ts        # 结果查询 API
├── lib/
│   ├── supabase.ts             # Supabase 客户端配置
│   ├── excel.ts                # Excel 解析工具函数
│   └── calculate.ts            # 核心计算逻辑
├── types/
│   └── index.ts                # TypeScript 类型定义
├── .env.local                  # 环境变量 (不提交)
├── .env.local.example          # 环境变量模板
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── claude.md                   # 本文件
```

---

## 环境变量

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 开发任务清单 (TODO List)

### 阶段一: 环境搭建

- [ ] 1.1 初始化 Next.js 项目
- [ ] 1.2 安装依赖包 (`@supabase/supabase-js`, `xlsx`)
- [ ] 1.3 配置环境变量文件

### 阶段二: Supabase 数据库配置

- [ ] 2.1 创建 `cities` 表
- [ ] 2.2 创建 `salaries` 表
- [ ] 2.3 创建 `results` 表
- [ ] 2.4 配置表访问策略

### 阶段三: 基础架构

- [ ] 3.1 创建 Supabase 客户端 (`lib/supabase.ts`)
- [ ] 3.2 创建类型定义 (`types/index.ts`)
- [ ] 3.3 创建根布局组件

### 阶段四: 核心功能开发

- [ ] 4.1 实现主页 - 导航卡片
- [ ] 4.2 实现 Excel 解析工具 (`lib/excel.ts`)
- [ ] 4.3 实现上传页面 - 文件上传组件
- [ ] 4.4 实现城市标准上传 API (`app/api/cities/route.ts`)
- [ ] 4.5 实现员工工资上传 API (`app/api/salaries/route.ts`)
- [ ] 4.6 实现核心计算函数 (`lib/calculate.ts`)
- [ ] 4.7 实现计算触发 API (`app/api/calculate/route.ts`)

### 阶段五: 结果展示

- [ ] 5.1 实现结果查询 API (`app/api/results/route.ts`)
- [ ] 5.2 实现结果页面 (`app/results/page.tsx`)
- [ ] 5.3 实现结果表格组件

### 阶段六: 测试与优化

- [ ] 6.1 准备测试数据文件
- [ ] 6.2 功能测试
- [ ] 6.3 UI 优化
- [ ] 6.4 错误处理

---

## 注意事项

1. **城市固定**: 当前版本计算时固定使用"佛山"的标准
2. **两个Excel**: cities 和 salaries 分别用两个独立文件上传
3. **结果关联**: results 表包含 city_name 字段记录计算使用的城市标准
4. **凭证配置**: 需要在 `.env.local` 中填入 Supabase 的 URL 和 anon key

---

## 验证方式

1. 访问 `/` 能看到两个导航卡片
2. 在 `/upload` 上传两个 Excel 文件后，Supabase 表中有数据
3. 点击"执行计算"后，results 表中有正确的计算结果
4. 访问 `/results` 能正确展示表格数据