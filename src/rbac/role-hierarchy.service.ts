import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleHierarchy } from '../entities/role-hierarchy.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleHierarchyService {
  constructor(
    @InjectRepository(RoleHierarchy)
    private roleHierarchyRepository: Repository<RoleHierarchy>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(data: {
    parentRoleId: string;
    childRoleId: string;
  }): Promise<RoleHierarchy> {
    const { parentRoleId, childRoleId } = data;

    // Check if roles exist
    const [parentRole, childRole] = await Promise.all([
      this.roleRepository.findOne({ where: { id: parentRoleId } }),
      this.roleRepository.findOne({ where: { id: childRoleId } }),
    ]);

    if (!parentRole) {
      throw new BadRequestException(`Parent role with ID ${parentRoleId} not found`);
    }

    if (!childRole) {
      throw new BadRequestException(`Child role with ID ${childRoleId} not found`);
    }

    // Check if the relation already exists
    const existing = await this.roleHierarchyRepository.findOne({
      where: { parentRoleId, childRoleId },
    });

    if (existing) {
      throw new BadRequestException(
        `Hierarchy relation already exists between parent ${parentRoleId} and child ${childRoleId}`,
      );
    }

    const hierarchy = this.roleHierarchyRepository.create({
      parentRoleId,
      childRoleId,
    });

    return this.roleHierarchyRepository.save(hierarchy);
  }

  async findByRoleId(roleId: string): Promise<RoleHierarchy[]> {
    return this.roleHierarchyRepository.find({
      where: [{ parentRoleId: roleId }, { childRoleId: roleId }],
      relations: ['parentRole', 'childRole'],
    });
  }

  async getCompleteHierarchy(): Promise<any> {
    const hierarchies = await this.roleHierarchyRepository.find({
      relations: ['parentRole', 'childRole'],
    });

    const roles = await this.roleRepository.find();
    
    // Create a hierarchy tree
    const result = {
      nodes: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
      })),
      edges: hierarchies.map(h => ({
        source: h.parentRoleId,
        target: h.childRoleId,
      })),
    };

    return result;
  }

  async removeRelation(parentId: string, childId: string): Promise<void> {
    const relation = await this.roleHierarchyRepository.findOne({
      where: { parentRoleId: parentId, childRoleId: childId },
    });

    if (!relation) {
      throw new BadRequestException(
        `No hierarchy relation found between parent ${parentId} and child ${childId}`,
      );
    }

    await this.roleHierarchyRepository.remove(relation);
  }

  async wouldCreateCircularDependency(
    parentId: string,
    childId: string,
  ): Promise<boolean> {
    // If parent and child are the same, it's a circular dependency
    if (parentId === childId) {
      return true;
    }

    // Check if the child is already an ancestor of the parent (which would create a cycle)
    const visited = new Set<string>();
    const stack: string[] = [parentId];

    while (stack.length) {
      const currentId = stack.pop();
      visited.add(currentId);

      // Get all parents of the current role
      const parents = await this.roleHierarchyRepository.find({
        where: { childRoleId: currentId },
      });

      for (const parent of parents) {
        // If we find the child as a parent, we have a cycle
        if (parent.parentRoleId === childId) {
          return true;
        }

        // If we haven't visited this parent yet, add to stack
        if (!visited.has(parent.parentRoleId)) {
          stack.push(parent.parentRoleId);
        }
      }
    }

    return false;
  }

  async getAllUserRoleIds(directRoleIds: string[]): Promise<string[]> {
    if (!directRoleIds.length) {
      return [];
    }

    const result = new Set<string>(directRoleIds);
    const queue = [...directRoleIds];

    while (queue.length > 0) {
      const currentRoleId = queue.shift();
      
      // Find all parent roles (roles that the current role inherits from)
      const parentRelations = await this.roleHierarchyRepository.find({
        where: { childRoleId: currentRoleId },
      });

      for (const relation of parentRelations) {
        if (!result.has(relation.parentRoleId)) {
          result.add(relation.parentRoleId);
          queue.push(relation.parentRoleId);
        }
      }
    }

    return Array.from(result);
  }
}