import Tesseract from 'tesseract.js';

/**
 * Tesseract OCR Service
 * Provides local OCR functionality using Tesseract.js
 */

class TesseractService {
  constructor() {
    this.worker = null;
  }

  /**
   * Initialize Tesseract worker
   * @param {string} lang - Language code (e.g., 'eng', 'spa', 'fra')
   * @returns {Promise<void>}
   */
  async initialize(lang = 'eng') {
    try {
      if (this.worker) {
        await this.worker.terminate();
      }
      
      this.worker = await Tesseract.createWorker(lang, 1, {
        logger: (m) => console.log(m), // Optional: remove in production
      });
      
      console.log('Tesseract worker initialized');
    } catch (error) {
      console.error('Failed to initialize Tesseract worker:', error);
      throw error;
    }
  }

  /**
   * Recognize text from image file
   * @param {File|Blob} file - Image file to process
   * @param {Object} options - Recognition options
   * @returns {Promise<Object>} OCR result
   */
  async recognize(file, options = {}) {
    if (!this.worker) {
      await this.initialize(options.lang || 'eng');
    }

    try {
      const result = await this.worker.recognize(file, {
        rectangle: options.rectangle, // { top, left, width, height }
      });
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        paragraphs: result.data.paragraphs,
        symbols: result.data.symbols,
      };
    } catch (error) {
      console.error('OCR recognition failed:', error);
      throw error;
    }
  }

  /**
   * Detect text from image file
   * @param {File|Blob} file - Image file to process
   * @returns {Promise<Object>} Detection result
   */
  async detect(file) {
    if (!this.worker) {
      await this.initialize();
    }

    try {
      const result = await this.worker.detect(file);
      return result.data;
    } catch (error) {
      console.error('Text detection failed:', error);
      throw error;
    }
  }

  /**
   * Terminate the worker to free resources
   * @returns {Promise<void>}
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Process medical document with custom configuration
   * @param {File|Blob} file - Medical document image
   * @param {Object} config - Processing configuration
   * @returns {Promise<Object>} Processed result
   */
  async processMedicalDocument(file, config = {}) {
    const defaultConfig = {
      lang: 'eng',
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,()-/:',
      preserve_interword_spaces: '1',
      ...config
    };

    if (!this.worker) {
      await this.initialize(defaultConfig.lang);
    }

    // Set custom parameters for medical documents
    await this.worker.setParameters({
      tessedit_char_whitelist: defaultConfig.tessedit_char_whitelist,
      preserve_interword_spaces: defaultConfig.preserve_interword_spaces,
    });

    const result = await this.recognize(file);
    
    // Post-process for medical data extraction
    return this.extractMedicalData(result);
  }

  /**
   * Extract structured medical data from OCR text
   * @param {Object} ocrResult - Raw OCR result
   * @returns {Object} Structured medical data
   */
  extractMedicalData(ocrResult) {
    const text = ocrResult.text;
    
    // Simple regex patterns for common medical data
    const patterns = {
      patientName: /Patient[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      date: /Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      diagnosis: /Diagnosis[:\s]*([A-Za-z\s,]+)/i,
      medication: /Medication[:\s]*([A-Za-z\s]+)/i,
      dosage: /Dosage[:\s]*([0-9]+[a-z]*)/i,
      vitalSigns: {
        bloodPressure: /(\d{2,3})\/(\d{2,3})\s*(mmHg|BP)/i,
        heartRate: /(\d{2,3})\s*(bpm|HR|heart\s*rate)/i,
        temperature: /(\d{2,3}(\.\d)?)\s*(°?F|°?C|temp)/i,
        oxygen: /(\d{2,3})\s*%?\s*(O2|oxygen|saturation)/i
      }
    };

    const extracted = {
      rawText: text,
      confidence: ocrResult.confidence,
      structured: {}
    };

    // Extract basic fields
    Object.keys(patterns).forEach(key => {
      if (key !== 'vitalSigns' && patterns[key]) {
        const match = text.match(patterns[key]);
        if (match) {
          extracted.structured[key] = match[1].trim();
        }
      }
    });

    // Extract vital signs
    extracted.structured.vitalSigns = {};
    Object.keys(patterns.vitalSigns).forEach(key => {
      const match = text.match(patterns.vitalSigns[key]);
      if (match) {
        if (key === 'bloodPressure') {
          extracted.structured.vitalSigns[key] = {
            systolic: parseInt(match[1]),
            diastolic: parseInt(match[2])
          };
        } else {
          extracted.structured.vitalSigns[key] = parseFloat(match[1]);
        }
      }
    });

    return extracted;
  }
}

// Export singleton instance
const tesseractService = new TesseractService();
export default tesseractService;