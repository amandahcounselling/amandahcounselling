export function buildCommitMessage(sourceIds: string[]) {
  if (sourceIds.length === 1) {
    const sourceId = sourceIds[0];
    if (sourceId === 'practice') return 'Update practice settings';
    if (sourceId === 'faq') return 'Update FAQ';
    if (sourceId.startsWith('pages.')) {
      const page = sourceId.replace('pages.', '');
      return `Update ${page} page content`;
    }
    if (sourceId.startsWith('content/')) {
      return `Update ${sourceId.split('/').pop()}`;
    }
  }

  return 'Update site content';
}

export function buildImageCommitMessage(path: string) {
  const filename = path.split('/').pop() ?? 'image';
  return `Replace ${filename}`;
}
