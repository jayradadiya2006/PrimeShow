// Utility for Client-Side Canvas Image Compression, IndexedDB Storage, and Safe LocalStorage Fallbacks

const DB_NAME = 'PrimeShowImageDB';
const STORE_NAME = 'hero_images';
const DB_VERSION = 1;

/**
 * Open Native IndexedDB Connection (high-capacity storage)
 */
export const openImageDB = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => resolve(null);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    } catch (err) {
      resolve(null);
    }
  });
};

/**
 * Save an Image Data URL or Blob to IndexedDB by Key
 */
export const saveImageToIDB = async (key, dataUrl) => {
  if (!key || !dataUrl) return false;
  try {
    const db = await openImageDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
};

/**
 * Get an Image Data URL from IndexedDB by Key
 */
export const getImageFromIDB = async (key) => {
  if (!key) return null;
  try {
    const db = await openImageDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

/**
 * Remove an Image from IndexedDB by Key
 */
export const deleteImageFromIDB = async (key) => {
  if (!key) return false;
  try {
    const db = await openImageDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
};

/**
 * Client-Side Image Downscaling & Compression via HTML5 Canvas
 * Downscales images to max width (default 1920px) and compresses to JPEG (quality 0.75)
 * Keeps uploaded file sizes well under 250KB.
 */
export const compressImage = (fileOrDataUrl, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) return resolve('');

    // If it's already a standard URL (http/https/blob/local path), return directly
    if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:image')) {
      return resolve(fileOrDataUrl);
    }

    const processImageSource = (src) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => resolve(src); // Fallback to raw if load fails
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (e) {
          resolve(src);
        }
      };
      img.src = src;
    };

    if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      const reader = new FileReader();
      reader.onerror = () => resolve('');
      reader.onload = (e) => processImageSource(e.target.result);
      reader.readAsDataURL(fileOrDataUrl);
    } else if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image')) {
      processImageSource(fileOrDataUrl);
    } else {
      resolve(String(fileOrDataUrl));
    }
  });
};

/**
 * Safe LocalStorage setItem Wrapper
 * Protects against QuotaExceededError and prevents data loss.
 */
export const safeLocalStorageSet = (key, value) => {
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
    return { success: true };
  } catch (err) {
    console.warn(`⚠️ LocalStorage quota warning on key "${key}":`, err.message);

    const isQuotaError = err.name === 'QuotaExceededError' || 
                         err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
                         err.code === 22;

    if (isQuotaError && Array.isArray(value)) {
      try {
        const sanitized = value.map(item => {
          if (!item || typeof item !== 'object') return item;
          const newItem = { ...item };
          const imgKey = `img_${newItem.id || Date.now()}`;

          ['banner', 'bannerUrl', 'backdrop', 'imageUrl', 'poster', 'posterUrl', 'image'].forEach(prop => {
            if (typeof newItem[prop] === 'string' && newItem[prop].startsWith('data:image') && newItem[prop].length > 150000) {
              saveImageToIDB(`${imgKey}_${prop}`, newItem[prop]);
            }
          });
          return newItem;
        });

        localStorage.setItem(key, JSON.stringify(sanitized));
        return { success: true, sanitized: true };
      } catch (innerErr) {
        console.error('❌ Failed to save after quota error:', innerErr.message);
      }
    }
    return { success: false, error: err.message };
  }
};

/**
 * Safe LocalStorage getItem Wrapper
 * Safely parses and returns stored data without crashing.
 */
export const safeLocalStorageGet = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch (err) {
    console.warn(`⚠️ Error reading key "${key}" from localStorage:`, err.message);
    return defaultValue;
  }
};

export const SAFE_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80';

/**
 * Validates and sanitizes image URLs, preventing Google Maps or invalid share links
 * from being loaded into <img> elements and causing ERR_CONNECTION_TIMED_OUT.
 */
export const getSafeImageUrl = (src, fallback = SAFE_IMAGE_FALLBACK) => {
  if (!src || typeof src !== 'string') return fallback;
  const s = src.trim().toLowerCase();
  if (s.includes('maps.app.goo.gl') || s.includes('google.com/maps') || s.includes('goo.gl/maps')) {
    return fallback;
  }
  if (src.startsWith('idb:')) {
    return fallback;
  }
  return src;
};

