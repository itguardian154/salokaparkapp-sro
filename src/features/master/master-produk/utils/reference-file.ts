import type { ProdukReferenceFile } from "../types/master-produk";

export type ReferenceFileInfo = {
  name: string;
  url?: string;
  mimeType?: string;
};

export const getReferenceFileInfo = (
  referenceFile: ProdukReferenceFile | string | null | undefined,
): ReferenceFileInfo | null => {
  if (!referenceFile) return null;

  if (typeof referenceFile === "string") {
    const name = referenceFile.split(/[\\/]/).pop();
    if (!name) return null;

    const mimeType = name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : name.match(/\.(jpe?g|png|webp)$/i)
        ? `image/${name.split(".").pop()?.toLowerCase() === "jpg" ? "jpeg" : name.split(".").pop()?.toLowerCase()}`
        : undefined;

    return { name, url: referenceFile, mimeType };
  }

  return referenceFile.name
    ? {
        name: referenceFile.name,
        url: referenceFile.url,
        mimeType: referenceFile.mime_type,
      }
    : null;
};
