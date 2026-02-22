"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Result } from "@/types";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/results");
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
      } else {
        setError(data.error || "获取数据失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
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

        <h1 className="text-2xl font-bold text-gray-800 mb-8">计算结果</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            暂无数据，请先上传数据并执行计算
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      员工姓名
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      城市
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      月平均工资
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      缴费基数
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      公司缴纳金额
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((result, index) => (
                    <tr key={result.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {result.employee_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.city_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right font-mono">
                        {formatNumber(result.avg_salary)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right font-mono">
                        {formatNumber(result.contribution_base)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 text-right font-mono font-semibold">
                        {formatNumber(result.company_fee)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 汇总信息 */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  共 {results.length} 条记录
                </span>
                <span className="text-sm text-gray-600">
                  公司缴纳总计:{" "}
                  <span className="font-semibold text-green-600">
                    {formatNumber(results.reduce((sum, r) => sum + r.company_fee, 0))}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
