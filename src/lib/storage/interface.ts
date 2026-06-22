/** File storage abstraction. Local disk in dev (Phases 1–18); S3/R2 in Phase 19. */
export interface Storage {
  put(key: string, data: Buffer, contentType?: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}
