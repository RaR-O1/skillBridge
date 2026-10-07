/**
 * SkillBridge Vector Embeddings & Similarity Engine
 * Supports local high-dimensional vector representations and cosine similarity calculation.
 */

export class EmbeddingsEngine {
  // Dimension of vector embeddings
  private static readonly DIMENSIONS = 128;

  /**
   * Deterministic feature-hashing embedding generator.
   * Works offline without requiring third-party API keys or external billing,
   * while producing cosine similarities proportional to semantic and skill overlap.
   */
  static generateEmbedding(text: string): number[] {
    const vector = new Array(this.DIMENSIONS).fill(0);
    if (!text || text.trim() === '') return vector;

    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = normalized.split(/\s+/).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      let hash = 0;
      for (let j = 0; j < token.length; j++) {
        hash = (hash << 5) - hash + token.charCodeAt(j);
        hash |= 0;
      }

      const index = Math.abs(hash) % this.DIMENSIONS;
      const weight = 1.0 / Math.sqrt(tokens.length);
      vector[index] += weight;

      // Bigram feature capture
      if (i > 0) {
        const bigram = `${tokens[i - 1]}_${token}`;
        let biHash = 0;
        for (let k = 0; k < bigram.length; k++) {
          biHash = (biHash << 5) - biHash + bigram.charCodeAt(k);
          biHash |= 0;
        }
        const biIndex = Math.abs(biHash) % this.DIMENSIONS;
        vector[biIndex] += weight * 0.7;
      }
    }

    // L2 Normalize vector
    let norm = 0;
    for (let i = 0; i < this.DIMENSIONS; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < this.DIMENSIONS; i++) {
        vector[i] = vector[i] / norm;
      }
    }

    return vector;
  }

  /**
   * Calculates cosine similarity between two normalized vectors.
   * Returns a value between 0.0 and 1.0.
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }

    // Since vectors are L2-normalized, cosine similarity is just dot product clamped to [0, 1]
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Calculates exact skill overlap ratio between candidate skills and required skills.
   * Returns value between 0.0 and 1.0.
   */
  static calculateSkillOverlap(candidateSkills: string[], requiredSkills: string[]): number {
    if (!requiredSkills || requiredSkills.length === 0) return 1.0;
    if (!candidateSkills || candidateSkills.length === 0) return 0.0;

    const candNormalized = new Set(candidateSkills.map((s) => s.trim().toLowerCase()));
    let matches = 0;

    for (const req of requiredSkills) {
      const r = req.trim().toLowerCase();
      if (candNormalized.has(r)) {
        matches++;
      } else {
        // Partial substring match (e.g. "React" matches "React.js")
        for (const c of candNormalized) {
          if (c.includes(r) || r.includes(c)) {
            matches += 0.8;
            break;
          }
        }
      }
    }

    return Math.min(1.0, matches / requiredSkills.length);
  }
}
