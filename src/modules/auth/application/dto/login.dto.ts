import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@lumify.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'lumify2025' })
  @IsString()
  @MinLength(6)
  password!: string;
}
