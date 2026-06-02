export const getMediaExtension = (src?: string, fileName?: string) => {
  const candidate = fileName || src;
  if (!candidate) return '';

  const withoutQuery = candidate.split(/[?#]/)[0] || '';
  const extension = withoutQuery.split('.').pop();

  if (!extension || extension === withoutQuery) return '';

  return extension.toLowerCase();
};

export const isSupportedMediaSource = ({
  src,
  fileName,
  mimeType,
  supportedExtensions,
  supportedMimeTypes,
}: {
  src?: string;
  fileName?: string;
  mimeType?: string;
  supportedExtensions: readonly string[];
  supportedMimeTypes: readonly string[];
}) => {
  const normalizedMimeType = mimeType?.toLowerCase();

  if (
    normalizedMimeType &&
    supportedMimeTypes.some((type) => normalizedMimeType === type)
  ) {
    return true;
  }

  const extension = getMediaExtension(src, fileName);

  return extension
    ? supportedExtensions.some((supported) => supported === extension)
    : !mimeType;
};
