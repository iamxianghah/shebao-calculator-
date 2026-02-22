import { supabase } from "./supabase";
import { Salary, City, Result } from "@/types";

/**
 * 确定最终缴费基数
 */
export function determineContributionBase(
  avgSalary: number,
  baseMin: number,
  baseMax: number
): number {
  if (avgSalary < baseMin) {
    return baseMin;
  }
  if (avgSalary > baseMax) {
    return baseMax;
  }
  return avgSalary;
}

/**
 * 计算并存储结果
 */
export async function calculateAndStoreResults(
  cityName: string
): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    // 1. 获取城市标准
    const { data: cityData, error: cityError } = await supabase
      .from("cities")
      .select("*")
      .eq("city_name", cityName)
      .single();

    if (cityError || !cityData) {
      return { success: false, error: `未找到城市: ${cityName}` };
    }

    const city = cityData as City;

    // 2. 获取所有员工工资数据
    const { data: salaryData, error: salaryError } = await supabase
      .from("salaries")
      .select("*");

    if (salaryError) {
      return { success: false, error: "获取工资数据失败" };
    }

    if (!salaryData || salaryData.length === 0) {
      return { success: false, error: "没有工资数据" };
    }

    // 3. 按员工姓名分组计算月平均工资
    const salaries = salaryData as Salary[];
    const employeeMap = new Map<string, number[]>();

    salaries.forEach((salary) => {
      const existing = employeeMap.get(salary.employee_name) || [];
      existing.push(salary.salary_amount);
      employeeMap.set(salary.employee_name, existing);
    });

    // 4. 计算每位员工的结果
    const results: Result[] = [];

    employeeMap.forEach((salaryList, employeeName) => {
      const avgSalary = salaryList.reduce((a, b) => a + b, 0) / salaryList.length;
      const contributionBase = determineContributionBase(
        avgSalary,
        city.base_min,
        city.base_max
      );
      const companyFee = contributionBase * city.rate;

      results.push({
        employee_name: employeeName,
        city_name: cityName,
        avg_salary: avgSalary,
        contribution_base: contributionBase,
        company_fee: companyFee,
      });
    });

    // 5. 清空旧结果并插入新结果
    const { error: deleteError } = await supabase
      .from("results")
      .delete()
      .neq("id", 0);

    if (deleteError) {
      return { success: false, error: "清空旧结果失败" };
    }

    const { error: insertError } = await supabase
      .from("results")
      .insert(results);

    if (insertError) {
      return { success: false, error: "存储结果失败" };
    }

    return { success: true, count: results.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "计算过程出错",
    };
  }
}
