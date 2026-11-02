import JSZip from 'jszip';
import { VisualAsset, ScriptDocument } from '../types/index';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp', '.avif'];
const DOC_EXTENSIONS = ['.md', '.txt', '.json', '.pdf', '.docx', '.csv', '.rtf'];

/**
 * Extracts tags from a file name or path.
 */
export function extractTags(filename: string): string[] {
  const base = filename.replace(/\.[^/.]+$/, '');
  const clean = base.replace(/[-_./\\]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 2);
  return Array.from(new Set(words));
}

/**
 * Determines image dimensions and orientation from an image Object URL or data URL.
 */
export function probeImageDimensions(url: string): Promise<{ width: number; height: number; orientation: 'landscape' | 'portrait' | 'square' }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || 1920;
      const height = img.naturalHeight || 1080;
      const ratio = width / height;
      let orientation: 'landscape' | 'portrait' | 'square' = 'landscape';
      if (ratio > 1.15) orientation = 'landscape';
      else if (ratio < 0.85) orientation = 'portrait';
      else orientation = 'square';
      resolve({ width, height, orientation });
    };
    img.onerror = () => {
      resolve({ width: 1920, height: 1080, orientation: 'landscape' });
    };
    img.src = url;
  });
}

/**
 * Parses raw text from a PDF ArrayBuffer by reading text streams.
 */
