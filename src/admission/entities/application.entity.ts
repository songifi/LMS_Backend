import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Application {
  @PrimaryGeneratedColumn() id: number;

  @Column() applicantName: string;
  @Column() email: string;
  @Column({ default: 'submitted' }) status: string;

  @ManyToOne(() => ApplicationForm, (form) => form.applications)
  form: ApplicationForm;

  @OneToMany(() => ApplicationDocument, (doc) => doc.application)
  documents: ApplicationDocument[];

  @OneToMany(() => ApplicationReview, (review) => review.application)
  reviews: ApplicationReview[];

  @CreateDateColumn() createdAt: Date;
}
