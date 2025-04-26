import { User } from 'src/user/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne
  } from 'typeorm';
import { Department } from './department.entity';
import { FacultySettings } from './faculty-settings.entity';
import { FacultyAdministrator } from './faculty-administrator.entity';
  
  @Entity('faculties')
  export class Faculty {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;
  
    @Column({ unique: true })
    code: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ nullable: true })
    logoUrl: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'faculty_head_id' })
    facultyHead: User;
  
    @Column({ nullable: true })
    facultyHeadId: string;
  
    @OneToMany(() => Department, department => department.faculty)
    departments: Department[];
  
    @OneToOne(() => FacultySettings, settings => settings.faculty)
    settings: FacultySettings;
  
    @OneToMany(() => FacultyAdministrator, admin => admin.faculty)
    administrators: FacultyAdministrator[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }