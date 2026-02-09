export const resolveReturnPath = (rawPath: string | null): string | null => {
  if (!rawPath) {
    return null;
  }

  const candidate = rawPath.trim();
  if (!candidate.startsWith('/app')) {
    return null;
  }

  return candidate;
};

export const currentPathWithQuery = (pathname: string, search: string, hash: string): string =>
  `${pathname}${search}${hash}`;
