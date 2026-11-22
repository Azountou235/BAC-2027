import { supabase, isSupabaseConfigured } from './supabase/client';

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration?: number;
}

export const compressImage = async (
  file: File,
  quality: 'standard' | 'hd' | 'original'
): Promise<File> => {
  if (quality === 'original' || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // In Low bandwidth / standard: max 1280px, quality 0.7
        // In HD: max 2560px, quality 0.9
        const maxDimension = quality === 'standard' ? 1280 : 2560;
        const compressionQuality = quality === 'standard' ? 0.72 : 0.92;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          compressionQuality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export const uploadMediaFile = async (
  file: File,
  bucket: 'avatars' | 'chat-media' | 'chat-documents' | 'chat-audio',
  userId: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> => {
  const fileExt = file.name.split('.').pop() || 'bin';
  const cleanFileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${cleanFileName}`;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw new Error(`Erreur lors du téléversement: ${error.message}`);
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return {
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  } else {
    // Local / Offline fallback using Object URL or Base64 for instant testing
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      };
      reader.readAsDataURL(file);
    });
  }
};
