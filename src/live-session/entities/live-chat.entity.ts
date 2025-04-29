import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { ChatMessage } from "./chat-message.entity"

@Entity("live_chats")
export class LiveChat {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique identifier for the live chat" })
  id: string

  @Column({ type: "uuid" })
  @ApiProperty({ description: "ID of the associated live session" })
  liveSessionId: string

  @Column({ default: true })
  @ApiProperty({ description: "Whether the chat is enabled", default: true })
  isEnabled: boolean

  @Column({ default: false })
  @ApiProperty({ description: "Whether the chat is moderated", default: false })
  isModerated: boolean

  @OneToMany(
    () => ChatMessage,
    (message) => message.liveChat,
  )
  @ApiProperty({ type: () => [ChatMessage] })
  messages: ChatMessage[]

  @CreateDateColumn()
  @ApiProperty({ description: "When the record was created" })
  createdAt: Date

  @UpdateDateColumn()
  @ApiProperty({ description: "When the record was last updated" })
  updatedAt: Date
}
