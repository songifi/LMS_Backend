import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, PrivacyLevel } from '../entities/student.entity';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class PrivacyService implements CanActivate {
  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params, query } = request;
    
    // No user means no access to protected resources
    if (!user) {
      return false;
    }
    
    // Admins have full access
    if (user.roles.includes(UserRole.ADMIN)) {
      return true;
    }
    
    // Check if trying to access student data
    if (params.studentId || query.studentId) {
      const studentId = params.studentId || query.studentId;
      const dataType = query.dataType || 'default';
      
      return this.canAccessStudentData(user.id, studentId, dataType);
    }
    
    // Default access control
    return true;
  }

  async canAccessStudentData(
    userId: string,
    studentId: string,
    dataType: string = 'default'
  ): Promise<boolean> {
    // Get user and student
    const [user, student] = await Promise.all([
      this.userModel.findById(userId).exec(),
      this.studentModel.findById(studentId).exec(),
    ]);
    
    if (!user || !student) {
      return false;
    }
    
    // Get privacy level for the data type
    const privacyLevel = student.privacySettings[dataType] || PrivacyLevel.SENSITIVE;
    
    // Check permissions based on role and privacy level
    switch (privacyLevel) {
      case PrivacyLevel.PUBLIC:
        // All authenticated users can access public data
        return true;
        
      case PrivacyLevel.SENSITIVE:
        // Teachers can access sensitive data for their classes
        if (user.roles.includes(UserRole.TEACHER)) {
          return user.classGroups.includes(student.classGroup);
        }
        
        // Counselors, principals, and case managers can access all sensitive data
        return user.roles.some(role => 
          [UserRole.COUNSELOR, UserRole.PRINCIPAL, UserRole.CASE_MANAGER].includes(role));
        
      case PrivacyLevel.RESTRICTED:
        // Only specific roles with special permissions can access restricted data
        if (user.permissions?.viewRestrictedData) {
          return true;
        }
        
        // Case managers assigned to the student can access restricted data
        if (user.roles.includes(UserRole.CASE_MANAGER)) {
          const assignedCase = await this.isUserAssignedToStudent(userId, studentId);
          return assignedCase;
        }
        
        // Data analysts need specific permission
        if (user.roles.includes(UserRole.DATA_ANALYST)) {
          return user.permissions?.viewRestrictedData || false;
        }
        
        return false;
        
      default:
        return false;
    }
  }

  async isUserAssignedToStudent(userId: string, studentId: string): Promise<boolean> {
    // Check if user is assigned to any of the student's cases
    const student = await this.studentModel
      .findById(studentId)
      .populate('cases')
      .exec();
    
    if (!student || !student.cases?.length) {
      return false;
    }
    
    return student.cases.some(c => c.assignedTo?.toString() === userId);
  }

  async applyPrivacyFilters(data: any, user: User, dataType: string): Promise<any> {
    if (!data) {
      return data;
    }
    
    // Handle arrays recursively
    if (Array.isArray(data)) {
      const filteredArray = [];
      for (const item of data) {
        // Skip items user doesn't have access to
        if (item.studentId) {
          const canAccess = await this.canAccessStudentData(user._id, item.studentId, dataType);
          if (!canAccess) continue;
        }
        
        // Apply filters to accessible items
        filteredArray.push(await this.applyPrivacyFilters(item, user, dataType));
      }
      return filteredArray;
    }
    
    // Handle single student object
    if (data.studentId) {
      const canAccess = await this.canAccessStudentData(user._id, data.studentId, dataType);
      if (!canAccess) {
        throw new ForbiddenException('You do not have access to this student data');
      }
      
      // Filter fields based on privacy settings
      const student = await this.studentModel.findById(data.studentId).exec();
      if (!student) {
        return data;
      }
      
      const result = { ...data };
      
      // Apply field-level privacy
      for (const [field, level] of Object.entries(student.privacySettings)) {
        if (level === PrivacyLevel.RESTRICTED) {
          // Only show restricted fields to authorized users
          if (!user.permissions?.viewRestrictedData && 
              !user.roles.includes(UserRole.ADMIN)) {
            delete result[field];
          }
        }
      }
      
      return result;
    }
    
    // Return unmodified data for non-student objects
    return data;
  }

  getEthicalGuidelines(): Record<string, any> {
    // Return ethical guidelines for the system
    return {
      dataCollection: [
        'Only collect data necessary for educational support purposes',
        'Inform students and parents about data collection',
        'Allow students/parents to opt out of non-essential data collection',
      ],
      dataAccess: [
        'Limit access to sensitive data to roles with legitimate need',
        'Maintain audit logs of all data access',
        'Regularly review access patterns for unusual activity',
      ],
      interventions: [
        'Focus on student support rather than punishment',
        'Ensure interventions are evidence-based',
        'Consider cultural context in intervention selection',
        'Obtain consent for intensive interventions',
      ],
      decisionMaking: [
        'Automated systems should support, not replace, human judgment',
        'Be transparent about how risk scores are calculated',
        'Provide opportunity to challenge or correct inaccurate data',
        'Regularly review algorithmic fairness across demographic groups',
      ],
      dataRetention: [
        'Define clear timelines for data retention',
        'Purge non-essential data when no longer needed',
        'Anonymize data used for research purposes',
      ],
    };
  }
}