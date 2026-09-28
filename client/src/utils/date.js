/**
 * Formats a date into dynamic relative time based on the exact specified rules:
 * - < 1 minute → "Just now"
 * - < 60 minutes → "X minutes ago"
 * - < 24 hours → "X hours ago"
 * - < 7 days → "X days ago"
 * - < 30 days → "X weeks ago"
 * - < 12 months → "X months ago"
 * - otherwise → "X years ago"
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Future or less than 1 minute (60 seconds)
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // < 60 minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  }

  // < 24 hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }

  // < 7 days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }

  // < 30 days → "X weeks ago"
  if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    const weeks = Math.max(1, diffInWeeks);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  // < 12 months → "X months ago"
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    const months = Math.max(1, diffInMonths);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  // otherwise → "X years ago"
  const diffInYears = Math.floor(diffInDays / 365);
  const years = Math.max(1, diffInYears);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

/**
 * Calculates estimated read time from content length
 */
export const getReadingTime = (content) => {
  if (!content) return '1 min read';
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
};