export function extractTextFromPdfBuffer(buffer: ArrayBuffer): string {
  try {
    const textDecoder = new TextDecoder('latin1');
    const content = textDecoder.decode(buffer);
    const textPieces: string[] = [];

    // Look for text in PDF BT...ET (Begin Text...End Text) blocks
    const btRegex = /BT[\s\S]*?ET/g;
    const matches = content.match(btRegex);

    if (matches && matches.length > 0) {
      for (const block of matches) {
        // Extract text in parentheses (text)Tj or [(t)(e)(x)(t)]TJ
        const tjMatches = block.match(/\((.*?)\)\s*Tj/g);
        if (tjMatches) {
          for (const tj of tjMatches) {
            const raw = tj.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
            textPieces.push(raw);
          }
        }
        const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g);
        if (tjArrayMatches) {
          for (const tja of tjArrayMatches) {
            const strings = tja.match(/\((.*?)\)/g);
            if (strings) {
              textPieces.push(strings.map(s => s.slice(1, -1)).join(''));
            }
          }
        }
      }
    }

    // If PDF text blocks found, clean and return
    if (textPieces.length > 0) {
      const joined = textPieces.join(' ').replace(/\\([()\\])/g, '$1').replace(/\s+/g, ' ').trim();
      if (joined.length > 20) {
        return joined;
      }
    }

    // Fallback: extract readable ascii sentences from PDF
    const asciiMatches = content.match(/[A-Z][a-zA-Z0-9 ,.;:'"!?\n\r-]{20,}/g);
    if (asciiMatches && asciiMatches.length > 0) {
      return asciiMatches.slice(0, 50).join('\n\n').trim();
    }

    return 'Extracted PDF document guidelines and narrative reference.';
  } catch (err) {
    console.warn('PDF extraction fallback used', err);
    return 'PDF document attached as reference guideline.';
  }
}

export interface IngestResult {
  visuals: VisualAsset[];
  documents: ScriptDocument[];
  logs: string[];
}

/**
 * Reads any combination of files, folders, or ZIP archives into structured Visual Assets and Script Documents.
 */
export async function ingestFileList(files: FileList | File[]): Promise<IngestResult> {
  const visuals: VisualAsset[] = [];
  const documents: ScriptDocument[] = [];
  const logs: string[] = [];

  const fileArray = Array.from(files);

  for (const file of fileArray) {
    const lowerName = file.name.toLowerCase();
    const relativePath = file.webkitRelativePath || file.name;

    // Handle ZIP files
    if (lowerName.endsWith('.zip')) {
      logs.push(`Unpacking ZIP archive: ${file.name}...`);
      try {
        const zip = await JSZip.loadAsync(file);
        const zipEntries = Object.keys(zip.files);

        for (const entryPath of zipEntries) {
          const zipEntry = zip.files[entryPath];
          if (zipEntry.dir) continue;

          const entryLower = entryPath.toLowerCase();

          // Check if visual image
          if (IMAGE_EXTENSIONS.some(ext => entryLower.endsWith(ext))) {
            const blob = await zipEntry.async('blob');
            const url = URL.createObjectURL(blob);
            const { width, height, orientation } = await probeImageDimensions(url);
            const id = `asset-zip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const name = entryPath.split('/').pop() || entryPath;

            visuals.push({
              id,
              name,
              path: entryPath,
              fileType: blob.type || 'image/jpeg',
              url,
              width,
              height,
              aspectRatio: orientation,
              tags: extractTags(entryPath),
            });
          }
          // Check if document or markdown
          else if (entryLower.endsWith('.md') || entryLower.endsWith('.txt') || entryLower.endsWith('.json')) {
            const text = await zipEntry.async('text');
            const format = entryLower.endsWith('.md') ? 'markdown' : 'txt';
            const name = entryPath.split('/').pop() || entryPath;
            documents.push({
              id: `doc-zip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name,
              content: text,
              format,
            });
            logs.push(`Loaded script from ZIP: ${name}`);
          }
          // Check if PDF inside zip
          else if (entryLower.endsWith('.pdf')) {
            const buffer = await zipEntry.async('arraybuffer');
            const extracted = extractTextFromPdfBuffer(buffer);
            const name = entryPath.split('/').pop() || entryPath;
            documents.push({
              id: `doc-zip-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name,
              content: extracted,
              format: 'pdf',
            });
            logs.push(`Extracted PDF from ZIP: ${name}`);
          }
        }
      } catch (err) {
        logs.push(`Error reading ZIP ${file.name}: ${(err as Error).message}`);
      }
      continue;
    }

    // Handle Image files
    if (IMAGE_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
      const url = URL.createObjectURL(file);
      const { width, height, orientation } = await probeImageDimensions(url);
      const id = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      visuals.push({
        id,
        name: file.name,
        path: relativePath,
        fileType: file.type || 'image/jpeg',
        url,
        width,
        height,
        aspectRatio: orientation,
        tags: extractTags(relativePath),
      });
      continue;
    }

    // Handle Markdown & Text files
    if (lowerName.endsWith('.md') || lowerName.endsWith('.txt') || lowerName.endsWith('.json') || lowerName.endsWith('.rtf')) {
      try {
        const text = await file.text();
        documents.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          content: text,
          format: lowerName.endsWith('.md') ? 'markdown' : 'txt',
        });
        logs.push(`Loaded script document: ${file.name}`);
      } catch (err) {
        logs.push(`Error reading document ${file.name}: ${(err as Error).message}`);
      }
      continue;
    }

    // Handle PDF files
    if (lowerName.endsWith('.pdf')) {
      try {
        const buffer = await file.arrayBuffer();
        const extracted = extractTextFromPdfBuffer(buffer);
        documents.push({
          id: `doc-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          content: extracted,
          format: 'pdf',
        });
        logs.push(`Extracted script from PDF: ${file.name}`);
      } catch (err) {
        logs.push(`Error reading PDF ${file.name}: ${(err as Error).message}`);
      }
      continue;
    }

    // Handle Word documents (.docx)
    if (lowerName.endsWith('.docx')) {
      try {
        const zip = await JSZip.loadAsync(file);
        const docXml = await zip.file('word/document.xml')?.async('text');
        if (docXml) {
          // Strip XML tags to get raw paragraph text
          const text = docXml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          documents.push({
            id: `doc-docx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            content: text,
            format: 'docx',
          });
          logs.push(`Extracted Word document script: ${file.name}`);
        }
      } catch (err) {
        logs.push(`Error reading docx ${file.name}: ${(err as Error).message}`);
      }
      continue;
    }
  }

  logs.push(`Ingestion complete: ${visuals.length} visual asset(s), ${documents.length} script document(s).`);
  return { visuals, documents, logs };
}

/**
 * Handles HTML5 drag and drop of folders and files using webkitGetAsEntry.
 */
export async function getFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const files: File[] = [];
  const items = dataTransfer.items;

  if (!items) {
    return Array.from(dataTransfer.files);
  }

  const queue: any[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) queue.push(entry);
    } else if (item.kind === 'file') {
      const f = item.getAsFile();
      if (f) files.push(f);
    }
  }

  async function traverseEntry(entry: any, currentPath: string = '') {
    if (entry.isFile) {
      return new Promise<void>((resolve) => {
        entry.file((file: File) => {
          // Attach relative path if missing
          Object.defineProperty(file, 'webkitRelativePath', {
            value: currentPath ? `${currentPath}/${file.name}` : file.name,
            writable: false,
          });
          files.push(file);
          resolve();
        }, () => resolve());
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      return new Promise<void>((resolve) => {
        const readEntries = () => {
          dirReader.readEntries(async (entries: any[]) => {
            if (entries.length === 0) {
              resolve();
            } else {
              for (const child of entries) {
                await traverseEntry(child, currentPath ? `${currentPath}/${entry.name}` : entry.name);
              }
              readEntries();
            }
          }, () => resolve());
        };
        readEntries();
      });
    }
  }

  for (const entry of queue) {
    await traverseEntry(entry);
  }

  return files.length > 0 ? files : Array.from(dataTransfer.files);
}
