import { FaFilePdf } from "react-icons/fa6";
import { getReferenceFileInfo } from "../utils/reference-file";
import type { ProdukReferenceFile } from "../types/master-produk";

type ReferenceFilePreviewProps = {
  referenceFile: ProdukReferenceFile | string | null | undefined;
  size?: "small" | "medium";
};

const sizeClasses = {
  small: "size-10",
  medium: "size-12",
};

const ReferenceFilePreview = ({
  referenceFile,
  size = "small",
}: ReferenceFilePreviewProps) => {
  const file = getReferenceFileInfo(referenceFile);
  if (!file) return <span>-</span>;

  const thumbnail = file.mimeType?.startsWith("image/") && file.url ? (
    <img
      src={file.url}
      alt=""
      className={`${sizeClasses[size]} rounded-md border border-slate-200 object-cover dark:border-slate-700`}
      loading="lazy"
    />
  ) : file.mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? (
    <span
      aria-hidden="true"
      className={`${sizeClasses[size]} flex flex-col items-center justify-center rounded-md border border-slate-200 bg-red-50 text-red-600 dark:border-slate-700 dark:bg-red-950/30`}
    >
      <FaFilePdf className="text-lg" />
      <span className="text-[8px] font-bold leading-none">PDF</span>
    </span>
  ) : (
    <span
      aria-hidden="true"
      className={`${sizeClasses[size]} flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800`}
    >
      <FaFilePdf className="text-lg" />
    </span>
  );

  if (!file.url) return thumbnail;

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noreferrer"
      title={file.name}
      aria-label={`Buka referensi ${file.name}`}
      className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {thumbnail}
    </a>
  );
};

export default ReferenceFilePreview;
