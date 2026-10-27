import type { CoreSettings, CropperState } from "advanced-cropper";

/** Largest stencil (fixed aspect) that fits inside the image — no 80% inset. */
export function defaultStencilCoverImage(
  state: CropperState,
  _settings: CoreSettings,
  aspectRatio: number,
): { width: number; height: number } {
  const area = state.visibleArea ?? state.imageSize;
  const w = area.width;
  const h = area.height;
  if (w / h > aspectRatio) {
    return { width: h * aspectRatio, height: h };
  }
  return { width: w, height: w / aspectRatio };
}
