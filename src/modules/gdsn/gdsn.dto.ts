import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

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

export class UpdateGdsnPublicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  gtin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  productName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  dataPool?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  recipient?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
