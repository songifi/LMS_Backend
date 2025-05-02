export interface DataEntityMetadata {
    entityName: string;
    tableName: string;
    description: string;
    dataOwner: string; // Department or person responsible
    containsPersonalData: boolean;
    fields: DataFieldMetadata[];
    relationships?: Array<{
      relatedEntity: string;
      type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
      description: string;
    }>;
  }