// Average reading speed for adults is around 200-250 words per minute.
const WORDS_PER_MINUTE = 225;

export const calculateReadingTime = (htmlContent: string): number => {
    // 1. Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 2. Get the text content, which strips all HTML tags
    const text = tempDiv.textContent || tempDiv.innerText || "";

    // 3. Split the text into words by spaces and filter out empty strings
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 4. Calculate the reading time
    const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

    // Return at least 1 minute for very short texts
    return Math.max(1, readingTime);
};
