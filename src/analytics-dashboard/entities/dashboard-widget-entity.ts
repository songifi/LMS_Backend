import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Dashboard } from './dashboard.entity';
import { Metric } from './metric.entity';

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC = 'metric',
  TEXT = 'text',
  CUSTOM = 'custom'
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap'
}

@Entity('dashboard_widgets')
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ 
    type: 'enum', 
    enum: WidgetType,
    default: WidgetType.CHART
  })
  type: WidgetType;

  @Column({ 
    name: 'chart_type',
    type: 'enum', 
    enum: ChartType,
    nullable: true
  })
  chartType: ChartType;

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>;
  
  @Column({ type: 'jsonb', nullable: true })
  query: Record<string, any>;

  @Column({ name: 'position_x', default: 0 })
  positionX: number;

  @Column({ name: 'position_y', default: 0 })
  positionY: number;

  @Column({ width: 2 })
  width: number;

  @Column({ height: 2 })
  height: number;

  @ManyToOne(() => Dashboard, dashboard => dashboard.widgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dashboard_id' })
  dashboard: Dashboard;
  
  @Column({ name: 'dashboard_id' })
  dashboardId: string;

  @ManyToOne(() => Metric, { nullable: true })
  @JoinColumn({ name: 'metric_id' })
  metric: Metric;
  
  @Column({ name: 'metric_id', nullable: true })
  metricId: string;

  @Column({ name: 'refresh_interval', nullable: true })
  refreshInterval: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
