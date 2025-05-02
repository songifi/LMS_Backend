import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { MaterialVersion } from './entities/material-version.entity';
import { Course } from './entities/course.entity';
import * as sharp from 'sharp';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
    @InjectRepository(MaterialVersion)
    private versionsRepository: Repository<MaterialVersion>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>
  ) {}
  
  // Get a course with optimized content based on network conditions
  async getCourseContent(courseId: number, options: { 
    connection: 'slow' | 'medium' | 'fast',
    bandwidth: number,
    deviceStorage: number
  }) {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['materials']
    });
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Adapt content based on network conditions
    const adaptedMaterials = await Promise.all(
      course.materials.map(async material => {
        return this.adaptMaterialForNetwork(material, options);
      })
    );
    
    return {
      ...course,
      materials: adaptedMaterials
    };
  }
  
  // Adapt material content based on network conditions
  private async adaptMaterialForNetwork(material: Material, options: {
    connection: 'slow' | 'medium' | 'fast',
    bandwidth: number,
    deviceStorage: number
  }) {
    // Handle different material types differently
    switch (material.type) {
      case 'video':
        return this.adaptVideoMaterial(material, options);
      case 'image':
        return this.adaptImageMaterial(material, options);
      case 'document':
        return this.adaptDocumentMaterial(material, options);
      default:
        // Text and other content types don't need adaptation
        return material;
    }
  }
  
  // Adapt video content for different network conditions
  private async adaptVideoMaterial(material: Material, options: any) {
    // For slow connections, provide a transcript or slides instead of video
    if (options.connection === 'slow' || options.bandwidth < 1) {
      // Find alternative version like transcript
      const transcript = await this.versionsRepository.findOne({
        where: {
          material: { id: material.id },
          type: 'transcript'
        }
      });
      
      if (transcript) {
        return {
          ...material,
          content: transcript.content,
          adaptedType: 'transcript',
          originalType: 'video'
        };
      }
    }
    
    // For medium connections, provide lower quality video
    if (options.connection === 'medium' || (options.bandwidth >= 1 && options.bandwidth < 5)) {
      const lowQualityVersion = await this.versionsRepository.findOne({
        where: {
          material: { id: material.id },
          type: 'video-low'
        }
      });
      
      if (lowQualityVersion) {
        return {
          ...material,
          content: lowQualityVersion.content,
          contentUrl: lowQualityVersion.contentUrl,
          adaptedType: 'video-low',
          originalType: 'video'
        };
      }
    }
    
    // For fast connections, provide full video
    return material;
  }
  
  // Adapt image content for different network conditions
  private async adaptImageMaterial(material: Material, options: any) {
    // For slow connections, provide compressed images
    if (options.connection === 'slow' || options.bandwidth < 1) {
      try {
        // If image URL is available, we'll provide a compressed version
        if (material.contentUrl) {
          return {
            ...material,
            contentUrl: `${material.contentUrl}?quality=50&width=800`,
            adaptedType: 'image-low',
            originalType: 'image'
          };
        }
      } catch (error) {
        // If compression fails, return original
        console.error('Image compression failed', error);
      }
    }
    
    return material;
  }
  
  // Adapt document material for different network conditions
  private async adaptDocumentMaterial(material: Material, options: any) {
    // For low storage devices, provide text-only version of documents
    if (options.deviceStorage < 1000) { // Less than 1GB available
      const textVersion = await this.versionsRepository.findOne({
        where: {
          material: { id: material.id },
          type: 'text-only'
        }
      });
      
      if (textVersion) {
        return {
          ...material,
          content: textVersion.content,
          adaptedType: 'text-only',
          originalType: 'document'
        };
      }
    }
    
    return material;
  }
  
  // Generate optimized versions of content
  async generateOptimizedVersions(materialId: number) {
    const material = await this.materialsRepository.findOne({
      where: { id: materialId }
    });
    
    if (!material) {
      throw new Error('Material not found');
    }
    
    switch (material.type) {
      case 'video':
        await this.generateVideoVersions(material);
        break;
      case 'document':
        await this.generateDocumentVersions(material);
        break;
      // Other types...
    }
    
    return { success: true, message: 'Optimized versions generated' };
  }
  
  // Implementation for video version generation
  private async generateVideoVersions(material: Material) {
    // Implementation details...
  }
  
  // Implementation for document version generation
  private async generateDocumentVersions(material: Material) {
    // Implementation details...
  }
}