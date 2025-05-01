import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { RolePermission } from './role-permission.entity';
  import { RoleHierarchy } from './role-hierarchy.entity';
  
  @Entity('roles')
  export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    name: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;
  
    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
    rolePermissions: RolePermission[];
  
    @OneToMany(
      () => RoleHierarchy,
      (roleHierarchy) => roleHierarchy.parentRole,
    )
    childRoles: RoleHierarchy[];
  
    @OneToMany(
      () => RoleHierarchy,
      (roleHierarchy) => roleHierarchy.childRole,
    )
    parentRoles: RoleHierarchy[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }