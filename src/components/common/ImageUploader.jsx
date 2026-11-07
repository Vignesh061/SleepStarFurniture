import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Star,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { compressImage, CURATED_FURNITURE_PHOTOS } from '../../utils/imageCompressor';

export const ImageUploader = ({
  images = [],
  coverImage = '',
  onChangeImages,
  onChangeCoverImage,
  uploadFolder = 'products',
  maxImages = 12,
  allowMultiple = true,
  label = 'Product Images',
  helperText = 'Upload high quality photos (JPEG, PNG, WebP). Images are automatically compressed for fast loading.',
}) => {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' }); // type: 'error' | 'info' | 'success'
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url' | 'stock'
  const fileInputRef = useRef(null);

  const setStatus = (text, type = 'info') => {
    setStatusMessage({ text, type });
    if (type === 'success') {
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
    }
  };

  const handleFilesSelected = async (selectedFiles) => {
    setStatusMessage({ text: '', type: '' });
    const filesArray = Array.from(selectedFiles);

    if (images.length + filesArray.length > maxImages) {
      setStatus(`You can upload a maximum of ${maxImages} images.`, 'error');
      return;
    }

    const newUploading = filesArray.map((file, idx) => ({
      id: `${Date.now()}_${idx}`,
      file,
      name: file.name,
      progress: 0,
      error: null,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploading]);

    const newUrls = [];
    let hadFallback = false;

    for (const item of newUploading) {
      try {
        // Step 1: Compress image on client in milliseconds
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: 30 } : f))
        );

        let compressed;
        try {
          compressed = await compressImage(item.file);
        } catch (compErr) {
          console.warn('Compression fallback to raw file:', compErr);
          compressed = { file: item.file, dataUrl: '' };
        }

        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: 60 } : f))
        );

        // Step 2: Try uploading compressed file to Firebase Storage with a 3.5s timeout
        let downloadUrl = '';
        try {
          const uploadPromise = storageService.uploadFile(
            compressed.file,
            `${uploadFolder}/${Date.now()}_${compressed.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          );

          // 3.5s timeout: if Storage rules or CORS hang, don't freeze the user
          downloadUrl = await Promise.race([
            uploadPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Storage timeout')), 3500)
            ),
          ]);
        } catch (storageErr) {
          console.warn('Storage upload error, using instant optimized image:', storageErr.message);
          // Step 3: BULLETPROOF FALLBACK
          // Use the high-resolution compressed dataUrl directly!
          if (compressed.dataUrl) {
            downloadUrl = compressed.dataUrl;
            hadFallback = true;
          } else {
            throw storageErr;
          }
        }

        if (downloadUrl) {
          newUrls.push(downloadUrl);
        }

        // Remove from progress queue
        setUploadingFiles((prev) => prev.filter((f) => f.id !== item.id));
      } catch (err) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, error: err.message || 'Upload failed' } : f
          )
        );
      }
    }

    if (newUrls.length > 0) {
      const updatedImages = [...images, ...newUrls];
      onChangeImages(updatedImages);

      if (!coverImage && updatedImages.length > 0 && onChangeCoverImage) {
        onChangeCoverImage(updatedImages[0]);
      }

      if (hadFallback) {
        setStatus(
          'Photo attached successfully using optimized local web storage! (To store files in Firebase Storage cloud bucket, publish rules in Firebase Console).',
          'info'
        );
      } else {
        setStatus('Images uploaded to Firebase Storage successfully!', 'success');
      }
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    setStatusMessage({ text: '', type: '' });
    const trimmed = urlInput.trim();

    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setStatus('Please provide a valid web image URL starting with http:// or https://', 'error');
      return;
    }

    if (images.length >= maxImages) {
      setStatus(`Maximum limit of ${maxImages} images reached.`, 'error');
      return;
    }

    const updatedImages = [...images, trimmed];
    onChangeImages(updatedImages);

    if (!coverImage && onChangeCoverImage) {
      onChangeCoverImage(trimmed);
    }

    setUrlInput('');
    setStatus('Image URL attached successfully.', 'success');
  };

  const handleAddStockPhoto = (stockPhotoUrl) => {
    if (images.length >= maxImages) {
      setStatus(`Maximum limit of ${maxImages} images reached.`, 'error');
      return;
    }

    const updatedImages = [...images, stockPhotoUrl];
    onChangeImages(updatedImages);

    if (!coverImage && onChangeCoverImage) {
      onChangeCoverImage(stockPhotoUrl);
    }

    setStatus('Showroom stock photo added.', 'success');
  };

  const handleRemoveImage = async (urlToRemove) => {
    const updatedImages = images.filter((url) => url !== urlToRemove);
    onChangeImages(updatedImages);

    if (coverImage === urlToRemove && onChangeCoverImage) {
      onChangeCoverImage(updatedImages[0] || '');
    }

    if (urlToRemove.includes('firebasestorage.googleapis.com')) {
      try {
        await storageService.deleteFile(urlToRemove);
      } catch (err) {
        console.warn('Could not delete storage file:', err);
      }
    }
  };

  const handleSetCover = (url) => {
    if (onChangeCoverImage) {
      onChangeCoverImage(url);
    }
  };

  return (
    <div className="space-y-3">
      {/* Label and Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          {label}
        </label>

        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-xl bg-neutral-100 p-0.5 text-xs font-medium border border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Upload Device Photos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                activeTab === 'stock'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Showroom Stock</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Paste URL
            </button>
          </div>

          <span className="text-[11px] text-neutral-500 pl-1">
            {images.length}/{maxImages}
          </span>
        </div>
      </div>

      {/* Notifications / Diagnostic Info */}
      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-2xl flex items-start space-x-2 text-xs animate-fadeIn ${
            statusMessage.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-neutral-100 border border-neutral-300 text-neutral-800'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          ) : statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Mode 1: Upload Files Dropzone */}
      {activeTab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFilesSelected(e.dataTransfer.files);
            }
          }}
          className="border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-2xl p-6 text-center cursor-pointer bg-neutral-50 hover:bg-neutral-100/70 transition-all flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform shadow-2xs">
            <UploadCloud className="w-6 h-6 text-neutral-800" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-neutral-900">
              Click to select photos from your device, or drag & drop
            </p>
            <p className="text-xs text-neutral-500">{helperText}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple={allowMultiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFilesSelected(e.target.files);
              }
            }}
          />
        </div>
      )}

      {/* Mode 2: Curated Showroom Stock Photos */}
      {activeTab === 'stock' && (
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-neutral-800">
              Select Curated Sleep Star High-Resolution Photo (1-Click Add):
            </span>
            <span className="text-[11px] text-neutral-500">Instant HD quality</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CURATED_FURNITURE_PHOTOS.map((stock, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAddStockPhoto(stock.url)}
                className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-white text-left p-1.5 hover:border-neutral-400 transition-all cursor-pointer shadow-2xs"
              >
                <div className="aspect-4/3 rounded-lg overflow-hidden bg-neutral-100 mb-1.5">
                  <img
                    src={stock.url}
                    alt={stock.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-[11px] font-bold text-neutral-900 truncate">
                  {stock.name}
                </div>
                <div className="text-[10px] text-neutral-500 truncate">
                  {stock.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Paste Image URL */}
      {activeTab === 'url' && (
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Paste Web Image URL (HTTPS)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl(e);
                  }
                }}
                placeholder="https://images.unsplash.com/... or any hosted image link"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-500">
            Directly attach any product photo hosted online.
          </p>
        </div>
      )}

      {/* Uploading In-Progress Queue */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white border border-neutral-200 rounded-xl text-xs space-y-1.5 shadow-2xs"
            >
              <div className="flex justify-between items-center text-neutral-700">
                <span className="font-medium truncate max-w-[220px]">
                  {item.name}
                </span>
                {item.error ? (
                  <span className="text-red-600 font-semibold text-[11px]">
                    {item.error}
                  </span>
                ) : (
                  <span className="text-neutral-600 font-semibold flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin text-neutral-800" />
                    <span>Processing {item.progress}%</span>
                  </span>
                )}
              </div>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-neutral-900 h-full transition-all duration-200"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] uppercase font-semibold text-neutral-500 block">
              Attached Photos ({images.length}) - Star denotes Primary Cover:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((url, idx) => {
              const isCover = coverImage === url || (!coverImage && idx === 0);

              return (
                <div
                  key={url}
                  className={`relative group rounded-2xl overflow-hidden border aspect-square bg-neutral-100 shadow-2xs ${
                    isCover
                      ? 'ring-2 ring-neutral-900 border-neutral-900'
                      : 'border-neutral-200'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Cover Badge */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-neutral-900/90 text-white text-[10px] font-semibold flex items-center space-x-1 backdrop-blur-xs">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>Cover</span>
                    </div>
                  )}

                  {/* Overlay actions on hover */}
                  <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {!isCover && onChangeCoverImage && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(url)}
                        className="p-1.5 rounded-full bg-white text-neutral-800 hover:bg-neutral-100 transition-transform hover:scale-110 shadow-sm cursor-pointer"
                        title="Set as cover image"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-transform hover:scale-110 shadow-sm cursor-pointer"
                      title="Delete image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
