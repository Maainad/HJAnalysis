/**
 * Main Category Mapping (English → Arabic)
 *
 * Add your main categories here. Sub-categories are NOT translated.
 */

export const categoryMapping: Record<string, string> = {
  // Main Categories
  'vehicles': 'المركبات',
  'jobs': 'الوظائف',
  'real_estate': 'العقارات',
  'electronics': 'الإلكترونيات',
  'furniture': 'الأثاث',
  'fashion': 'الأزياء',
  'services': 'الخدمات',
  'pets': 'الحيوانات الأليفة',
  'sports': 'الرياضة',
  'other': 'أخرى',
  "livestock": "الحيوانات",
  "license_plates": "لوح سيارات",
  "entertainment": "ترفيه",
  "business_opportunities": "فرص استثمارية",
  "appliances": "أجهزة منزلية",
  "weapons": "أسلحة",
  "collectibles": "مقتنيات",
  "vehicle_parts": "قطع غيار",
  "financial_services": "خدمات مالية",
  "health_products": "منتجات صحة / عناية",
  "household_items": "أغراض منزلية",
  "home_decor": "ديكور",
  "plants": "نباتات",
  "unspecified_demand": "غير مصنف",
  "apparel": "ملابس",
  "vehicle_documents": "مستندات",
  "telecom": "اتصالات",
  "building_materials": "أدوات بناء",
  "chemicals": "مواد كيميائية",
  "agricultural_equipment": "معدات زراعية",
  "food": "طعام",
  "personal_accessories": "مستلزمات شخصية",
  "tools": "أدوات"
};

/**
 * Get the Arabic name for a category, or return the original name if no mapping exists
 */
export function getCategoryName(englishName: string): string {
  return categoryMapping[englishName.toLowerCase()] || englishName;
}

/**
 * Get all category mappings
 */
export function getAllCategories(): Record<string, string> {
  return categoryMapping;
}

/**
 * Check if a category has a mapping
 */
export function hasCategoryMapping(englishName: string): boolean {
  return englishName.toLowerCase() in categoryMapping;
}
