import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PDFProcessingOptions {
  type: 'merge' | 'split' | 'compress' | 'watermark' | 'rotate';
  pages?: number[];
  watermarkText?: string;
  rotationAngle?: number;
  compressionLevel?: number;
}

export interface ProcessingResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
  originalSize?: number;
  processedSize?: number;
}

/**
 * Process a PDF file based on the specified options
 */
export async function processPDF(
  pdfBuffer: ArrayBuffer,
  options: PDFProcessingOptions
): Promise<ProcessingResult> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const originalSize = pdfBuffer.byteLength;
    
    let processedDoc: PDFDocument;

    switch (options.type) {
      case 'split':
        processedDoc = await splitPDF(pdfDoc, options.pages || [1]);
        break;
      case 'watermark':
        processedDoc = await addWatermark(pdfDoc, options.watermarkText || 'RevisePDF');
        break;
      case 'rotate':
        processedDoc = await rotatePDF(pdfDoc, options.rotationAngle || 90);
        break;
      case 'compress':
        processedDoc = await compressPDF(pdfDoc);
        break;
      default:
        processedDoc = pdfDoc;
    }

    const pdfBytes = await processedDoc.save();
    
    return {
      success: true,
      data: pdfBytes,
      originalSize,
      processedSize: pdfBytes.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Split PDF into specific pages
 */
async function splitPDF(pdfDoc: PDFDocument, pageNumbers: number[]): Promise<PDFDocument> {
  const newDoc = await PDFDocument.create();
  const totalPages = pdfDoc.getPageCount();
  
  for (const pageNum of pageNumbers) {
    if (pageNum > 0 && pageNum <= totalPages) {
      const [page] = await newDoc.copyPages(pdfDoc, [pageNum - 1]);
      newDoc.addPage(page);
    }
  }
  
  return newDoc;
}

/**
 * Add watermark to PDF
 */
async function addWatermark(pdfDoc: PDFDocument, watermarkText: string): Promise<PDFDocument> {
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    page.drawText(watermarkText, {
      x: width / 2 - (watermarkText.length * 8),
      y: height / 2,
      size: 50,
      font,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3,
      rotate: { angle: Math.PI / 4, origin: { x: width / 2, y: height / 2 } }
    });
  }
  
  return pdfDoc;
}

/**
 * Rotate PDF pages
 */
async function rotatePDF(pdfDoc: PDFDocument, angle: number): Promise<PDFDocument> {
  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    page.setRotation({ angle: (angle * Math.PI) / 180, origin: page.getSize() });
  }
  
  return pdfDoc;
}

/**
 * Compress PDF (basic compression)
 */
async function compressPDF(pdfDoc: PDFDocument): Promise<PDFDocument> {
  // Basic compression by re-saving the document
  // More advanced compression would require additional libraries
  return pdfDoc;
}

/**
 * Merge multiple PDFs
 */
export async function mergePDFs(pdfBuffers: ArrayBuffer[]): Promise<ProcessingResult> {
  try {
    const mergedDoc = await PDFDocument.create();
    let totalOriginalSize = 0;
    
    for (const buffer of pdfBuffers) {
      totalOriginalSize += buffer.byteLength;
      const pdfDoc = await PDFDocument.load(buffer);
      const pageCount = pdfDoc.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
      const pages = await mergedDoc.copyPages(pdfDoc, pageIndices);
      
      pages.forEach(page => mergedDoc.addPage(page));
    }
    
    const pdfBytes = await mergedDoc.save();
    
    return {
      success: true,
      data: pdfBytes,
      originalSize: totalOriginalSize,
      processedSize: pdfBytes.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to merge PDFs'
    };
  }
}

/**
 * Get PDF metadata
 */
export async function getPDFMetadata(pdfBuffer: ArrayBuffer) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const creator = pdfDoc.getCreator();
    const producer = pdfDoc.getProducer();
    const creationDate = pdfDoc.getCreationDate();
    const modificationDate = pdfDoc.getModificationDate();
    
    // Get first page dimensions
    const firstPage = pdfDoc.getPage(0);
    const { width, height } = firstPage.getSize();
    
    return {
      pageCount,
      title,
      author,
      creator,
      producer,
      creationDate,
      modificationDate,
      dimensions: { width, height },
      fileSize: pdfBuffer.byteLength
    };
  } catch (error) {
    throw new Error(`Failed to read PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate PDF file
 */
export async function validatePDF(buffer: ArrayBuffer): Promise<{ isValid: boolean; error?: string }> {
  try {
    await PDFDocument.load(buffer);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid PDF file'
    };
  }
}

/**
 * Get processing type display name
 */
export function getProcessingTypeDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    'merge': 'Merge PDFs',
    'split': 'Split PDF',
    'compress': 'Compress PDF',
    'watermark': 'Add Watermark',
    'rotate': 'Rotate PDF',
    'upload': 'File Upload'
  };
  
  return displayNames[type] || type;
}
