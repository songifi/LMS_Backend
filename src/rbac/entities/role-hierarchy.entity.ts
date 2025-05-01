import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
  } from 'typeorm';
  import { Role } from './role.entity';
  
  @Entity('role_hierarchies')
  @Unique(['parentRoleId', 'childRoleId'])
  export class RoleHierarchy {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    parentRoleId: string;
  
    @Column()
    childRoleId: string;
  
    @ManyToOne(() => Role, (role) => role.childRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentRoleId' })
    parentRole: Role;
  
    @ManyToOne(() => Role, (role) => role.parentRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'childRoleId' })
    childRole: Role;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }