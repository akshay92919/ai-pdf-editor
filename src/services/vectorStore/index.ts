/**
 * Vector Store using local TF-IDF similarity.
 * Replaces OpenAI embeddings with a simple but effective keyword-based approach.
 * No external API calls needed.
 */

export interface VectorChunk {
  documentId: string;
  chunkId: string;
  text: string;
  termFrequencies: Map<string, number>;
}

// In-memory global store to hold document chunks and their term frequencies
const globalVectorStore: Map<string, VectorChunk[]> = new Map();

// Stopwords to filter out common words
const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'because', 'but', 'and', 'or', 'if', 'while', 'which', 'that', 'this',
  'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him',
  'his', 'she', 'her', 'they', 'them', 'their', 'what', 'about',
]);

/**
 * Tokenize text into normalized terms, filtering stopwords.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Calculate term frequencies for a chunk of text.
 */
function computeTermFrequencies(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freqs = new Map<string, number>();
  for (const token of tokens) {
    freqs.set(token, (freqs.get(token) || 0) + 1);
  }
  // Normalize by total tokens
  const total = tokens.length || 1;
  for (const [key, val] of freqs) {
    freqs.set(key, val / total);
  }
  return freqs;
}

/**
 * Calculate similarity between two term frequency maps using cosine-like scoring.
 */
function tfSimilarity(queryTF: Map<string, number>, chunkTF: Map<string, number>): number {
  let dotProduct = 0;
  let queryNorm = 0;
  let chunkNorm = 0;

  for (const [term, qFreq] of queryTF) {
    queryNorm += qFreq * qFreq;
    const cFreq = chunkTF.get(term) || 0;
    dotProduct += qFreq * cFreq;
  }

  for (const [, cFreq] of chunkTF) {
    chunkNorm += cFreq * cFreq;
  }

  if (queryNorm === 0 || chunkNorm === 0) return 0;
  return dotProduct / (Math.sqrt(queryNorm) * Math.sqrt(chunkNorm));
}

export class VectorStore {

  /**
   * Index document chunks — compute term frequencies locally (no API calls).
   */
  static async indexDocumentChunks(documentId: string, chunks: { chunkId: string; text: string }[]): Promise<void> {
    if (chunks.length === 0) return;

    console.log(`[VectorStore] Indexing ${chunks.length} chunks for document ${documentId} (local TF-IDF)`);

    const vectorChunks: VectorChunk[] = chunks.map(chunk => ({
      documentId,
      chunkId: chunk.chunkId,
      text: chunk.text,
      termFrequencies: computeTermFrequencies(chunk.text),
    }));

    globalVectorStore.set(documentId, vectorChunks);
  }

  /**
   * Search for the most similar chunks using local TF-IDF similarity.
   * No external API calls needed.
   */
  static async searchSimilarChunks(documentId: string, query: string, topK: number = 4): Promise<VectorChunk[]> {
    const documentChunks = globalVectorStore.get(documentId);

    if (!documentChunks || documentChunks.length === 0) return [];

    const queryTF = computeTermFrequencies(query);

    const similarities = documentChunks.map(chunk => ({
      chunk,
      score: tfSimilarity(queryTF, chunk.termFrequencies),
    }));

    similarities.sort((a, b) => b.score - a.score);

    return similarities.slice(0, topK).map(res => res.chunk);
  }

  /**
   * Check if a document is already indexed.
   */
  static isDocumentIndexed(documentId: string): boolean {
    return globalVectorStore.has(documentId);
  }

  /**
   * Flushes a document's cache.
   */
  static clearDocumentIndex(documentId: string): void {
    globalVectorStore.delete(documentId);
  }
}
