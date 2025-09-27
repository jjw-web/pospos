import { MenuItem } from '../../types';

// The result of parsing a single line of the order text
export interface ParsedLine {
  originalLine: string;
  matchedItem: MenuItem | null;
  quantity: number;
  note: string;
  error?: 'NO_MATCH';
}

/**
 * Normalizes a string by converting to lowercase, removing accents, and extra spaces.
 */
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͤ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * A simple string similarity function based on word overlap.
 */
const getSimilarity = (a: string, b: string): number => {
  const normA = normalizeString(a);
  const normB = normalizeString(b);
  const wordsA = new Set(normA.split(' '));
  const wordsB = new Set(normB.split(' '));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
};


/**
 * Parses a raw text block of an order into structured line items.
 * @param rawText The raw order text, with each item on a new line.
 * @param menuItems The list of all available menu items to match against.
 * @returns An array of ParsedLine objects.
 */
export const parseOrderText = (rawText: string, menuItems: MenuItem[]): ParsedLine[] => {
  const lines = rawText.split('\n').filter(line => line.trim() !== '');
  const allItems = menuItems.map(item => ({ ...item, normalizedName: normalizeString(item.name) }));

  const parsedLines: ParsedLine[] = lines.map(line => {
    let processedLine = line.trim();
    let quantity = 1;

    // 1. Extract quantity (e.g., "2 bơ dầm", "bơ dầm x2", "sl:2 bơ dầm")
    const quantityMatch = processedLine.match(/^(?:sl:?|x)?\s*(\d+)\s*(.*)|(.*)\s*(?:x|sl:?)\s*(\d+)$/i);
    let nameAndNote = processedLine;

    if (quantityMatch) {
        if (quantityMatch[1]) { // qty at start
            quantity = parseInt(quantityMatch[1], 10);
            nameAndNote = quantityMatch[2] || '';
        } else if (quantityMatch[4]) { // qty at end
            quantity = parseInt(quantityMatch[4], 10);
            nameAndNote = quantityMatch[3] || '';
        }
    }

    // 2. Find the best matching menu item
    let bestMatch: MenuItem | null = null;
    let bestScore = 0.4; // Minimum confidence threshold

    const normalizedNameAndNote = normalizeString(nameAndNote);

    for (const item of allItems) {
        // Prioritize exact match or starts-with match
        if (normalizedNameAndNote.startsWith(item.normalizedName)) {
            const score = item.normalizedName.length / normalizedNameAndNote.length; // Simple score
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }
    }

    // 3. Extract note
    let note = '';
    if (bestMatch) {
        const matchedName = bestMatch.name;
        // Find the part of the original string that is not the matched name
        const noteRegex = new RegExp(matchedName.replace(/[.*+?^${}()|[\\]/g, '\\$&'), 'i');
        note = nameAndNote.replace(noteRegex, '').trim();
    }

    return {
      originalLine: line,
      matchedItem: bestMatch,
      quantity,
      note,
      error: bestMatch ? undefined : 'NO_MATCH',
    };
  });

  return parsedLines;
};
