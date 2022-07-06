import { Injectable } from '@nestjs/common';
import { readdir, rename, stat } from 'fs/promises';
import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import { createWriteStream, createReadStream } from 'fs';
import {
  checkQueryType,
  chunkQuery,
  mergeQuery,
  Result,
  uploadParams,
} from './t';
const UploadDir = join(process.cwd(), '/static');
@Injectable()
export class UploadService {
  async checkFile(query: checkQueryType) {
    const { fileName, fileMd5Value } = query;
    return await this.getChunkList(
      join(UploadDir, fileName),
      join(UploadDir, fileMd5Value),
    );
  }
  // 确认区块
  async checkChunk(query: chunkQuery): Promise<Result> {
    try {
      const { chunkIndex, md5 } = query;
      const stats = await stat(join(UploadDir, md5, `${chunkIndex}`));
      if (stats) {
        return {
          stat: 1,
          exist: true,
          desc: 'Exit 1',
        };
      }
    } catch {
      return {
        stat: 0,
        exist: false,
        desc: 'Exit 0',
      };
    }
  }
  //  获取区块列表
  private async getChunkList(
    filePath: string,
    folderPath: string,
  ): Promise<Result> {
    let result: Result;
    const isFileExist = await this.isExist(filePath);
    if (isFileExist) {
      result = {
        stat: 1,
        file: {
          isExist: true,
          name: filePath,
        },
        desc: 'file is exist',
      };
    } else {
      const isFolderExist = await this.isExist(folderPath);
      let fileList: string[] = [];
      // 如果文件夹(md5值后的文件)存在, 就获取已经上传的块
      if (isFolderExist) {
        fileList = (await this.listDir(folderPath)) as string[];
      }
      result = {
        stat: 1,
        chunkList: fileList,
        desc: 'folder list',
      };
    }

    return result;
  }
  // 文件是否存在
  private async isExist(filePath: string): Promise<boolean> {
    try {
      const stats = await stat(filePath);
      if (stats) {
        return true;
      }
      return false;
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }
    }
  }
  // 列出文件夹下所有文件
  private async listDir(path: string): Promise<string[]> {
    try {
      const dirArr = await readdir(path);
      if (dirArr && dirArr.length && dirArr[0] === '.DS_Store') {
        dirArr.splice(0, 1);
      }
      return dirArr;
      // NodeJS.ErrnoException;
    } catch (err) {
      return [];
    }
  }
  // 复制文件
  private async copyFile(src: string, dest: string): Promise<boolean> {
    try {
      await rename(src, dest);
      return true;
    } catch {
      return false;
    }
  }
  async upload(file, body: uploadParams) {
    try {
      const { index, total, fileMd5Value } = body;

      const folder = join(UploadDir, fileMd5Value);
      await this.folderIsExist(folder);
      const destFile = join(folder, `${body.index}`);
      const writeStream = createWriteStream(destFile);
      writeStream.write(file.buffer);
      // const res = await this.copyFile(file.data.path, destFile);

      // if (res) {
      return {
        stat: 1,
        desc: index,
      };
      // }
      // return {
      // stat: 0,
      // desc: '修改名称失败',
      // };
    } catch {
      return {
        stat: 0,
        desc: 'Error',
      };
    }
  }

  private async folderIsExist(folder: string) {
    const res = await ensureDirSync(join(folder));
    return true;
  }

  async merge(query: mergeQuery): Promise<Result> {
    try {
      const { md5, size, fileName } = query;
      const srcDir = join(UploadDir, md5);
      return await this.mergeFiles(srcDir, UploadDir, fileName, size);
    } catch {
      return {
        stat: 0,
        desc: 'merge fail',
      };
    }
  }
  //合并文件
  private async mergeFiles(
    srcDir: string,
    targetDir: string,
    newFileName: string,
    size?: number,
  ): Promise<Result> {
    const fileArr = await this.listDir(srcDir);
    if (!fileArr.length) {
      return {
        desc: '区块为空',
        stat: 0,
      };
    }
    const targetStream = createWriteStream(join(targetDir, newFileName), {
      encoding: 'binary',
    });
    fileArr.sort((a, b) => parseInt(a) - parseInt(b));
    for (let i = 0; i < fileArr.length; i++) {
      fileArr[i] = `${srcDir}/${fileArr[i]}`;
      console.log(fileArr[i], 'lujing');

      const readStream = createReadStream(fileArr[i], { encoding: 'binary' });
      readStream.pipe(targetStream);
    }
    return {
      desc: '合并成功',
      stat: 1,
    };
  }
}
