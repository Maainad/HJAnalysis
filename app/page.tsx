'use client';

import { useState, useEffect } from 'react';
import BarChart from '@/components/BarChart';
import SearchBar from '@/components/SearchBar';
import SidePanel from '@/components/SidePanel';
import { formatArabicDate } from '@/lib/dateUtils';

interface Category {
  category: string;
  count: number;
}

interface CategoryData {
  categories: Category[];
  total: number;
}

export default function Dashboard() {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Initial fetch and setup polling to refresh UI
  useEffect(() => {
    fetchCategories();
    fetchLastUpdate();

    // Poll every 20 minutes to check for new data from backend
    const pollInterval = setInterval(() => {
      fetchCategories();
      fetchLastUpdate();
    }, 20 * 60 * 1000); // 20 minutes

    return () => clearInterval(pollInterval);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategoryData(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastUpdate = async () => {
    try {
      const response = await fetch('/api/last-update');
      const data = await response.json();
      if (data.lastUpdate) {
        setLastUpdate(new Date(data.lastUpdate));
      }
    } catch (error) {
      console.error('Error fetching last update:', error);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleClosePanel = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-full lg:max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 text-right">
            تحليل الطلب في حراج
          </h1>
          <div className="mt-3 flex items-center gap-6 text-gray-600 justify-start">
              <p dir="rtl">
              {loading
                ? 'جاري التحميل...'
                : `${categoryData?.total || 0} إعلان مطلوب تم تحليله`}
            </p>
            {lastUpdate && (
              <p className="text-sm" dir="rtl">
                آخر تحديث: {formatArabicDate(lastUpdate)}
              </p>
            )}

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-full lg:max-w-3xl">
        {/* Global Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Bar Chart */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">جاري تحميل الفئات...</div>
          </div>
        ) : categoryData && categoryData.categories.length > 0 ? (
          <BarChart
            categories={categoryData.categories}
            total={categoryData.total}
            onCategoryClick={handleCategoryClick}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">لا توجد بيانات</p>
              <p className="text-sm mt-2">
                قم بتشغيل سكربت التحليل لملء لوحة التحكم
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Side Panel */}
      {selectedCategory && (
        <SidePanel
          category={selectedCategory}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}
