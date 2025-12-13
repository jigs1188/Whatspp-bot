const PERSONAL_KEYWORDS = [
  "bro",
  "sis",
  "miss you",
  "❤️",
  "love",
  "where are you",
  "call me",
  "dinner",
  "party",
  "movie"
];

export function isPersonalMessage(text = "") {
  const normalized = text.toLowerCase();
  return PERSONAL_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
