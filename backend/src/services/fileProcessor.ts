import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { YoutubeTranscript } from 'youtube-transcript';
import { Document } from '../types';

export class FileProcessor {
  // Process uploaded file and extract text
  static async processFile(file: Express.Multer.File): Promise<{ content: string; title: string }> {
    const { mimetype, originalname, buffer } = file;

    try {
      switch (mimetype) {
        case 'application/pdf':
          return await this.processPDF(buffer, originalname);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.processDOCX(buffer, originalname);

        case 'text/plain':
          return await this.processText(buffer, originalname);

        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process PDF file
  private static async processPDF(buffer: Buffer, filename: string): Promise<{ content: string; title: string }> {
    try {
      const data = await pdf(buffer);
      const content = data.text;

      if (!content.trim()) {
        throw new Error('No text content found in PDF');
      }

      return {
        content: content.trim(),
        title: filename.replace(/\.[^/.]+$/, ''), // Remove file extension
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process DOCX file
  private static async processDOCX(buffer: Buffer, filename: string): Promise<{ content: string; title: string }> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const content = result.value;

      if (!content.trim()) {
        throw new Error('No text content found in DOCX file');
      }

      return {
        content: content.trim(),
        title: filename.replace(/\.[^/.]+$/, ''), // Remove file extension
      };
    } catch (error) {
      throw new Error(`DOCX processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process plain text file
  private static async processText(buffer: Buffer, filename: string): Promise<{ content: string; title: string }> {
    try {
      const content = buffer.toString('utf-8');

      if (!content.trim()) {
        throw new Error('Text file is empty');
      }

      return {
        content: content.trim(),
        title: filename.replace(/\.[^/.]+$/, ''), // Remove file extension
      };
    } catch (error) {
      throw new Error(`Text processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Extract YouTube video transcript
  static async processYouTube(url: string): Promise<{ content: string; title: string }> {
    try {
      // Extract video ID from YouTube URL
      const videoId = this.extractYouTubeVideoId(url);

      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      // Get transcript
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
      });

      if (!transcript || transcript.length === 0) {
        throw new Error('No transcript available for this video');
      }

      // Combine transcript segments
      const content = transcript
        .map(segment => segment.text)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      if (!content) {
        throw new Error('Empty transcript extracted');
      }

      // Extract video title (simplified - in production, you might use YouTube API)
      const title = `YouTube Video - ${videoId}`;

      return {
        content,
        title,
      };
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific YouTube transcript errors
        if (error.message.includes('transcript')) {
          throw new Error('This video has no available transcript or transcript is disabled');
        }
        if (error.message.includes('video') && error.message.includes('invalid')) {
          throw new Error('Invalid YouTube video URL or video not found');
        }
      }
      throw new Error(`YouTube processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Extract YouTube video ID from URL
  private static extractYouTubeVideoId(url: string): string | null {
    // YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  // Validate file before processing
  static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size (default 10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit',
      };
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Unsupported file type. Please upload PDF, DOCX, or plain text files.',
      };
    }

    // Check filename
    if (!file.originalname || file.originalname.trim() === '') {
      return {
        valid: false,
        error: 'Invalid filename',
      };
    }

    return { valid: true };
  }

  // Validate YouTube URL
  static validateYouTubeUrl(url: string): { valid: boolean; error?: string } {
    if (!url || typeof url !== 'string') {
      return {
        valid: false,
        error: 'YouTube URL is required',
      };
    }

    const videoId = this.extractYouTubeVideoId(url);
    if (!videoId) {
      return {
        valid: false,
        error: 'Invalid YouTube URL format',
      };
    }

    return { valid: true };
  }

  // Clean and normalize text content
  static cleanContent(content: string): string {
    return content
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/\s{2,}/g, ' ') // Remove excessive spaces
      .trim();
  }

  // Get content metadata
  static getContentMetadata(content: string): {
    wordCount: number;
    characterCount: number;
    readingTime: number; // estimated minutes
  } {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const characterCount = content.length;

    // Estimate reading time (average reading speed: 200-250 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    return {
      wordCount,
      characterCount,
      readingTime,
    };
  }
}