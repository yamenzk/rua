// Fallback regex pattern (as a string for new RegExp, so backslashes are escaped)
const FALLBACK_EMOJI_REGEX_STRING =
	"(?:[\\u2700-\\u27bf]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\u0023-\\u0039]\\ufe0f?\\u20e3|\\u3299|\\u3297|\\u303d|\\u3030|\\u24c2|\\ud83c[\\udd70-\\udd71]|\\ud83c[\\udd7e-\\udd7f]|\\ud83c\\udd8e|\\ud83c[\\udd91-\\udd9a]|\\ud83c[\\udc04-\\udcf9]|\\ud83c[\\udde6-\\uddff]|[\\ud83c\\ude01\\ude02\\ude1a\\ude2f\\ude32-\\ude3a\\ude50\\ude51]|\\ud83e[\\udd10-\\udd1e\\udd20-\\udd27\\udd30\\udd33-\\udd3a\\udd3c-\\udd3e\\udd40-\\udd45\\udd47-\\udd4b\\udd50-\\udd5e\\udd80-\\udd91\\udda0-\\udda2\\udda5-\\udda7\\uddc0\\uddc2\\uddd0-\\uddd6\\udde0-\\udde6]|[\\u200d\\u20e3\\ufe0f])(?:[\\u0300-\\u036f\\ufe00-\\ufe0f\\u20d0-\\u20ff\\ud83c[\\udffb-\\udfff]]|[\\u0300-\\u036f\\ufe00-\\ufe0f\\u20d0-\\u20ff]|(?:\\ud83c[\\udffb-\\udfff])(?:[\\u0300-\\u036f\\ufe00-\\ufe0f\\u20d0-\\u20ff])?)*";
const FALLBACK_EMOJI_REGEX_FLAGS = "g"; 

let selectedEmojiRegex;

try {
	selectedEmojiRegex = new RegExp("\\p{Emoji}", "gu");
} catch (e) {
	console.warn(
		"Browser does not support \\p{Emoji} regex. Falling back to a comprehensive but less modern regex."
	);
	selectedEmojiRegex = new RegExp(FALLBACK_EMOJI_REGEX_STRING, FALLBACK_EMOJI_REGEX_FLAGS);
}

export const COMPREHENSIVE_EMOJI_REGEX = selectedEmojiRegex;

export const startsWithEmoji = (text) => {
	if (!text) return null;
	COMPREHENSIVE_EMOJI_REGEX.lastIndex = 0;
	const match = COMPREHENSIVE_EMOJI_REGEX.exec(text);
	if (match && match.index === 0) {
		return match[0]; 
	}
	return null;
};

export const parseEmojiFromText = (text) => {
	if (!text) return { emoji: null, remainingText: text };

	const emoji = startsWithEmoji(text); 
	if (emoji) {
		const remainingText = text.substring(emoji.length).trimStart();
		return { emoji, remainingText };
	}

	return { emoji: null, remainingText: text };
};