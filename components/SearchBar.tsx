'use client';

import { useState, useEffect } from 'react';
import { getCategoryName } from '@/lib/categoryMapping';
import { formatArabicDate } from '@/lib/dateUtils';

interface SearchResult {
  post_id: string;
  title: string;
  category: string;
  sub_category?: string;
  confidence_score: number;
  author_name: string;
  created_at: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث برقم الإعلان أو العنوان..."
          className="w-full px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <svg
          className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500">
              جاري البحث...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <div
                  key={result.post_id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        رقم الإعلان: {result.post_id}
                      </p>
                    </div>
                    <div className="mr-4 flex-shrink-0 text-left">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded">
                          {getCategoryName(result.category)}
                        </span>
                        {result.sub_category && (
                          <p className="text-xs text-gray-600">
                            {result.sub_category}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.confidence_score}% دقة
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{result.author_name || 'غير معروف'}</span>
                    <span>•</span>
                    <span>{formatArabicDate(result.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              لا توجد نتائج لـ &quot;{query}&quot;
            </div>
          )}
        </div>
      )}

      {/* Overlay to close results */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
