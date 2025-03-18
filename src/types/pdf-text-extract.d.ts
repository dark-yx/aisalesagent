
declare module 'pdf-text-extract' {
  function extractText(filePath: string): Promise<string[]>;
  export { extractText };
}
