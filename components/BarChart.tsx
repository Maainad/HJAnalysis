'use client';

import { getCategoryName } from '@/lib/categoryMapping';

interface Category {
  category: string;
  count: number;
}

interface BarChartProps {
  categories: Category[];
  total: number;
  onCategoryClick: (category: string) => void;
}

export default function BarChart({ categories, total, onCategoryClick }: BarChartProps) {
  // Calculate max value for scaling bars
  const maxCount = Math.max(...categories.map(c => c.count));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-right">
        الطلب حسب الفئة
      </h2>

      <div className="space-y-4">
        {categories.map((category) => {
          const barWidth = (category.count / maxCount) * 100;
          const percentage = ((category.count / total) * 100).toFixed(1);

          return (
            <div
              key={category.category}
              className="group"
            >
              {/* Category Label */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {getCategoryName(category.category)}
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  {category.count} إعلان ({percentage}%)
                </span>
              </div>

              {/* Bar */}
              <button
                onClick={() => onCategoryClick(category.category)}
                className="w-full"
              >
                <div className="relative w-full h-10 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="absolute right-0 top-0 h-full bg-teal-500 transition-all duration-300 hover:bg-teal-600 cursor-pointer flex items-center justify-start px-3"
                    style={{ width: `${barWidth}%` }}
                  >
                    <span className="text-white text-sm font-medium">
                      {category.count}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          لا توجد فئات
        </div>
      )}
    </div>
  );
}
