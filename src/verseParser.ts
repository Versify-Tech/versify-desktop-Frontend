// src/verseParser.ts

export interface ParsedScripture {
  book: string;
  chapter: number;
  verse: number;
}

// Convert spoken/written word numbers to digits
const NUMBER_WORDS: Record<string, string> = {
  first: '1',
  '1st': '1',
  second: '2',
  '2nd': '2',
  third: '3',
  '3rd': '3',
  one: '1',
  two: '2',
  three: '3',
};

export function parseBibleReference(input: string): ParsedScripture | null {
  if (!input) return null;

  let clean = input.toLowerCase().trim().replace(/\s+/g, ' ');

  // Replace spoken prefixes like "first samuel" or "1st samuel" -> "1 samuel"
  Object.keys(NUMBER_WORDS).forEach((word) => {
    if (clean.startsWith(word + ' ')) {
      clean = clean.replace(word, NUMBER_WORDS[word]);
    }
  });

  // Regular expression to match:
  // "1 samuel 1 3", "1 samuel 1:3", "john 3 16", "genesis 1:1"
  const regex = /^(\d\s*)?([a-z\s]+?)\s+(\d+)(?:[:\s]+(\d+))?$/i;
  const match = clean.match(regex);

  if (!match) return null;

  const prefixNumber = match[1] ? match[1].trim() : '';
  let rawBook = match[2].trim();
  const chapter = parseInt(match[3], 10);
  const verse = match[4] ? parseInt(match[4], 10) : 1;

  // Title-case the book name (e.g., "samuel" -> "Samuel")
  let bookName = rawBook
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (prefixNumber) {
    bookName = `${prefixNumber} ${bookName}`;
  }

  return {
    book: bookName,
    chapter,
    verse,
  };
}