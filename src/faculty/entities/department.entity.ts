import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany
  } from 'typeorm';
  import { Faculty } from './faculty.entity';
import { User } from 'src/user/entities/user.entity';
  
  @Entity('departments')
  export class Department {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;
  
    @Column({ unique: true })
    code: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @ManyToOne(() => Faculty, faculty => faculty.departments)
    @JoinColumn({ name: 'faculty_id' })
    faculty: Faculty;
  
    @Column()
    facultyId: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'department_head_id' })
    departmentHead: User;
  
    @Column({ nullable: true })
    departmentHeadId: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }