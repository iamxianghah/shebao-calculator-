import * as XLSX from "xlsx";
import { City, Salary, ExcelParseResult } from "@/types";

/**
 * 规范化字段名：去除空格、处理常见拼写错误
 */
function normalizeFieldName(key: string): string {
  const normalized = key.trim().toLowerCase();

  // 处理常见拼写错误
  const mappings: Record<string, string> = {
    "city_namte": "city_name",
    "city_name": "city_name",
  };

  return mappings[normalized] || normalized;
}

/**
 * 规范化行数据的键名
 */
function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeFieldName(key)] = value;
  }
  return normalized;
}

/**
 * 解析城市标准 Excel 文件
 */
export function parseCitiesExcel(
  buffer: ArrayBuffer
): ExcelParseResult<City> {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    const cities: City[] = rawData.map((row) => {
      const normalized = normalizeRow(row);
      return {
        city_name: String(normalized["city_name"] || ""),
        year: String(normalized["year"] || ""),
        base_min: Number(normalized["base_min"]) || 0,
        base_max: Number(normalized["base_max"]) || 0,
        rate: Number(normalized["rate"]) || 0,
      };
    });

    return { success: true, data: cities };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Excel 解析失败",
    };
  }
}

/**
 * 解析员工工资 Excel 文件
 */
export function parseSalariesExcel(
  buffer: ArrayBuffer
): ExcelParseResult<Salary> {
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    const salaries: Salary[] = rawData.map((row) => {
      const normalized = normalizeRow(row);
      return {
        employee_id: String(normalized["employee_id"] || ""),
        employee_name: String(normalized["employee_name"] || ""),
        month: String(normalized["month"] || ""),
        salary_amount: Number(normalized["salary_amount"]) || 0,
      };
    });

    return { success: true, data: salaries };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Excel 解析失败",
    };
  }
}
