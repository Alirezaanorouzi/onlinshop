import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("بارگذاری تصویر ناموفق")));
    image.src = src;
  });
}

/** Render cropped region to a JPEG `File` (max edge `maxOutputSize`). */
export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: Area,
  originalName: string,
  maxOutputSize = 1200,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const scale = Math.min(
    1,
    maxOutputSize / Math.max(pixelCrop.width, pixelCrop.height),
  );
  const width = Math.max(1, Math.round(pixelCrop.width * scale));
  const height = Math.max(1, Math.round(pixelCrop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("برش تصویر ممکن نبود.");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("برش تصویر ممکن نبود."))),
      "image/jpeg",
      0.92,
    );
  });

  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}-cropped.jpg`, { type: "image/jpeg" });
}
