import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up pdfjs worker using standard cdn fallback for browser bundler compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ExtractedFile {
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'text';
  content: string; // extracted plain text or base64 image data string
  base64?: string;
  size: number;
}

export const processFileClientSide = async (file: File): Promise<ExtractedFile> => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (file.type.startsWith('image/')) {
    const base64 = await fileToBase64(file);
    return {
      name: file.name,
      type: 'image',
      content: `[Image: ${file.name}]`,
      base64,
      size: file.size,
    };
  }

  if (extension === 'pdf' || file.type === 'application/pdf') {
    const text = await extractTextFromPdf(file);
    return {
      name: file.name,
      type: 'pdf',
      content: text,
      size: file.size,
    };
  }

  if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const text = await extractTextFromDocx(file);
    return {
      name: file.name,
      type: 'docx',
      content: text,
      size: file.size,
    };
  }

  // Plain text / Markdown fallback
  const text = await fileToText(file);
  return {
    name: file.name,
    type: 'text',
    content: text,
    size: file.size,
  };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText.trim() || '[No extractable text found in PDF]';
  } catch (err: any) {
    console.warn('PDF.js extraction error fallback:', err);
    return `[PDF File: ${file.name} - ${Math.round(file.size / 1024)} KB]`;
  }
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim() || '[No extractable text found in DOCX]';
  } catch (err: any) {
    console.warn('Mammoth extraction error fallback:', err);
    return `[DOCX Document: ${file.name} - ${Math.round(file.size / 1024)} KB]`;
  }
};
