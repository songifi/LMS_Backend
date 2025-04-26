import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  import { Faculty } from './faculty.entity';
import { User } from 'src/user/entities/user.entity';
  
  export enum AdminRole {
    DEAN = 'dean',
    ASSOCIATE_DEAN = 'associate_dean',
    COORDINATOR = 'coordinator',
    ADMIN_STAFF = 'admin_staff'
  }
  
  @Entity('faculty_administrators')
  export class FacultyAdministrator {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Faculty, faculty => faculty.administrators)
    @JoinColumn({ name: 'faculty_id' })
    faculty: Faculty;
  
    @Column()
    facultyId: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column()
    userId: string;
  
    @Column({
      type: 'enum',
      enum: AdminRole,
      default: AdminRole.ADMIN_STAFF
    })
    role: AdminRole;
  
    @Column({ type: 'json', nullable: true })
    permissions: string[];
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }