// ═══════════════════════════════════════════════════════════════
// CACHED SERVICES - Main Caching API
// ═══════════════════════════════════════════════════════════════
// 
// This is the PRIMARY way to use cached API calls in components.
// 
// ✅ USE THIS in components and pages:
//    import { cachedProductService } from '../services/cachedServices'
//    const products = await cachedProductService.getAll()
// 
// Benefits:
// - Automatic caching with configurable TTL
// - Request deduplication (prevents duplicate API calls)
// - Cache invalidation helpers
// - Preload critical data on app startup
// 
// Architecture:
// - Uses requestCache.js as internal utility (low-level)
// - Wraps service calls with caching logic (high-level)
// - Provides clean API for components
// 
// ═══════════════════════════════════════════════════════════════

import { createCachedService } from '../utils/requestCache';
import { productService } from './product';
import { categoryService } from './category';
import { taxService } from './tax';
import { heroService } from './hero';
import { supportService } from './support';

// Cache configurations for different services
const cacheConfigs = {
  // Product service caching
  product: {
    getAll: { 
      cache: true, 
      ttl: 10 * 60 * 1000, // 10 minutes
      keyGenerator: () => 'products:all'
    },
    getById: { 
      cache: true, 
      ttl: 15 * 60 * 1000, // 15 minutes
      keyGenerator: (id) => `product:${id}`
    },
    // Don't cache create/update/delete operations
    create: { cache: false },
    update: { cache: false },
    delete: { cache: false }
  },

  // Category service caching
  category: {
    getAll: { 
      cache: true, 
      ttl: 30 * 60 * 1000, // 30 minutes - categories change rarely
      keyGenerator: () => 'categories:all'
    },
    getById: { 
      cache: true, 
      ttl: 30 * 60 * 1000,
      keyGenerator: (id) => `category:${id}`
    },
    create: { cache: false },
    update: { cache: false },
    delete: { cache: false }
  },

  // Tax service caching
  tax: {
    getTaxSettings: { 
      cache: true, 
      ttl: 60 * 60 * 1000, // 1 hour - tax settings change rarely
      keyGenerator: () => 'tax:settings'
    },
    updateTaxSettings: { cache: false }
  },

  // Hero service caching
  hero: {
    getHeroSettings: { 
      cache: true, 
      ttl: 15 * 60 * 1000, // 15 minutes
      keyGenerator: () => 'hero:settings'
    },
    updateHeroSettings: { cache: false },
    uploadVideo: { cache: false },
    deleteVideo: { cache: false }
  },

  // Support service caching
  support: {
    getSupportCards: { 
      cache: true, 
      ttl: 30 * 60 * 1000, // 30 minutes
      keyGenerator: () => 'support:cards'
    },
    getFAQs: { 
      cache: true, 
      ttl: 30 * 60 * 1000,
      keyGenerator: () => 'support:faqs'
    },
    getContactInfo: { 
      cache: true, 
      ttl: 60 * 60 * 1000, // 1 hour
      keyGenerator: () => 'support:contact'
    },
    getWhatsAppSettings: { 
      cache: true, 
      ttl: 60 * 60 * 1000,
      keyGenerator: () => 'support:whatsapp'
    },
    getPolicies: { 
      cache: true, 
      ttl: 60 * 60 * 1000,
      keyGenerator: () => 'support:policies'
    },
    // Don't cache update operations
    updateSupportCards: { cache: false },
    updateFAQs: { cache: false },
    updateContactInfo: { cache: false },
    updateWhatsAppSettings: { cache: false },
    updatePolicies: { cache: false }
  }
};

// Create cached service instances
export const cachedProductService = createCachedService(productService, cacheConfigs.product);
export const cachedCategoryService = createCachedService(categoryService, cacheConfigs.category);
export const cachedTaxService = createCachedService(taxService, cacheConfigs.tax);
export const cachedHeroService = createCachedService(heroService, cacheConfigs.hero);
export const cachedSupportService = createCachedService(supportService, cacheConfigs.support);

// Cache invalidation helpers
export const invalidateProductCache = () => {
  const { requestCache } = require('../utils/requestCache');
  requestCache.invalidate('product');
};

export const invalidateCategoryCache = () => {
  const { requestCache } = require('../utils/requestCache');
  requestCache.invalidate('category');
};

export const invalidateTaxCache = () => {
  const { requestCache } = require('../utils/requestCache');
  requestCache.invalidate('tax');
};

export const invalidateHeroCache = () => {
  const { requestCache } = require('../utils/requestCache');
  requestCache.invalidate('hero');
};

export const invalidateSupportCache = () => {
  const { requestCache } = require('../utils/requestCache');
  requestCache.invalidate('support');
};

// Preload critical data
export const preloadCriticalData = async () => {
  try {
    // Preload categories and hero settings in parallel
    await Promise.allSettled([
      cachedCategoryService.getAll(),
      cachedHeroService.getHeroSettings(),
      cachedTaxService.getTaxSettings()
    ]);
  } catch (error) {
    console.warn('Failed to preload some critical data:', error);
  }
};

export default {
  cachedProductService,
  cachedCategoryService,
  cachedTaxService,
  cachedHeroService,
  cachedSupportService,
  invalidateProductCache,
  invalidateCategoryCache,
  invalidateTaxCache,
  invalidateHeroCache,
  invalidateSupportCache,
  preloadCriticalData
};