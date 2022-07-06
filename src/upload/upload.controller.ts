import { Controller, Get, Query, Post } from '@nestjs/common';
import { chunkQuery, mergeQuery } from './t';
import { UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}
  @Get('/')
  Init(@Query() query) {
    return { a: 12 };
  }

  @Get('/check/file')
  checkFile(@Query() query) {
    return this.uploadService.checkFile(query);
  }

  @Get('/merge')
  mergeChunk(@Query() query: mergeQuery) {
    return this.uploadService.merge(query);
  }

  @Get('/check/chunk')
  checkChunk(@Query() query: chunkQuery) {
    return this.checkChunk(query);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('data'))
  upload(@UploadedFile() file, @Body() body) {
    return this.uploadService.upload(file, body);
  }
}
