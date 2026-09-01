import type { DetectedFile } from '../types/models';

const extensions: Record<string, DetectedFile> = {
  pdf: { type: 'pdf', mimeType: 'application/pdf' },
  gp3: { type: 'guitar-pro', mimeType: 'application/x-guitar-pro' },
  gp4: { type: 'guitar-pro', mimeType: 'application/x-guitar-pro' },
  gp5: { type: 'guitar-pro', mimeType: 'application/x-guitar-pro' },
  gpx: { type: 'guitar-pro', mimeType: 'application/x-guitar-pro' },
  gp: { type: 'guitar-pro', mimeType: 'application/x-guitar-pro' }
};

export function titleFromFileName(name: string): string { return name.replace(/\.[^.]+$/, '').trim() || 'Unbenannter Song'; }
export function detectFile(file: File): DetectedFile | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && extensions[extension]) return extensions[extension];
  if (file.type === 'application/pdf') return extensions.pdf;
  return null;
}
export async function validateFile(file: File): Promise<DetectedFile> {
  const detected = detectFile(file);
  if (!detected) throw new Error('Dieses Dateiformat wird nicht unterstützt. Erlaubt sind PDF, GP3, GP4, GP5, GPX und GP.');
  if (file.size === 0) throw new Error('Die Datei ist leer.');
  if (detected.type === 'pdf') {
    const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    if (header !== '%PDF-') throw new Error('Die PDF-Datei ist beschädigt oder keine gültige PDF.');
  }
  return detected;
}
