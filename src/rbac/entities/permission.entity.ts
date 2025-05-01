import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { RolePermission } from './role-permission.entity';
  
  @Entity('permissions')
  export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    key: string;
  
    @Column()
    name: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column({ type: 'json', nullable: true })
    attributes: Record<string, any>;
  
    @Column({ nullable: true })
    resource: string;
  
    @Column({ nullable: true })
    action: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @OneToMany(
      () => RolePermission,
      (rolePermission) => rolePermission.permission,
    )
    rolePermissions: RolePermission[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }