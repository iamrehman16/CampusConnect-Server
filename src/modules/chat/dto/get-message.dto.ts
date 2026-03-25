import { IsMongoId } from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class GetMessagesDto extends BaseQueryDto {
  @IsMongoId()
  conversationId: string;
}