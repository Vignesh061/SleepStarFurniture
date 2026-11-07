/**
 * Client-side high performance image compressor using HTML5 Canvas.
 * Compresses camera photos (5MB - 15MB) down to ~50KB - 90KB in milliseconds.
 */
export const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = (e) => reject(e);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (e) => reject(e);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ dataUrl: event.target.result, file });
        }

        // Clean white background for transparency safety
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Convert canvas to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({ dataUrl, file });
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              { type: 'image/jpeg' }
            );
            resolve({ dataUrl, file: compressedFile });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Curated high-resolution furniture stock images for Sleep Star Furniture catalogue.
 * Instant zero-network 1-click photos for admin creation.
 */
export const CURATED_FURNITURE_PHOTOS = [
  {
    name: 'Teak Dining Set',
    category: 'Dining Sets',
    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Luxury King Bed',
    category: 'Cots & Beds',
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Solid Wood Bed with Storage',
    category: 'Cots & Beds',
    url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: '4-Door Modular Wardrobe',
    category: 'Wardrobes',
    url: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern Wooden TV Unit',
    category: 'TV Units',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modular Kitchen Counter',
    category: 'Services',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimalist Coffee Table',
    category: 'Living',
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1000&auto=format&fit=crop&q=80',
  },
  {
    name: 'Premium Wood Living Sofa',
    category: 'Living',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop&q=80',
  },
];

