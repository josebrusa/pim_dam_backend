import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateGdsnPublicationDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  gtin!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  productName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  dataPool!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  recipient!: string;
}
