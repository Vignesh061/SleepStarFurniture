import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase/config';

// Allowed MIME types and max size
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_ENQUIRY_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const storageService = {
  /**
   * Upload single file to Firebase Storage
   * @param {File} file - Browser File object
   * @param {string} path - Target path e.g. 'products/item1/photo.jpg'
   * @param {function} onProgress - Optional callback for upload % (0-100)
   * @returns {Promise<string>} Download URL
   */
  async uploadFile(file, path, onProgress) {
    if (!storage) throw new Error('Firebase Storage is not initialized.');

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error(`Unsupported file type (${file.type}). Allowed: JPG, PNG, WebP or MP4/WebM video.`);
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 10MB.`);
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 50MB.`);
    }

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Storage upload error:', error);
          let userMessage = error.message;
          if (error.code === 'storage/unauthorized') {
            userMessage = 'Upload failed: Permission denied by Firebase Storage Rules. Please publish rules in Firebase Console > Storage > Rules.';
          } else if (error.code === 'storage/bucket-not-found') {
            userMessage = 'Upload failed: Storage bucket not found. Please ensure Firebase Storage is enabled in Firebase Console.';
          } else if (error.code === 'storage/unknown') {
            userMessage = 'Upload failed: Firebase Storage connection error or CORS block. Ensure Storage is initialized in Firebase Console.';
          } else if (error.code === 'storage/quota-exceeded') {
            userMessage = 'Upload failed: Firebase Storage quota exceeded.';
          }
          reject(new Error(userMessage));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },

  /**
   * Upload a product image to 'products/{productId}/...'
   */
  async uploadProductImage(file, productId = 'temp', onProgress) {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `products/${productId}/${Date.now()}_${cleanFileName}`;
    return await this.uploadFile(file, path, onProgress);
  },

  /**
   * Upload a category image to 'categories/{slug}/...'
   */
  async uploadCategoryImage(file, categorySlug = 'general', onProgress) {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `categories/${categorySlug}/${Date.now()}_${cleanFileName}`;
    return await this.uploadFile(file, path, onProgress);
  },

  /**
   * Upload a service image to 'services/{serviceId}/...'
   */
  async uploadServiceImage(file, serviceId = 'general', onProgress) {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `services/${serviceId}/${Date.now()}_${cleanFileName}`;
    return await this.uploadFile(file, path, onProgress);
  },

  /**
   * Upload a completed project photo to 'projects/{projectId}/...'
   */
  async uploadProjectImage(file, projectId = 'general', onProgress) {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `projects/${projectId}/${Date.now()}_${cleanFileName}`;
    return await this.uploadFile(file, path, onProgress);
  },

  /**
   * Upload a project video walkthrough to 'projects/{projectId}/video_...'
   */
  async uploadProjectVideo(file, projectId = 'general', onProgress) {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `projects/${projectId}/${Date.now()}_video_${cleanFileName}`;
    return await this.uploadFile(file, path, onProgress);
  },

  /**
   * Upload a customer enquiry reference image to 'enquiries/{fileName}'
   */
  async uploadEnquiryReferenceImage(file, onProgress) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Please select a valid image file (JPG, PNG, WebP).');
    }
    if (file.size > MAX_ENQUIRY_IMAGE_SIZE) {
      throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 5MB.`);
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `enquiries/${Date.now()}_${cleanFileName}`;
    return await this.uploadFile(file, path, onProgress);
  },

  /**
   * Delete a file from Firebase Storage by path or URL
   */
  async deleteFile(filePathOrUrl) {
    if (!storage || !filePathOrUrl) return;

    try {
      let storageRef;
      if (filePathOrUrl.startsWith('http')) {
        storageRef = ref(storage, filePathOrUrl);
      } else {
        storageRef = ref(storage, filePathOrUrl);
      }
      await deleteObject(storageRef);
    } catch (err) {
      if (err.code !== 'storage/object-not-found') {
        console.warn('Storage delete warning:', err);
      }
    }
  },
};
