'use client';

import { useState, useEffect } from 'react';
import ListingCard from './ListingCard';
import { getCategoryName } from '@/lib/categoryMapping';

interface Listing {
  id: number;
  post_id: string;
  author_name: string;
  title: string;
  category: string;
  sub_category?: string;
  confidence_score: number;
  created_at: string;
  update_date: number;
  analyzed_at: string;
}

interface SidePanelProps {
  category: string;
  onClose: () => void;
}

export default function SidePanel({ category, onClose }: SidePanelProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Fetch listings for this category
  useEffect(() => {
    fetchListings();
  }, [category]);

  // Filter and sort listings
  useEffect(() => {
    let filtered = [...listings];

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.post_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting by date (update_date is Unix timestamp in seconds)
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.update_date - a.update_date;
      } else {
        return a.update_date - b.update_date;
      }
    });

    setFilteredListings(filtered);
  }, [listings, searchQuery, sortOrder]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/listings?category=${encodeURIComponent(category)}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardExpand = (postId: string) => {
    setExpandedCard(expandedCard === postId ? null : postId);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Left Sidebar Panel */}
      <div className="fixed left-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {getCategoryName(category)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="إغلاق"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {listings.length} {listings.length === 1 ? 'إعلان' : 'إعلان'}
          </p>

          {/* Search within category */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث ضمن الفئة..."
              className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
            <svg
              className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
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

          {/* Sort Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">الترتيب:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {sortOrder === 'newest' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
            </button>
          </div>
        </div>

        {/* Listings */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">جاري التحميل...</div>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.post_id}
                  listing={listing}
                  isExpanded={expandedCard === listing.post_id}
                  onExpand={() => handleCardExpand(listing.post_id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                {searchQuery ? 'لا توجد إعلانات مطابقة' : 'لا توجد إعلانات في هذه الفئة'}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
