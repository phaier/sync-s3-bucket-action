import { getInput, setFailed } from '@actions/core';
import { S3Client } from '@aws-sdk/client-s3';
import { deleteS3Objects, listS3ObjectKeys, uploadS3Object } from './s3';
import { listFiles, readFile } from './fs';

(async () => {
  try {
    const bucketUri = getInput('bucket-uri');
    const src = getInput('src');
    const region = getInput('region');

    const client = new S3Client({ region });

    // Bucket にあるファイルを取得する
    const bucketFiles = await listS3ObjectKeys(client, bucketUri);

    // src にあるファイルを取得する
    const srcFiles = await listFiles(src);

    // Bucket にあるが、src にないものを削除する
    const remove = bucketFiles.filter((old) => !srcFiles.includes(old));
    await deleteS3Objects(client, bucketUri, remove);

    // src にあるファイルを Bucket にアップロードする
    for (const file of srcFiles) {
      const buffer = await readFile(file);
      await uploadS3Object(client, bucketUri, file, buffer);
    }
  } catch (error) {
    setFailed(error as Error);
  }
})();
