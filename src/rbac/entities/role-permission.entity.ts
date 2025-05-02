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
  import { Permission } from './permission.entity';
  
  @Entity('role_permissions')
  @Unique(['roleId', 'permissionId'])
  export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    roleId: string;
  
    @Column()
    permissionId: string;
  
    @Column({ type: 'json', nullable: true })
    attributes: Record<string, any>;
  
    @ManyToOne(() => Role, (role) => role.rolePermissions, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'roleId' })
    role: Role;
  
    @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'permissionId' })
    permission: Permission;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }