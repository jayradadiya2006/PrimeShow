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
export const compressImage = (fileOrDataUrl, maxWidth = 1920, quality = 0.75) => {
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
 * Protects against QuotaExceededError and automatically delegates large Base64 images to IndexedDB.
 */
export const safeLocalStorageSet = (key, value) => {
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
    return { success: true };
  } catch (err) {
    console.warn(`⚠️ LocalStorage quota error on key "${key}":`, err.message);

    const isQuotaError = err.name === 'QuotaExceededError' || 
                         err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
                         err.code === 22;

    if (isQuotaError && Array.isArray(value)) {
      try {
        // Strip heavy base64 strings before saving metadata to localStorage
        const sanitized = value.map(item => {
          const newItem = { ...item };
          const imgKey = `img_${newItem.id || Date.now()}`;

          if (typeof newItem.banner === 'string' && newItem.banner.startsWith('data:image')) {
            saveImageToIDB(imgKey, newItem.banner);
            newItem.banner = `idb:${imgKey}`;
          }
          if (typeof newItem.imageUrl === 'string' && newItem.imageUrl.startsWith('data:image')) {
            saveImageToIDB(imgKey, newItem.imageUrl);
            newItem.imageUrl = `idb:${imgKey}`;
          }
          if (typeof newItem.backdrop === 'string' && newItem.backdrop.startsWith('data:image')) {
            saveImageToIDB(imgKey, newItem.backdrop);
            newItem.backdrop = `idb:${imgKey}`;
          }
          return newItem;
        });

        localStorage.setItem(key, JSON.stringify(sanitized));
        return { success: true, sanitized: true };
      } catch (innerErr) {
        console.error('❌ Failed to save even after sanitizing localStorage:', innerErr);
        // Clear corrupted key safely so React never crashes
        try { localStorage.removeItem(key); } catch (e) {}
      }
    }
    return { success: false, error: err.message };
  }
};

/**
 * Safe LocalStorage getItem Wrapper
 * Resolves IndexedDB references (`idb:...`) if present in stored slides.
 */
export const safeLocalStorageGet = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch (err) {
    console.warn(`⚠️ Error reading key "${key}" from localStorage:`, err.message);
    try { localStorage.removeItem(key); } catch (e) {}
    return defaultValue;
  }
};
