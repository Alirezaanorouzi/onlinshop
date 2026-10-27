"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleStencil,
  Cropper,
  type CropperRef,
  RectangleStencil,
} from "react-advanced-cropper";
import { defaultStencilCoverImage } from "@/lib/crop-default-size";
import { canvasToJpegFile } from "@/lib/crop-image";

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
  const cropperRef = useRef<CropperRef>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      setReady(false);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setReady(false);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file || !imageUrl) return null;

  async function handleConfirm() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = cropperRef.current?.getCanvas();
      if (!canvas) throw new Error("برش تصویر ممکن نبود.");
      const cropped = await canvasToJpegFile(canvas, file.name);
      await onConfirm(cropped);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "برش تصویر ناموفق");
    } finally {
      setBusy(false);
    }
  }

  const Stencil = cropShape === "round" ? CircleStencil : RectangleStencil;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-dialog-title"
    >
      <div className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-ink shadow-xl sm:max-h-[92dvh] sm:rounded-2xl">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 id="crop-dialog-title" className="text-sm font-medium text-cream">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-6 text-muted">
            با دو انگشت روی تصویر بزرگ‌نمایی کنید. گوشه‌های کادر را بکشید تا
            کوچک یا بزرگ شود؛ وسط کادر را برای جابه‌جایی بکشید.
          </p>
        </div>

        <div className="admin-cropper relative min-h-[min(58dvh,22rem)] flex-1 bg-black sm:min-h-[20rem]">
          <Cropper
            ref={cropperRef}
            src={imageUrl}
            className="admin-cropper__instance h-full"
            stencilComponent={Stencil}
            stencilProps={{
              aspectRatio: aspect,
              grid: cropShape === "rect",
            }}
            defaultSize={(state, settings) =>
              defaultStencilCoverImage(state, settings, aspect)
            }
            onReady={() => setReady(true)}
          />
        </div>

        {error && (
          <p className="px-4 pb-2 text-xs text-red-300">{error}</p>
        )}

        <div className="flex gap-2 border-t border-white/10 p-4">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/15 px-3 py-2.5 text-sm text-muted transition hover:border-white/25 hover:text-cream disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={busy || !ready}
            onClick={() => void handleConfirm()}
            className="flex-1 rounded-lg bg-gold px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-gold/90 disabled:opacity-50"
          >
            {busy ? "در حال پردازش…" : "تأیید و استفاده"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .admin-cropper__instance {
          height: 100%;
          min-height: min(58dvh, 22rem);
        }
        .admin-cropper .advanced-cropper-line,
        .admin-cropper .advanced-cropper-handler {
          border-color: rgba(212, 175, 106, 0.95);
          background: rgba(212, 175, 106, 0.35);
        }
        .admin-cropper .advanced-cropper-handler {
          width: 14px;
          height: 14px;
        }
        .admin-cropper .advanced-cropper-stencil-grid {
          color: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </div>
  );
}
