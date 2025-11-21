// ===== API CLIENT FOR BACKEND COMMUNICATION =====

class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Generic request method with error handling and caching
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = `${options.method || 'GET'}_${url}_${JSON.stringify(options.body || {})}`;
        
        // Check cache for GET requests
        if ((!options.method || options.method === 'GET') && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache successful GET requests
            if (!options.method || options.method === 'GET') {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }
            
            return data;
            
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw new Error(`Failed to ${options.method || 'fetch'} ${endpoint}: ${error.message}`);
        }
    }
    
    /**
     * Get all projects with optional filtering
     */
    async getProjects(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.category) {
            params.append('category', filters.category);
        }
        if (filters.featured) {
            params.append('featured', 'true');
        }
        
        const queryString = params.toString();
        const endpoint = `/api/projects${queryString ? `?${queryString}` : ''}`;
        
        return await this.request(endpoint);
    }
    
    /**
     * Get skills grouped by category
     */
    async getSkills() {
        return await this.request('/api/skills');
    }
    
    /**
     * Get testimonials
     */
    async getTestimonials() {
        return await this.request('/api/testimonials');
    }
    
    /**
     * Get timeline items
     */
    async getTimeline() {
        return await this.request('/api/timeline');
    }
    
    /**
     * Get portfolio statistics
     */
    async getStats() {
        return await this.request('/api/stats');
    }
    
    /**
     * Get social media feed
     */
    async getSocialFeed() {
        return await this.request('/api/social');
    }
    
    /**
     * Submit contact form
     */
    async submitContact(data) {
        // Validate required fields
        if (!data.name || !data.email || !data.message) {
            throw new Error('Name, email, and message are required');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Sanitize input data
        const sanitizedData = {
            name: this.sanitizeInput(data.name),
            email: this.sanitizeInput(data.email),
            subject: data.subject ? this.sanitizeInput(data.subject) : '',
            message: this.sanitizeInput(data.message)
        };
        
        return await this.request('/api/contact', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
    }
    
    /**
     * Sanitize user input to prevent XSS
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove < and > characters
            .substring(0, 1000); // Limit length
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Get cache size and stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
    
    /**
     * Retry mechanism for failed requests
     */
    async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.request(endpoint, options);
            } catch (error) {
                lastError = error;
                
                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    console.warn(`API request attempt ${attempt} failed, retrying in ${delay}ms...`);
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Batch multiple API requests
     */
    async batchRequests(requests) {
        const promises = requests.map(({ endpoint, options }) => 
            this.request(endpoint, options).catch(error => ({ error: error.message }))
        );
        
        return await Promise.all(promises);
    }
    
    /**
     * Preload commonly used data
     */
    async preloadData() {
        try {
            const preloadPromises = [
                this.getProjects({ featured: true }),
                this.getSkills(),
                this.getStats()
            ];
            
            await Promise.all(preloadPromises);
            console.log('Common data preloaded successfully');
        } catch (error) {
            console.warn('Failed to preload some data:', error);
        }
    }
    
    /**
     * Health check endpoint
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/api/stats`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
    
    /**
     * Monitor API performance
     */
    monitorPerformance() {
        const originalRequest = this.request.bind(this);
        
        this.request = async function(endpoint, options = {}) {
            const startTime = performance.now();
            
            try {
                const result = await originalRequest(endpoint, options);
                const duration = performance.now() - startTime;
                
                console.log(`API ${endpoint}: ${duration.toFixed(2)}ms`);
                
                if (duration > 2000) {
                    console.warn(`Slow API request detected: ${endpoint} took ${duration.toFixed(2)}ms`);
                }
                
                return result;
            } catch (error) {
                const duration = performance.now() - startTime;
                console.error(`API ${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
                throw error;
            }
        };
    }
}

// ===== REAL-TIME DATA UPDATES (if WebSocket support is added later) =====
class RealtimeUpdates {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.listeners = new Map();
        this.connected = false;
    }
    
    /**
     * Simulate real-time updates with polling (placeholder for WebSocket implementation)
     */
    startPolling(endpoint, interval = 30000) {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(async () => {
            try {
                const data = await this.apiClient.request(endpoint);
                this.notifyListeners(endpoint, data);
            } catch (error) {
                console.warn(`Polling failed for ${endpoint}:`, error);
            }
        }, interval);
    }
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    
    subscribe(endpoint, callback) {
        if (!this.listeners.has(endpoint)) {
            this.listeners.set(endpoint, new Set());
        }
        this.listeners.get(endpoint).add(callback);
    }
    
    unsubscribe(endpoint, callback) {
        if (this.listeners.has(endpoint)) {
            this.listeners.get(endpoint).delete(callback);
        }
    }
    
    notifyListeners(endpoint, data) {
        if (this.listeners.has(endpoint)) {
            this.listeners.get(endpoint).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Listener callback error:', error);
                }
            });
        }
    }
}

// ===== ERROR HANDLING UTILITIES =====
class APIError extends Error {
    constructor(message, status, endpoint) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.endpoint = endpoint;
    }
}

// ===== EXPORT FOR USE IN OTHER MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, RealtimeUpdates, APIError };
}
