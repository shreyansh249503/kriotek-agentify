import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ColumnType,
} from "typeorm";
import { Product } from "../../../types/bot";

@Entity("bots")
export class Bot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", name: "public_key", unique: true, nullable: true })
  public_key?: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  description!: string;

  @Column({ type: "varchar", default: "friendly" })
  tone!: string;

  @Column({ type: "varchar", name: "primary_color", default: "#000000" })
  primary_color!: string;

  @Column({ type: "boolean", name: "contact_enabled", default: false })
  contact_enabled!: boolean;

  @Column({ type: "varchar", name: "contact_email", nullable: true })
  contact_email!: string;

  @Column({ type: "varchar", name: "contact_prompt", nullable: true })
  contact_prompt!: string;

  @Column({ type: "varchar", name: "contact_email_message", nullable: true })
  contact_email_message!: string;

  @Column({ type: "varchar", name: "user_id" })
  user_id!: string;

  @Column({ type: "varchar", name: "logo_url", nullable: true })
  logo_url!: string;

  @Column({ type: "boolean", name: "ecommerce_enabled", default: false })
  ecommerce_enabled!: boolean;

  @Column({ type: "varchar", name: "ecommerce_prompt", nullable: true })
  ecommerce_prompt!: string;

  @Column({ type: "jsonb", nullable: true, name: "ecommerce_products" })
  ecommerce_products!: Product[];

  @OneToMany(() => Lead, (lead) => lead.bot)
  leads!: Lead[];

  @OneToMany(() => Conversation, (convo) => convo.bot)
  conversations!: Conversation[];

  @OneToMany(() => ShopifyStore, (store) => store.bot)
  shopify_stores!: ShopifyStore[];
}

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "bot_id", type: "uuid", nullable: true })
  bot_id!: string;

  @ManyToOne(() => Bot, (bot) => bot.conversations)
  @JoinColumn({ name: "bot_id" })
  bot!: Bot;

  @Column({ type: "varchar", default: "idle" })
  state!: string;

  @Column({ type: "int", name: "message_count", default: 0 })
  message_count!: number;

  @Column({ type: "jsonb", default: "[]" })
  messages!: string;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @Column({ type: "varchar", nullable: true })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  phone!: string;

  @Column({ type: "boolean", default: false })
  declined!: boolean;

  @Column({ type: "boolean", default: false })
  prompted!: boolean;
}

@Entity("leads")
export class Lead {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "bot_id", type: "uuid", nullable: true })
  bot_id!: string;

  @ManyToOne(() => Bot, (bot) => bot.leads)
  @JoinColumn({ name: "bot_id" })
  bot!: Bot;

  @Column({ type: "varchar", nullable: true })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  phone!: string;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;
}

@Entity("crawled_pages")
export class CrawledPage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", name: "bot_public_key" })
  bot_public_key!: string;

  @Column({ type: "varchar", name: "page_url" })
  page_url!: string;
}

@Entity("bot_documents")
export class BotDocument {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", name: "public_key" })
  public_key!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "vector" as unknown as ColumnType, length: 768, nullable: true, select: false })
  embedding!: string | number[];
}

@Entity("shopify_stores")
export class ShopifyStore {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  shop!: string;

  @Column({ type: "varchar", name: "access_token" })
  access_token!: string;

  @Column({ name: "bot_id", type: "uuid", nullable: true })
  bot_id!: string | null;

  @ManyToOne(() => Bot, (bot) => bot.shopify_stores, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "bot_id" })
  bot!: Bot | null;

  @Column({ type: "varchar", nullable: true })
  scopes!: string;

  @CreateDateColumn({ name: "installed_at" })
  installed_at!: Date;
}
