import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMappingRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  sourceField!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  targetField!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transform?: string;
}

export class UpdateMappingRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  sourceField?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  targetField?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transform?: string;
}

export class TestMappingDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  sourceField!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  targetField!: string;

  @ApiProperty()
  @IsString()
  value!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transform?: string;
}
