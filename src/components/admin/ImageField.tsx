import { useRef, useState } from 'react';
import { useOptionalAdmin } from '../../lib/admin/admin-context';
import { withBase } from '../../lib/paths';

type ImageFieldProps = {
  sourceId?: string;
  path: string;
  fallback: string;
  alt?: string;
  className?: string;
  fieldKey: string;
};

export default function ImageField({
  sourceId = 'practice',
  path,
  fallback,
  alt = '',
  className,
  fieldKey,
}: ImageFieldProps) {
  const admin = useOptionalAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const src = String(admin?.getFieldValue(sourceId, path) ?? fallback);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !admin) return;

    setUploading(true);
    setError('');
    try {
      await admin.uploadImage(file, fieldKey, { sourceId, fieldPath: path });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="relative">
      <img src={withBase(src)} alt={alt} className={className} />
      {admin?.isEditMode && (
        <div className="absolute inset-x-4 bottom-4 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="bg-background/95 text-foreground rounded-full px-4 py-2 text-sm font-bold shadow"
          >
            {uploading ? 'Uploading…' : 'Replace image'}
          </button>
          {error && <p className="bg-background/95 rounded-lg px-3 py-2 text-sm text-red-700">{error}</p>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      )}
    </div>
  );
}
