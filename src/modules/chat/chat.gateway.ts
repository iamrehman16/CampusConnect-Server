import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { WsJwtGuard } from './guards/websocket.jwt.guard';
import { WsExceptionFilter } from './filters/websocket-exception.filter';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly wsJwtGuard: WsJwtGuard,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const user = await this.wsJwtGuard.validateSocket(socket);
      socket.data.userId = user.id;
      this.connectedUsers.set(user.id, socket.id);
      console.log(`User ${user.id} connected - socket ${socket.id}`);
    } catch (error) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() conversationId: string,
  ) {
    socket.join(conversationId);
    return { event: 'joined', data: conversationId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: CreateMessageDto,
  ) {
    const senderId = socket.data.userId;

    const message = await this.chatService.createMessage(dto, senderId);

    this.server.to(dto.conversationId).emit('new_message', message);

    const receiverId = await this.chatService.getReceiverIdFromConversation(
      dto.conversationId,
      senderId,
    );

    const receiverSocketId = this.connectedUsers.get(receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('new_message', message);
    }

    return message;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark_seen')
  async handleMarkSeen(
    @ConnectedSocket() socket: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = socket.data.userId;

    await this.chatService.markSeen(conversationId, userId);

    this.server.to(conversationId).emit('messages_seen', {
      conversationId,
      seenBy: userId,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: DeleteMessageDto,
  ) {
    const userId = socket.data.userId;

    const message = await this.chatService.deleteMessage(
      dto.messageId,
      dto.conversationId,
      userId,
    );

    this.server.to(dto.conversationId).emit('message_deleted', {
      messageId: dto.messageId,
      conversationId: dto.conversationId,
    });

    return message;
  }
}
