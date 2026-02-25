// Request caching and deduplication utility
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  }

  // Generate cache key from request details
  generateKey(url, method = 'GET', params = {}) {
    const key = `${method}:${url}:${JSON.stringify(params)}`;
    return key;
  }

  // Check if cached data is still valid
  isValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  // Get cached data if valid
  get(url, method = 'GET', params = {}) {
    const key = this.generateKey(url, method, params);
    const cached = this.cache.get(key);
    
    if (cached && this.isValid(cached)) {
      return cached.data;
    }
    
    // Clean up expired cache
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  // Set cached data
  set(url, method = 'GET', params = {}, data, ttl = this.DEFAULT_TTL) {
    const key = this.generateKey(url, method, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Invalidate cache for specific pattern
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Request deduplication
  async deduplicate(key, requestFn) {
    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request promise
    const requestPromise = requestFn()
      .finally(() => {
        // Clean up pending request
        this.pendingRequests.delete(key);
      });

    // Store pending request
    this.pendingRequests.set(key, requestPromise);
    
    return requestPromise;
  }

  // Cached request wrapper
  async cachedRequest(url, requestFn, options = {}) {
    const {
      method = 'GET',
      params = {},
      ttl = this.DEFAULT_TTL,
      skipCache = false,
      skipDeduplication = false
    } = options;

    const key = this.generateKey(url, method, params);

    // Check cache first (unless skipped)
    if (!skipCache) {
      const cached = this.get(url, method, params);
      if (cached) {
        return cached;
      }
    }

    // Deduplicate request (unless skipped)
    const executeRequest = async () => {
      const response = await requestFn();
      
      // Cache successful responses
      if (response && !skipCache) {
        this.set(url, method, params, response, ttl);
      }
      
      return response;
    };

    if (skipDeduplication) {
      return executeRequest();
    }

    return this.deduplicate(key, executeRequest);
  }
}

// Create singleton instance
const requestCache = new RequestCache();

// Cached service wrapper
export const createCachedService = (service, cacheConfig = {}) => {
  const cachedService = {};
  
  Object.keys(service).forEach(methodName => {
    const originalMethod = service[methodName];
    
    if (typeof originalMethod !== 'function') {
      cachedService[methodName] = originalMethod;
      return;
    }

    cachedService[methodName] = async (...args) => {
      const config = cacheConfig[methodName] || {};
      const {
        cache = true,
        ttl = requestCache.DEFAULT_TTL,
        keyGenerator = () => `${methodName}:${JSON.stringify(args)}`
      } = config;

      if (!cache) {
        return originalMethod.apply(service, args);
      }

      const cacheKey = keyGenerator(...args);
      
      return requestCache.cachedRequest(
        cacheKey,
        () => originalMethod.apply(service, args),
        { ttl, skipCache: !cache }
      );
    };
  });

  return cachedService;
};

export { requestCache };
export default requestCache;