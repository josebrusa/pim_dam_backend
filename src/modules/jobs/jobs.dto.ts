import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  type!: string;
}

export class UpdateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
