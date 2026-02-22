# 五险一金计算器

一个基于 Next.js 的五险一金计算器 Web 应用，根据员工工资数据和城市社保标准，计算公司应缴纳的社保公积金费用。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI/样式**: Tailwind CSS v4
- **数据库/后端**: Supabase
- **Excel解析**: xlsx (SheetJS)
- **语言**: TypeScript

## 功能特点

- 📤 **数据上传**: 支持上传 Excel 格式的城市标准和员工工资数据
- 📊 **自动计算**: 根据佛山市社保标准自动计算五险一金
- 📋 **结果展示**: 清晰的表格展示计算结果
- 🎨 **现代UI**: 使用 Tailwind CSS 构建的响应式界面

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/iamxianghah/shebao-calculator-.git
cd shebao-calculator-
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 创建 Supabase 数据表

在 Supabase SQL Editor 中执行：

```sql
-- 城市标准表
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL
);

-- 员工工资表
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL
);

-- 计算结果表
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL
);

-- 配置 RLS 策略
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for cities" ON cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for salaries" ON salaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for results" ON results FOR ALL USING (true) WITH CHECK (true);
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## Excel 文件格式

### 城市标准 (cities.xlsx)

| city_name | year | base_min | base_max | rate |
|-----------|------|----------|----------|------|
| 佛山 | 2024 | 4546 | 26421 | 0.14 |

### 员工工资 (salaries.xlsx)

| employee_id | employee_name | month | salary_amount |
|-------------|---------------|-------|---------------|
| 0001 | 张三 | 202401 | 30000 |

## 计算逻辑

1. 计算每位员工的年度月平均工资
2. 根据城市社保基数上下限确定最终缴费基数：
   - 平均工资 < 下限 → 使用下限
   - 平均工资 > 上限 → 使用上限
   - 否则 → 使用平均工资
3. 公司缴纳金额 = 缴费基数 × 缴纳比例

## 项目结构

```
shebao-calculator-/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页
│   ├── upload/page.tsx     # 上传页面
│   ├── results/page.tsx    # 结果页面
│   └── api/                # API 路由
├── lib/
│   ├── supabase.ts         # Supabase 客户端
│   ├── excel.ts            # Excel 解析工具
│   └── calculate.ts        # 核心计算逻辑
├── types/
│   └── index.ts            # TypeScript 类型定义
└── .env.local              # 环境变量
```

## License

MIT
