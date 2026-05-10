import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';

export function safeFormatDistanceToNow(dateString?: string): string {
  if (!dateString) return 'مؤخراً';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'مؤخراً';
    return formatDistanceToNow(d, { addSuffix: true, locale: arSA });
  } catch (error) {
    return 'مؤخراً';
  }
}
