
export const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const getStatusColor = (status?: string) => {
  if (!status) return 'secondary';
  const statusLower = status.toLowerCase();
  if (statusLower.includes('open') || statusLower.includes('pending')) return 'destructive';
  if (statusLower.includes('closed') || statusLower.includes('resolved')) return 'default';
  return 'secondary';
};
