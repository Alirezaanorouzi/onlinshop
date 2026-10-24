/** Normalize phone camera picks (e.g. HEIC) to JPEG for upload and browser preview. */
export async function prepareImageForUpload(file: File): Promise<File> {
  const type = file.type.toLowerCase();
  if (
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/webp" ||
    type === "image/gif"
  ) {
    return file;
  }

  if (!type.startsWith("image/")) {
    throw new Error("فقط فایل تصویری مجاز است.");
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 2000;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("تبدیل تصویر ممکن نبود.");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("تبدیل تصویر ممکن نبود."))),
        "image/jpeg",
        0.9,
      );
    });

    const base = file.name.replace(/\.[^.]+$/, "") || "product";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    throw new Error(
      "این فرمت تصویر در مرورگر پشتیبانی نمی‌شود. از گالری یک عکس JPG یا PNG انتخاب کنید.",
    );
  }
}
