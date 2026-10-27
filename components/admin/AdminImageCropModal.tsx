"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { cropImageToFile } from "@/lib/crop-image";

type CropShape = "rect" | "round";

type AdminImageCropModalProps = {
  file: File | null;
  title: string;
  aspect: number;
  cropShape?: CropShape;
  onClose: () => void;
  onConfirm: (cropped: File) => void | Promise<void>;
};

export function AdminImageCropModal({
  file,
  title,
  aspect,
  cropShape = "rect",
  onClose,
  onConfirm,
}: AdminImageCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  if (!file || !imageUrl) return null;

  async function handleConfirm() {
    if (!croppedAreaPixels || !imageUrl || !file) return;
    setBusy(true);
    setError(null);
    try {
      const cropped = await cropImageToFile(
        imageUrl,
        croppedAreaPixels,
        file.name,
      );
      await onConfirm(cropped);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "برش تصویر ناموفق");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-dialog-title"
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-xl">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 id="crop-dialog-title" className="text-sm font-medium text-cream">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted">
            تصویر را جابه‌جا کنید و با اسلایدر بزرگ‌نمایی کنید.
          </p>
        </div>

        <div className="relative h-72 bg-black sm:h-80">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <label className="flex items-center gap-3 px-4 py-3">
          <span className="shrink-0 text-xs text-muted">بزرگ‌نمایی</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-gold"
          />
        </label>

        {error && (
          <p className="px-4 pb-2 text-xs text-red-300">{error}</p>
        )}

        <div className="flex gap-2 border-t border-white/10 p-4">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-muted transition hover:border-white/25 hover:text-cream disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={busy || !croppedAreaPixels}
            onClick={() => void handleConfirm()}
            className="flex-1 rounded-lg bg-gold px-3 py-2 text-sm font-medium text-ink transition hover:bg-gold/90 disabled:opacity-50"
          >
            {busy ? "در حال پردازش…" : "تأیید و استفاده"}
          </button>
        </div>
      </div>
    </div>
  );
}
