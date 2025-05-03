import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as xml2js from 'xml2js';
import { Question } from '../entities/question.entity';
import { Assessment } from '../entities/assessment.entity';
import { QuestionType } from '../interfaces/question-types.interface';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
  ) {}

  async importQti(fileBuffer: Buffer): Promise<any> {
    try {
      // Parse QTI XML
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(fileBuffer.toString());
      
      // Process QTI content and convert to our question format
      const importedQuestions = await this.processQtiQuestions(result);
      
      return {
        success: true,
        imported: importedQuestions.length,
        questions: importedQuestions,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async exportQti(questionIds: string[], assessmentId?: string): Promise<string> {
    let questions: Question[] = [];
    
    if (questionIds && questionIds.length > 0) {
      questions = await this.questionRepository.findBy({
        id: In(questionIds),
      });
    } else if (assessmentId) {
      const assessment = await this.assessmentRepository.findOne({
        where: { id: assessmentId },
        relations: ['questions'],
      });
      
      if (assessment) {
        questions = assessment.questions;
      }
    }
    
    if (questions.length === 0) {
      throw new Error('No questions found for export');
    }
    
    // Convert questions to QTI format
    const qtiContent = this.convertToQti(questions, assessmentId);
    
    return qtiContent;
  }

  async importCsv(fileBuffer: Buffer): Promise<any> {
    // Parse CSV and convert to questions
    // This is a placeholder implementation
    return {
      success: true,
      imported: 0,
      message: 'CSV import not fully implemented',
    };
  }

  async exportCsv(questionIds: string[]): Promise<string> {
    if (!questionIds || questionIds.length === 0) {
      throw new Error('No question IDs provided for export');
    }
    
    const questions = await this.questionRepository.findBy({
      id: In(questionIds),
    });
    
    if (questions.length === 0) {
      throw new Error('No questions found for export');
    }
    
    // Convert questions to CSV format
    const csvContent = this.convertToCsv(questions);
    
    return csvContent;
  }

  async importJson(data: any): Promise<any> {
    try {
      let importedQuestions = 0;
      let importedAssessments = 0;
      
      // Process questions
      if (data.questions && Array.isArray(data.questions)) {
        for (const questionData of data.questions) {
          // Basic validation
          if (!questionData.title || !questionData.type) {
            continue;
          }
          
          // Create question
          const question = this.questionRepository.create({
            title: questionData.title,
            description: questionData.description || '',
            type: questionData.type,
            content: questionData.content || {},
            conditionalLogic: questionData.conditionalLogic,
            difficultyMetrics: questionData.difficultyMetrics || {
              initialDifficulty: 50,
              currentDifficulty: 50,
              totalAttempts: 0,
              successRate: 0,
              averageTimeSpent: 0,
              calibrationConfidence: 0,
            },
            metadata: questionData.metadata,
            currentVersion: 1,
          });
          
          await this.questionRepository.save(question);
          importedQuestions++;
        }
      }
      
      // Process assessments
      if (data.assessments && Array.isArray(data.assessments)) {
        for (const assessmentData of data.assessments) {
          // Basic validation
          if (!assessmentData.title) {
            continue;
          }
          
          // Create assessment
          const assessment = this.assessmentRepository.create({
            title: assessmentData.title,
            description: assessmentData.description || '',
            instructions: assessmentData.instructions,
            timeLimit: assessmentData.timeLimit || 0,
            questionSelection: assessmentData.questionSelection,
            conditionalLogic: assessmentData.conditionalLogic,
            scoringRules: assessmentData.scoringRules,
            shuffleQuestions: assessmentData.shuffleQuestions || false,
            showResults: assessmentData.showResults || false,
            allowReview: assessmentData.allowReview || false,
            allowRetake: assessmentData.allowRetake || false,
            maxAttempts: assessmentData.maxAttempts || 0,
            metadata: assessmentData.metadata,
          });
          
          await this.assessmentRepository.save(assessment);
          importedAssessments++;
        }
      }
      
      return {
        success: true,
        imported: {
          questions: importedQuestions,
          assessments: importedAssessments,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async exportJson(questionIds: string[], assessmentId?: string): Promise<any> {
    const result: any = {
      questions: [],
      assessments: [],
    };
    
    // Export questions
    if (questionIds && questionIds.length > 0) {
      const questions = await this.questionRepository.findBy({
        id: In(questionIds),
      });
      
      result.questions = questions.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        type: q.type,
        content: q.content,
        conditionalLogic: q.conditionalLogic,
        difficultyMetrics: q.difficultyMetrics,
        metadata: q.metadata,
      }));
    }
    
    // Export assessment
    if (assessmentId) {
      const assessment = await this.assessmentRepository.findOne({
        where: { id: assessmentId },
        relations: ['questions'],
      });
      
      if (assessment) {
        result.assessments = [{
          id: assessment.id,
          title: assessment.title,
          description: assessment.description,
          instructions: assessment.instructions,
          timeLimit: assessment.timeLimit,
          questionSelection: assessment.questionSelection,
          conditionalLogic: assessment.conditionalLogic,
          scoringRules: assessment.scoringRules,
          shuffleQuestions: assessment.shuffleQuestions,
          showResults: assessment.showResults,
          allowReview: assessment.allowReview,
          allowRetake: assessment.allowRetake,
          maxAttempts: assessment.maxAttempts,
          metadata: assessment.metadata,
          questionIds: assessment.questions.map(q => q.id),
        }];
      }
    }
    
    return result;
  }

  async getImportTemplates(): Promise<any> {
    // Return templates for different import formats
    return {
      csv: {
        template: 'title,type,description,difficulty\nSample Question,MULTIPLE_CHOICE,This is a sample question,50',
        instructions: 'CSV should include columns for title, type, description, and difficulty. For multiple choice questions, add options in separate columns.',
      },
      json: {
        template: {
          questions: [
            {
              title: 'Sample Multiple Choice Question',
              type: 'MULTIPLE_CHOICE',
              description: 'This is a sample multiple choice question',
              content: {
                prompt: 'What is the capital of France?',
                options: [
                  { id: 'a', text: 'London', isCorrect: false },
                  { id: 'b', text: 'Paris', isCorrect: true },
                  { id: 'c', text: 'Berlin', isCorrect: false },
                  { id: 'd', text: 'Rome', isCorrect: false },
                ],
              },
            },
          ],
        },
        instructions: 'JSON should follow the structure shown in the template. Each question requires a title, type, and content appropriate for the question type.',
      },
      qti: {
        instructions: 'QTI XML should follow the IMS Question & Test Interoperability specification. The system supports QTI 2.1.',
      },
    };
  }

  // Helper methods

  private async processQtiQuestions(qtiData: any): Promise<any[]> {
    // This would parse QTI data and convert to our question format
    // For now, return a placeholder implementation
    
    const importedQuestions = [];
    
    // Example processing for assessmentItem elements
    if (qtiData.assessmentItem) {
      const items = Array.isArray(qtiData.assessmentItem)
        ? qtiData.assessmentItem
        : [qtiData.assessmentItem];
      
      for (const item of items) {
        // Convert QTI item to our question format
        const question = await this.convertQtiItemToQuestion(item);
        importedQuestions.push(question);
      }
    } else if (qtiData.assessmentTest) {
      // Process assessment test
      // This would be more complex and require processing the test structure
    }
    
    return importedQuestions;
  }

  private async convertQtiItemToQuestion(qtiItem: any): Promise<Question> {
    // This would convert a QTI item to our question format
    // For now, create a basic question as a placeholder
    
    // Determine question type
    let questionType = QuestionType.MULTIPLE_CHOICE;
    let content: any = {
      prompt: 'Imported question',
      options: [],
    };
    
    // Process different QTI interaction types
    if (qtiItem.responseDeclaration?.cardinality === 'single') {
      questionType = QuestionType.MULTIPLE_CHOICE;
    } else if (qtiItem.responseDeclaration?.cardinality === 'multiple') {
      questionType = QuestionType.MULTIPLE_ANSWER;
    }
    
    // Create and save question
    const question = this.questionRepository.create({
      title: qtiItem.title || 'Imported Question',
      description: 'Imported from QTI',
      type: questionType,
      content,
      difficultyMetrics: {
        initialDifficulty: 50,
        currentDifficulty: 50,
        totalAttempts: 0,
        successRate: 0,
        averageTimeSpent: 0,
        calibrationConfidence: 0,
      },
      metadata: {
        importSource: 'QTI',
        qtiIdentifier: qtiItem.identifier,
      },
      currentVersion: 1,
    });
    
    return this.questionRepository.save(question);
  }

  private convertToQti(questions: Question[], assessmentId?: string): string {
    // This would convert our questions to QTI format
    // For now, generate a basic QTI XML as a placeholder
    
    const builder = new xml2js.Builder({
      rootName: 'questestinterop',
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });
    
    const qtiItems = questions.map((question, index) => {
      // Generate QTI for each question based on its type
      return this.generateQtiItem(question, index);
    });
    
    let qtiData: any = {
      $: {
        xmlns: 'http://www.imsglobal.org/xsd/imsqti_v2p1',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd',
      },
      assessmentItem: qtiItems,
    };
    
    // If this is for an assessment, wrap in assessmentTest
    if (assessmentId) {
      qtiData = {
        $: {
          xmlns: 'http://www.imsglobal.org/xsd/imsqti_v2p1',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd',
        },
        assessmentTest: {
          $: {
            identifier: `assessment_${assessmentId}`,
            title: 'Exported Assessment',
          },
          testPart: {
            $: {
              identifier: 'testPart',
              navigationMode: 'linear',
              submissionMode: 'individual',
            },
            assessmentSection: {
              $: {
                identifier: 'section',
                title: 'Section',
              },
              assessmentItemRef: questions.map(q => ({
                $: {
                  identifier: `ref_${q.id}`,
                  href: `${q.id}.xml`,
                },
              })),
            },
          },
        },
      };
    }
    
    return builder.buildObject(qtiData);
  }

  private generateQtiItem(question: Question, index: number): any {
    // Generate QTI for a specific question
    // This is a simplified implementation
    
    let itemBody: any = {};
    let responseDeclaration: any = {};
    
    switch(question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        responseDeclaration = {
          $: {
            identifier: 'RESPONSE',
            cardinality: 'single',
            baseType: 'identifier',
          },
          correctResponse: {
            value: question.content.options.find(o => o.isCorrect)?.id || '',
          },
        };
        
        itemBody = {
          choiceInteraction: {
            $: {
              responseIdentifier: 'RESPONSE',
              shuffle: question.content.shuffleOptions ? 'true' : 'false',
              maxChoices: '1',
            },
            prompt: question.content.prompt,
            simpleChoice: question.content.options.map(option => ({
              $: { identifier: option.id },
              _: option.text,
            })),
          },
        };
        break;
        
      case QuestionType.MULTIPLE_ANSWER:
        responseDeclaration = {
          $: {
            identifier: 'RESPONSE',
            cardinality: 'multiple',
            baseType: 'identifier',
          },
          correctResponse: {
            value: question.content.options
              .filter(o => o.isCorrect)
              .map(o => o.id),
          },
        };
        
        itemBody = {
          choiceInteraction: {
            $: {
              responseIdentifier: 'RESPONSE',
              shuffle: question.content.shuffleOptions ? 'true' : 'false',
              maxChoices: question.content.maxCorrectOptions || '0',
            },
            prompt: question.content.prompt,
            simpleChoice: question.content.options.map(option => ({
              $: { identifier: option.id },
              _: option.text,
            })),
          },
        };
        break;
        
      // Add cases for other question types
        
      default:
        itemBody = {
          div: question.content.prompt,
        };
    }
    
    return {
      $: {
        identifier: `item_${question.id}`,
        title: question.title,
        adaptive: 'false',
        timeDependent: 'false',
      },
      responseDeclaration,
      outcomeDeclaration: {
        $: {
          identifier: 'SCORE',
          cardinality: 'single',
          baseType: 'float',
        },
        defaultValue: {
          value: '0',
        },
      },
      itemBody,
    };
  }

  private convertToCsv(questions: Question[]): string {
    // Convert questions to CSV format
    // This is a simplified implementation
    
    // Generate CSV header
    const header = 'id,title,type,description,difficulty,created_at\n';
    
    // Generate rows
    const rows = questions.map(q => {
      return [
        q.id,
        `"${q.title.replace(/"/g, '""')}"`,
        q.type,
        `"${q.description.replace(/"/g, '""')}"`,
        q.difficultyMetrics.currentDifficulty,
        q.createdAt.toISOString(),
      ].join(',');
    }).join('\n');
    
    return header + rows;
  }
}