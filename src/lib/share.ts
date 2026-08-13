/**
 * Uploads the generated card's data URL to the server's share API.
 * Returns the unique ID of the saved card.
 */
export async function uploadSharedCard(dataUrl: string): Promise<string> {
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: dataUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save card on the server.');
  }

  const result = await response.json();
  return result.id;
}

/**
 * Formats a caption and generates the Twitter/X share intent link.
 */
export function getTwitterShareLink(shareId: string): string {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareId}`;
  const text = `Just built my Goa frame 🌴💻\nReady to build, ship and hack at Hacker House Goa 2026.\n\nGenerate yours here:`;
  const hashtags = 'FrameInGoa';

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
}
