import { Module } from '@nestjs/common';
import { GdsnController } from './gdsn.controller';
import { GdsnService } from './gdsn.service';

@Module({ controllers: [GdsnController], providers: [GdsnService] })
export class GdsnModule {}
