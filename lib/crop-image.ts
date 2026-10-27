/** Render canvas to a JPEG `File` (max edge `maxOutputSize`). */
export async function canvasToJpegFile(
  source: HTMLCanvasElement,
  originalName: string,
  maxOutputSize = 1200,
): Promise<File> {
  const scale = Math.min(
    1,
    maxOutputSize / Math.max(source.width, source.height),
  );
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  let canvas = source;
  if (scale < 1) {
    const resized = document.createElement("canvas");
    resized.width = width;
    resized.height = height;
    const ctx = resized.getContext("2d");
    if (!ctx) throw new Error("برش تصویر ممکن نبود.");
    ctx.drawImage(source, 0, 0, width, height);
    canvas = resized;
  }

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
