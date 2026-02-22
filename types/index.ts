// 城市标准类型
export interface City {
  id?: number;
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

// 员工工资类型
export interface Salary {
  id?: number;
  employee_id: string;
  employee_name: string;
  month: string;
  salary_amount: number;
}

// 计算结果类型
export interface Result {
  id?: number;
  employee_name: string;
  city_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

// Excel 解析结果类型
export interface ExcelParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}
