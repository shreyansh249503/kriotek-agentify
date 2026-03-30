import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";

@Entity("bots")
export class Bot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "public_key", unique: true, nullable: true })
  public_key?: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: "friendly" })
  tone!: string;

  @Column({ name: "primary_color", default: "#000000" })
  primary_color!: string;

  @Column({ name: "contact_enabled", default: false })
  contact_enabled!: boolean;

  @Column({ name: "contact_email", nullable: true })
  contact_email!: string;

  @Column({ name: "contact_prompt", nullable: true })
  contact_prompt!: string;

  @Column({ name: "contact_email_message", nullable: true })
  contact_email_message!: string;

  @Column({ name: "user_id" })
  user_id!: string;

  @OneToMany(() => Lead, (lead) => lead.bot)
  leads!: Lead[];

  @OneToMany(() => Conversation, (convo) => convo.bot)
  conversations!: Conversation[];
}

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "bot_id" })
  bot_id!: string;

  @ManyToOne(() => Bot, (bot) => bot.conversations)
  @JoinColumn({ name: "bot_id" })
  bot!: Bot;

  @Column({ default: "idle" })
  state!: string;

  @Column({ name: "message_count", default: 0 })
  message_count!: number;

  @Column({ type: "jsonb", default: "[]" })
  messages!: string;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ default: false })
  declined!: boolean;

  @Column({ default: false })
  prompted!: boolean;
}

@Entity("leads")
export class Lead {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "bot_id" })
  bot_id!: string;

  @ManyToOne(() => Bot, (bot) => bot.leads)
  @JoinColumn({ name: "bot_id" })
  bot!: Bot;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;
}

@Entity("crawled_pages")
export class CrawledPage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "bot_public_key" })
  bot_public_key!: string;

  @Column({ name: "page_url" })
  page_url!: string;
}

@Entity("bot_documents")
export class BotDocument {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "public_key" })
  public_key!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "vector" as any, length: 768, nullable: true, select: false })
  embedding!: string | number[];
}
