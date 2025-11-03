import OpenAI from 'openai';
import { AIProcessingRequest, AIResponse, ProcessingOptions, ProcessedContent, Notes, Quiz, Flashcard } from '../types';

export class AIProcessor {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Process content and generate learning materials
  static async processContent(request: AIProcessingRequest): Promise<AIResponse> {
    try {
      const { document_id, content, content_type, processing_options } = request;

      // First, analyze the content to get summary and key concepts
      const analysisResult = await this.analyzeContent(content, content_type);

      const results: any = {
        document_id,
        processed_content: analysisResult,
      };

      // Generate learning materials based on options
      if (processing_options.generate_notes) {
        results.notes = await this.generateNotes(content, analysisResult, processing_options.difficulty_level);
      }

      if (processing_options.generate_quiz) {
        results.quiz = await this.generateQuiz(content, analysisResult, processing_options);
      }

      if (processing_options.generate_flashcards) {
        results.flashcards = await this.generateFlashcards(content, analysisResult, processing_options);
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error('AI Processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error',
      };
    }
  }

  // Analyze content to extract summary and key concepts
  private static async analyzeContent(content: string, contentType: string): Promise<ProcessedContent> {
    try {
      const prompt = `
        Analyze the following ${contentType} content and provide a comprehensive analysis:

        CONTENT:
        """
        ${content.substring(0, 8000)} // Limit content to avoid token limits
        """

        Please provide:
        1. A concise summary (2-3 paragraphs)
        2. 5-7 key concepts or main ideas
        3. Difficulty level assessment (beginner, intermediate, advanced)
        4. Word count and confidence score

        Format your response as JSON:
        {
          "summary": "concise summary here",
          "key_points": ["point 1", "point 2", ...],
          "concepts": ["concept 1", "concept 2", ...],
          "difficulty": "beginner|intermediate|advanced",
          "word_count": number,
          "confidence_score": number_between_0_and_1
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content analyzer. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      const analysis = JSON.parse(response);
      const wordCount = content.split(/\s+/).length;

      return {
        document_id: '', // Will be set by caller
        summary: analysis.summary || 'Unable to generate summary',
        key_points: analysis.key_points || [],
        concepts: analysis.concepts || [],
        difficulty: analysis.difficulty || 'intermediate',
        processing_metadata: {
          word_count: wordCount,
          processing_time: Date.now(),
          confidence_score: analysis.confidence_score || 0.8,
        },
      };
    } catch (error) {
      console.error('Content analysis error:', error);

      // Fallback analysis
      const wordCount = content.split(/\s+/).length;
      return {
        document_id: '',
        summary: 'Content analysis temporarily unavailable. The material has been saved and can be processed later.',
        key_points: this.extractBasicKeyPoints(content),
        concepts: this.extractBasicConcepts(content),
        difficulty: 'intermediate',
        processing_metadata: {
          word_count: wordCount,
          processing_time: Date.now(),
          confidence_score: 0.5,
        },
      };
    }
  }

  // Generate structured notes
  private static async generateNotes(
    content: string,
    analysis: ProcessedContent,
    difficulty?: string
  ): Promise<Notes> {
    try {
      const prompt = `
        Create comprehensive, structured notes based on this content and analysis:

        CONTENT SUMMARY: ${analysis.summary}
        KEY POINTS: ${analysis.key_points.join(', ')}
        CONCEPTS: ${analysis.concepts.join(', ')}
        DIFFICULTY: ${difficulty || 'intermediate'}

        ORIGINAL CONTENT:
        """
        ${content.substring(0, 6000)}
        """

        Create well-structured notes with:
        1. An overall title
        2. 3-5 main sections, each with:
           - A clear title
           - Detailed content (2-3 paragraphs)
           - 3-4 bullet points for key takeaways
        3. Sections should flow logically from introduction to conclusion

        Format as JSON:
        {
          "title": "Descriptive title for the notes",
          "sections": [
            {
              "title": "Section title",
              "content": "Detailed section content",
              "key_points": ["point 1", "point 2", ...],
              "order": 1
            }
          ]
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educator creating structured learning materials. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      const notesData = JSON.parse(response);

      return {
        id: '', // Will be set by database
        document_id: '', // Will be set by caller
        title: notesData.title || 'Study Notes',
        content: notesData.sections.map((section: any, index: number) => ({
          id: `section-${index + 1}`,
          title: section.title || `Section ${index + 1}`,
          content: section.content || '',
          key_points: section.key_points || [],
          is_highlighted: false,
          order: section.order || index + 1,
        })),
        ai_generated: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error) {
      console.error('Notes generation error:', error);

      // Fallback notes
      return {
        id: '',
        document_id: '',
        title: 'Study Notes',
        content: [
          {
            id: 'section-1',
            title: 'Overview',
            content: analysis.summary,
            key_points: analysis.key_points.slice(0, 3),
            is_highlighted: false,
            order: 1,
          },
        ],
        ai_generated: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
  }

  // Generate quiz questions
  private static async generateQuiz(
    content: string,
    analysis: ProcessedContent,
    options: ProcessingOptions
  ): Promise<Quiz> {
    try {
      const questionCount = options.quiz_questions_count || 10;
      const difficulty = options.difficulty_level || 'intermediate';

      const prompt = `
        Create a comprehensive quiz based on this educational content:

        CONTENT SUMMARY: ${analysis.summary}
        KEY POINTS: ${analysis.key_points.join(', ')}
        CONCEPTS: ${analysis.concepts.join(', ')}
        DIFFICULTY: ${difficulty}

        ORIGINAL CONTENT:
        """
        ${content.substring(0, 6000)}
        """

        Create ${questionCount} quiz questions with a mix of:
        - Multiple choice questions (40%)
        - True/false questions (30%)
        - Short answer questions (30%)

        Each question should include:
        - Clear question text
        - Options for multiple choice
        - Correct answer(s)
        - Detailed explanation
        - Point value (1-3 points based on difficulty)

        Format as JSON:
        {
          "title": "Quiz title",
          "questions": [
            {
              "type": "multiple-choice|true-false|short-answer",
              "question": "Question text",
              "options": ["option A", "option B", "option C", "option D"],
              "correct_answer": "correct answer or array of answers",
              "explanation": "Detailed explanation",
              "points": 2,
              "order": 1
            }
          ]
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educator creating assessment materials. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      const quizData = JSON.parse(response);

      return {
        id: '', // Will be set by database
        document_id: '', // Will be set by caller
        title: quizData.title || 'Knowledge Check Quiz',
        questions: quizData.questions.map((q: any, index: number) => ({
          id: `question-${index + 1}`,
          type: q.type || 'multiple-choice',
          question: q.question || '',
          options: q.options || [],
          correct_answer: q.correct_answer || '',
          explanation: q.explanation || '',
          points: q.points || 1,
          order: q.order || index + 1,
        })),
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        time_limit: questionCount * 2, // 2 minutes per question
        created_at: new Date(),
      };
    } catch (error) {
      console.error('Quiz generation error:', error);

      // Fallback quiz
      return {
        id: '',
        document_id: '',
        title: 'Quick Knowledge Check',
        questions: [
          {
            id: 'question-1',
            type: 'multiple-choice',
            question: 'What is the main topic of this material?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: 'Option A',
            explanation: 'Based on the content analysis',
            points: 1,
            order: 1,
          },
        ],
        difficulty: 'intermediate',
        time_limit: 10,
        created_at: new Date(),
      };
    }
  }

  // Generate flashcards
  private static async generateFlashcards(
    content: string,
    analysis: ProcessedContent,
    options: ProcessingOptions
  ): Promise<Flashcard[]> {
    try {
      const cardCount = options.flashcards_count || 15;
      const difficulty = options.difficulty_level || 'intermediate';

      const prompt = `
        Create ${cardCount} flashcards based on this educational content:

        CONTENT SUMMARY: ${analysis.summary}
        KEY POINTS: ${analysis.key_points.join(', ')}
        CONCEPTS: ${analysis.concepts.join(', ')}
        DIFFICULTY: ${difficulty}

        ORIGINAL CONTENT:
        """
        ${content.substring(0, 6000)}
        """

        Create flashcards with:
        - Clear term/concept on the front
        - Detailed definition/explanation on the back
        - Categorize by difficulty (easy, medium, hard)
        - Optional category grouping

        Focus on:
        - Key definitions
        - Important concepts
        - Formulas or processes
        - Cause-effect relationships
        - Comparisons and contrasts

        Format as JSON:
        {
          "flashcards": [
            {
              "term": "Term or concept",
              "definition": "Detailed definition or explanation",
              "difficulty": "easy|medium|hard",
              "category": "optional category name"
            }
          ]
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educator creating study flashcards. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      const flashcardsData = JSON.parse(response);

      return flashcardsData.flashcards.map((card: any, index: number) => ({
        id: `flashcard-${index + 1}`,
        document_id: '', // Will be set by caller
        term: card.term || `Term ${index + 1}`,
        definition: card.definition || 'Definition',
        difficulty: card.difficulty || 'medium',
        category: card.category || undefined,
        created_at: new Date(),
      }));
    } catch (error) {
      console.error('Flashcard generation error:', error);

      // Fallback flashcards
      return analysis.key_points.slice(0, 5).map((point, index) => ({
        id: `flashcard-${index + 1}`,
        document_id: '',
        term: `Key Point ${index + 1}`,
        definition: point,
        difficulty: 'medium' as const,
        category: 'Key Concepts',
        created_at: new Date(),
      }));
    }
  }

  // Fallback methods for basic extraction
  private static extractBasicKeyPoints(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private static extractBasicConcepts(content: string): string[] {
    // Simple concept extraction - look for capitalized terms and important keywords
    const words = content.split(/\s+/);
    const concepts = words
      .filter(word => word.length > 6 && /^[A-Z]/.test(word))
      .slice(0, 5);
    return concepts;
  }
}