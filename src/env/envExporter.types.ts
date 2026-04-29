export type ExportFormat = "dotenv" | "json" | "shell";

export interface ExportOptions {
  /**
   * Output format for the exported env file.
   * @default "dotenv"
   */
  format?: ExportFormat;

  /**
   * File path to write the exported content.
   * @default ".env"
   */
  outputPath?: string;

  /**
   * Whether to include a generated-by comment header (dotenv only).
   * @default true
   */
  includeComments?: boolean;
}

export interface ExportResult {
  content: string;
  format: ExportFormat;
  outputPath?: string;
  writtenAt?: Date;
}
