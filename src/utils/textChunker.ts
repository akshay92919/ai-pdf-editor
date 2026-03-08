import { v4 as uuidv4 } from 'uuid';

export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  text: string;
}

export class TextChunker {
  /**
   * Splits a large body of text into overlapping chunks of roughly minLength to maxLength characters.
   * Prioritizes splitting on double newlines (paragraphs), then single newlines, then periods, then spaces.
   */
  static chunkText(text: string, documentId: string, minLength = 1000, maxLength = 1500): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let remainingText = text.trim();

    while (remainingText.length > 0) {
      if (remainingText.length <= maxLength) {
        chunks.push({
          chunkId: uuidv4(),
          documentId,
          text: remainingText,
        });
        break;
      }

      // Find the best split point between minLength and maxLength
      let splitIndex = this.findSplitPoint(remainingText, minLength, maxLength);
      
      // Fallback if no clean split is found
      if (splitIndex === -1) {
        splitIndex = maxLength;
      }

      chunks.push({
        chunkId: uuidv4(),
        documentId,
        text: remainingText.substring(0, splitIndex).trim(),
      });

      // Advance textbook, allowing a small overlap of 50 chars natively if we split on a period/space
      // but let's keep it simple and just slice
      remainingText = remainingText.substring(splitIndex).trim();
    }

    return chunks;
  }

  private static findSplitPoint(text: string, minLength: number, maxLength: number): number {
    const searchArea = text.substring(minLength, maxLength);
    
    // Try to split on paragraph breaks first
    const doubleNewline = searchArea.lastIndexOf('\n\n');
    if (doubleNewline !== -1) return minLength + doubleNewline + 2;

    // Then single newlines
    const singleNewline = searchArea.lastIndexOf('\n');
    if (singleNewline !== -1) return minLength + singleNewline + 1;

    // Then sentence endings
    const sentenceEnd = Math.max(
      searchArea.lastIndexOf('. '),
      searchArea.lastIndexOf('? '),
      searchArea.lastIndexOf('! ')
    );
    if (sentenceEnd !== -1) return minLength + sentenceEnd + 2;

    // Finally, fall back to the last space to avoid cutting words
    const lastSpace = searchArea.lastIndexOf(' ');
    if (lastSpace !== -1) return minLength + lastSpace + 1;

    // No ideal split point found
    return -1;
  }
}
