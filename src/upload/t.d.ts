export interface checkQueryType {
  fileName: string;
  fileMd5Value: stirng;
}
export interface Result {
  stat: number;
  exist?: boolean;
  file?: {
    isExist: boolean;
    name: string;
  };
  chunkList?: string[];
  desc: string;
}
export interface mergeQuery {
  md5: string;
  size: number;
  fileName: string;
}

export interface chunkQuery {
  chunkIndex: number;
  md5: string;
}
export interface uploadParams {
  index: number;
  total: number;
  fileMd5Value: string;
}
