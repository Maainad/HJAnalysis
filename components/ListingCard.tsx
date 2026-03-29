'use client';

import { useState, useEffect } from 'react';
import { formatArabicDate } from '@/lib/dateUtils';
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
  analyzed_at: string;
}

interface FullPost {
  [key: string]: any;
}

interface ListingCardProps {
  listing: Listing;
  isExpanded: boolean;
  onExpand: () => void;
}

export default function ListingCard({ listing, isExpanded, onExpand }: ListingCardProps) {
  const [fullPost, setFullPost] = useState<FullPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);

  // Fetch full post details when expanded
  useEffect(() => {
    if (isExpanded && !fullPost) {
      fetchFullPost();
    }
  }, [isExpanded]);

  const fetchFullPost = async () => {
    setLoadingPost(true);
    try {
      const response = await fetch(`/api/post/${listing.post_id}`);
      const data = await response.json();
      setFullPost(data.post);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoadingPost(false);
    }
  };

  const renderImages = () => {
    if (!fullPost) return null;

    // Try different possible image field names
    const imageFields = ['images_list', 'images', 'image_urls', 'image', 'photos'];
    let images: string[] = [];

    for (const field of imageFields) {
      if (fullPost[field]) {
        if (Array.isArray(fullPost[field])) {
          images = fullPost[field];
        } else if (typeof fullPost[field] === 'string') {
          try {
            images = JSON.parse(fullPost[field]);
          } catch {
            images = [fullPost[field]];
          }
        }
        break;
      }
    }

    if (images.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">الصور</h4>
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((url, index) => (
            <div key={index} className="w-full h-32 border border-gray-200 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
              <img
                src={url}
                alt={`صورة ${index + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
        {images.length > 4 && (
          <p className="text-xs text-gray-500 mt-2">
            +{images.length - 4} صور إضافية
          </p>
        )}
      </div>
    );
  };

  const renderTags = () => {
    if (!fullPost || !fullPost.tags) return null;

    let tags: string[] = [];

    // Parse tags if it's a string
    if (typeof fullPost.tags === 'string') {
      try {
        // Try parsing as JSON array
        tags = JSON.parse(fullPost.tags);
      } catch {
        // If not JSON, split by comma
        tags = fullPost.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      }
    } else if (Array.isArray(fullPost.tags)) {
      tags = fullPost.tags;
    }

    if (tags.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">الوسوم</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50/50 text-teal-700 border border-teal-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderDescription = () => {
    if (!fullPost || !fullPost.body) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">الوصف</h4>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {fullPost.body}
        </p>
      </div>
    );
  };

  const renderFullPostDetails = () => {
    if (!fullPost) return null;

    // Fields to exclude from details view
    const excludeFields = ['images_list', 'images', 'image_urls', 'image', 'photos', 'id', 'thumb_url', 'tags', 'body', 'title'];

    // Arabic field name mapping
    const fieldNames: { [key: string]: string } = {
      'title': 'العنوان',
      'body': 'الوصف',
      'author_username': 'اسم المعلن',
      'city': 'المدينة',
      'price': 'السعر',
      'comment_count': 'عدد التعليقات',
      'post_date': 'تاريخ النشر',
      'update_date': 'تاريخ التحديث',
      'scraped_at': 'تاريخ الاستخراج'
    };

    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">التفاصيل الكاملة</h4>
        <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
          {/* Listing metadata at top */}
          <div className="flex">
            <span className="font-medium text-gray-600 min-w-[120px]">رقم الإعلان:</span>
            <span className="text-gray-900 break-words flex-1 font-mono">{listing.post_id}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-600 min-w-[120px]">الفئة:</span>
            <span className="text-gray-900 break-words flex-1">
              {getCategoryName(listing.category)}
              {listing.sub_category && ` - ${listing.sub_category}`}
            </span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-600 min-w-[120px]">تاريخ التحليل:</span>
            <span className="text-gray-900 break-words flex-1">{formatArabicDate(listing.analyzed_at)}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Other post details */}
          {Object.entries(fullPost).map(([key, value]) => {
            if (excludeFields.includes(key)) return null;
            if (value === null || value === undefined) return null;

            let displayValue = value;
            if (typeof value === 'object') {
              displayValue = JSON.stringify(value, null, 2);
            } else if (typeof value === 'string' && value.length > 200) {
              displayValue = value.substring(0, 200) + '...';
            }

            return (
              <div key={key} className="flex">
                <span className="font-medium text-gray-600 min-w-[120px]">
                  {fieldNames[key] || key.replace(/_/g, ' ')}:
                </span>
                <span className="text-gray-900 break-words flex-1">
                  {String(displayValue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header - Always Visible */}
      <button
        onClick={onExpand}
        className="w-full px-4 py-3"
      >
        <div className="flex items-start justify-between">
          <div className="flex-shrink-0 flex items-center">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-md font-medium text-gray-900 line-clamp-2 text-right">
              {listing.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 justify-start">
              <span>{listing.author_name || 'غير معروف'}</span>
              <span>•</span>
              <span>{formatArabicDate(listing.created_at)}</span>
              <span>•</span>
              <span className="font-medium text-teal-600">{listing.confidence_score}%</span>

            </div>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            {loadingPost ? (
              <div className="py-8 text-center text-gray-500">
                جاري تحميل تفاصيل الإعلان...
              </div>
            ) : fullPost ? (
              <>
                {renderDescription()}
                {renderImages()}
                {renderTags()}
                {renderFullPostDetails()}
              </>
            ) : (
              <div className="py-4 text-center text-gray-500 text-sm">
                فشل تحميل تفاصيل الإعلان
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
