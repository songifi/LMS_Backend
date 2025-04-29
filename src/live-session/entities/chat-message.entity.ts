import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { LiveChat } from "./live-chat.entity"

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique identifier for the chat message" })
  id: string

  @ManyToOne(
    () => LiveChat,
    (liveChat) => liveChat.messages,
  )
  @JoinColumn({ name: "live_chat_id" })
  liveChat: LiveChat

  @Column({ type: "uuid" })
  live_chat_id: string

  @Column({ type: "uuid" })
  @ApiProperty({ description: "ID of the sender" })
  senderId: string

  @Column()
  @ApiProperty({ description: "Name of the sender" })
  senderName: string

  @Column({ type: "text" })
  @ApiProperty({ description: "Content of the message" })
  content: string

  @Column({ default: false })
  @ApiProperty({ description: "Whether the message is from the host", default: false })
  isFromHost: boolean

  @Column({ default: false })
  @ApiProperty({ description: "Whether the message is pinned", default: false })
  isPinned: boolean

  @Column({ nullable: true })
  @ApiProperty({ description: "ID of the message this is replying to", required: false })
  replyToId?: string

  @CreateDateColumn()
  @ApiProperty({ description: "When the message was sent" })
  sentAt: Date
}
