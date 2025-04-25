import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  import { Faculty } from './faculty.entity';
  
  @Entity('faculty_settings')
  export class FacultySettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @OneToOne(() => Faculty, faculty => faculty.settings)
    @JoinColumn({ name: 'faculty_id' })
    faculty: Faculty;
  
    @Column()
    facultyId: number;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column({ type: 'json', default: '{}' })
    themePreferences: Record<string, any>;
  
    @Column({ type: 'json', default: '{}' })
    notificationSettings: Record<string, any>;
  
    @Column({ type: 'json', default: '{}' })
    accessibilitySettings: Record<string, any>;
    
    @Column({ type: 'json', default: '[]' })
    customFields: any[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }