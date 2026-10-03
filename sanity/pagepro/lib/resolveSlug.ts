export default function resolveSlug({
  internal,
  params,
  external,
  type,
  fileLabel,
  fileOriginalFilename,
}: {
  type: "internal" | "external" | "download";
  // internal
  internal?: string;
  params?: string;
  // external
  external?: string;
  // download
  fileLabel?: string;
  fileOriginalFilename?: string;
}) {
  if (type === "external" && external) return external;

  if (type === "internal" && internal) {
    const segment = "/";
    const path = internal === "/" ? null : internal;

    return [segment, path, params].filter(Boolean).join("");
  }

  if (type === "download" && (fileLabel || fileOriginalFilename))
    return fileLabel || fileOriginalFilename;

  return undefined;
}
