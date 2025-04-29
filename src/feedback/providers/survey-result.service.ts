import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { SurveyResult } from '../entities/survey-result.entity';
  import { Survey } from '../entities/survey.entity';
  import { Response } from '../entities/response.entity';
  import { Question } from '../entities/question.entity';
  import { QuestionType } from '../enums/question-type.enum';
  import { ResponseService } from './response.service';
  
  @Injectable()
  export class SurveyResultService {
    constructor(
      @InjectRepository(SurveyResult)
      private surveyResultRepository: Repository<SurveyResult>,
      @InjectRepository(Survey)
      private surveyRepository: Repository<Survey>,
      @InjectRepository(Question)
      private questionRepository: Repository<Question>,
      private responseService: ResponseService,
    ) {}
  
    async generateResults(surveyId: string): Promise<SurveyResult> {
      const survey = await this.surveyRepository.findOne({
        where: { id: surveyId },
        relations: ['questions', 'questions.options'],
      });
  
      if (!survey) {
        throw new NotFoundException(`Survey with ID "${surveyId}" not found`);
      }
  
      const responses = await this.responseService.getResponsesForSurvey(surveyId);
  
      if (responses.length === 0) {
        throw new NotFoundException(`No responses found for survey with ID "${surveyId}"`);
      }
  
      const resultData = this.processResponses(survey.questions, responses);
  
      let surveyResult = await this.surveyResultRepository.findOneBy({ surveyId });
  
      if (surveyResult) {
        surveyResult.data = resultData;
        surveyResult.responseCount = responses.length;
      } else {
        surveyResult = this.surveyResultRepository.create({
          survey,
          data: resultData,
          responseCount: responses.length,
        });
      }
  
      return this.surveyResultRepository.save(surveyResult);
    }
  
    async getSurveyResults(surveyId: string): Promise<SurveyResult> {
      const result = await this.surveyResultRepository.findOneBy({ surveyId });
  
      if (!result) {
        return this.generateResults(surveyId);
      }
  
      return result;
    }
  
    private processResponses(questions: Question[], responses: Response[]): Record<string, any> {
      const results: Record<string, any> = {};
  
      for (const question of questions) {
        const questionId = question.id;
        const answers = responses
          .map(response => response.data[questionId])
          .filter(answer => answer !== undefined);
  
        if (answers.length === 0) {
          continue;
        }
  
        switch (question.type) {
          case QuestionType.TEXT:
            results[questionId] = {
              type: question.type,
              text: question.text,
              answers,
            };
            break;
  
          case QuestionType.RATING:
          case QuestionType.SCALE:
            const numericAnswers = answers.map(Number).filter(a => !isNaN(a));
            results[questionId] = {
              type: question.type,
              text: question.text,
              average: this.calculateAverage(numericAnswers),
              min: Math.min(...numericAnswers),
              max: Math.max(...numericAnswers),
              distribution: this.calculateDistribution(numericAnswers, question.minValue, question.maxValue),
            };
            break;
  
          case QuestionType.SINGLE_CHOICE:
          case QuestionType.MULTIPLE_CHOICE:
          case QuestionType.LIKERT:
            const optionCounts = this.countOptions(answers, question);
            results[questionId] = {
              type: question.type,
              text: question.text,
              optionCounts,
              percentages: this.calculatePercentages(optionCounts, answers.length),
            };
            break;
        }
      }
  
      return results;
    }
  
    private calculateAverage(values: number[]): number {
      if (values.length === 0) return 0;
      const sum = values.reduce((acc, val) => acc + val, 0);
      return parseFloat((sum / values.length).toFixed(2));
    }
  
    private calculateDistribution(values: number[], min: number, max: number): Record<number, number> {
      const distribution: Record<number, number> = {};
      for (let i = min; i <= max; i++) {
        distribution[i] = 0;
      }
      for (const value of values) {
        if (value >= min && value <= max) {
          distribution[value]++;
        }
      }
      return distribution;
    }
  
    private countOptions(answers: any[], question: Question): Record<string, number> {
      const optionCounts: Record<string, number> = {};
      question.options.forEach(option => {
        optionCounts[option.id] = 0;
      });
  
      for (const answer of answers) {
        if (Array.isArray(answer)) {
          for (const option of answer) {
            if (optionCounts[option] !== undefined) {
              optionCounts[option]++;
            }
          }
        } else {
          if (optionCounts[answer] !== undefined) {
            optionCounts[answer]++;
          }
        }
      }
  
      return optionCounts;
    }
  
    private calculatePercentages(counts: Record<string, number>, total: number): Record<string, number> {
      const percentages: Record<string, number> = {};
      for (const [key, count] of Object.entries(counts)) {
        percentages[key] = parseFloat(((count / total) * 100).toFixed(2));
      }
      return percentages;
    }
  
    async compareResults(surveyIds: string[]): Promise<Record<string, any>> {
      if (surveyIds.length < 2) {
        throw new BadRequestException('At least two surveys are required for comparison');
      }
  
      const comparisonResults: Record<string, any> = {
        surveys: {},
        questions: {},
      };
  
      const resultsPromises = surveyIds.map(id => this.getSurveyResults(id));
      const results = await Promise.all(resultsPromises);
  
      const surveysPromises = surveyIds.map(id => this.surveyRepository.findOneBy({ id }));
      const surveys = await Promise.all(surveysPromises);
  
      for (let i = 0; i < surveys.length; i++) {
        const survey = surveys[i];
      
        if (!survey) {
          throw new NotFoundException(`Survey with ID "${surveyIds[i]}" not found`);
        }
      
        comparisonResults.surveys[surveyIds[i]] = {
          title: survey.title,
          responseCount: results[i].responseCount,
        };
      }
      
  
      const questionTexts = new Set<string>();
      const questionMap: Record<string, Record<string, string>> = {};
  
      for (let i = 0; i < surveys.length; i++) {
        const survey = await this.surveyRepository.findOne({
          where: { id: surveyIds[i] },
          relations: ['questions'],
        });
  
        if (!survey) {
          throw new NotFoundException(`Survey with ID "${surveyIds[i]}" not found`);
        }
  
        for (const question of survey.questions) {
          questionTexts.add(question.text);
          if (!questionMap[question.text]) {
            questionMap[question.text] = {};
          }
          questionMap[question.text][surveyIds[i]] = question.id;
        }
      }
  
      for (const questionText of questionTexts) {
        const questionIds = questionMap[questionText];
        const surveysWithQuestion = Object.keys(questionIds);
  
        if (surveysWithQuestion.length < 2) {
          continue;
        }
  
        comparisonResults.questions[questionText] = {};
  
        for (const surveyId of surveysWithQuestion) {
          const questionId = questionIds[surveyId];
          const surveyResult = results.find(r => r.surveyId === surveyId);
  
          if (surveyResult?.data[questionId]) {
            comparisonResults.questions[questionText][surveyId] = surveyResult.data[questionId];
          }
        }
      }
  
      return comparisonResults;
    }
  }
  