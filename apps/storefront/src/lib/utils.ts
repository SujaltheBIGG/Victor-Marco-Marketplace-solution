import { ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Custom font sizes from tailwind.config would otherwise be read as text colors
// and dropped when merged with a color class.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display-2xl', 'display-xl', 'h1', 'h2', 'h3', 'body', 'small', 'ui', 'eyebrow', 'md'] }
      ]
    }
  }
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
