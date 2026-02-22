"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [citiesStatus, setCitiesStatus] = useState<string>("");
  const [salariesStatus, setSalariesStatus] = useState<string>("");
  const [calculateStatus, setCalculateStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const citiesInputRef = useRef<HTMLInputElement>(null);
  const salariesInputRef = useRef<HTMLInputElement>(null);

  const handleCitiesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCitiesStatus("上传中...");
    setIsLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: Array.from(new Uint8Array(buffer)),
          filename: file.name,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCitiesStatus(`成功上传 ${result.count} 条城市标准数据`);
      } else {
        setCitiesStatus(`上传失败: ${result.error}`);
      }
    } catch (error) {
      setCitiesStatus(`上传失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalariesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSalariesStatus("上传中...");
    setIsLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const response = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: Array.from(new Uint8Array(buffer)),
          filename: file.name,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSalariesStatus(`成功上传 ${result.count} 条工资数据`);
      } else {
        setSalariesStatus(`上传失败: ${result.error}`);
      }
    } catch (error) {
      setSalariesStatus(`上传失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async () => {
    setCalculateStatus("计算中...");
    setIsLoading(true);

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName: "佛山" }),
      });

      const result = await response.json();
      if (result.success) {
        setCalculateStatus(`计算完成！共 ${result.count} 条结果`);
      } else {
        setCalculateStatus(`计算失败: ${result.error}`);
      }
    } catch (error) {
      setCalculateStatus(`计算失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-8">数据上传</h1>

        <div className="space-y-6">
          {/* 城市标准上传 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">上传城市标准</h2>
            <p className="text-gray-500 text-sm mb-4">
              Excel 格式: city_name, year, base_min, base_max, rate
            </p>
            <input
              type="file"
              ref={citiesInputRef}
              accept=".xlsx,.xls"
              onChange={handleCitiesUpload}
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => citiesInputRef.current?.click()}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              选择城市标准 Excel 文件
            </button>
            {citiesStatus && (
              <p className={`mt-3 text-sm ${citiesStatus.includes("成功") ? "text-green-600" : "text-gray-600"}`}>
                {citiesStatus}
              </p>
            )}
          </div>

          {/* 员工工资上传 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">上传员工工资</h2>
            <p className="text-gray-500 text-sm mb-4">
              Excel 格式: employee_id, employee_name, month, salary_amount
            </p>
            <input
              type="file"
              ref={salariesInputRef}
              accept=".xlsx,.xls"
              onChange={handleSalariesUpload}
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => salariesInputRef.current?.click()}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              选择员工工资 Excel 文件
            </button>
            {salariesStatus && (
              <p className={`mt-3 text-sm ${salariesStatus.includes("成功") ? "text-green-600" : "text-gray-600"}`}>
                {salariesStatus}
              </p>
            )}
          </div>

          {/* 执行计算 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">执行计算</h2>
            <p className="text-gray-500 text-sm mb-4">
              根据佛山市标准计算五险一金
            </p>
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              执行计算并存储结果
            </button>
            {calculateStatus && (
              <p className={`mt-3 text-sm ${calculateStatus.includes("完成") ? "text-green-600" : "text-gray-600"}`}>
                {calculateStatus}
              </p>
            )}
          </div>

          {/* 查看结果 */}
          <Link
            href="/results"
            className="block w-full py-3 px-4 bg-gray-800 text-white text-center rounded-lg hover:bg-gray-900 transition-colors"
          >
            查看计算结果
          </Link>
        </div>
      </div>
    </div>
  );
}
