// @ts-check
const core = require('@actions/core');
const { S3Client, ListObjectsCommand, DeleteObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('node:fs/promises');

(async () => {
  try {
    const bucketUri = core.getInput('bucket-uri');
    const src = core.getInput('src');
    const region = core.getInput('region');

    const client = new S3Client({ region });

    const data = await client.send(
      new ListObjectsCommand({
        Bucket: bucketUri,
      })
    );
    const olds = data.Contents.map((object) => object.Key);

    // Bucket にあるが、src にないものを削除する
    const remove = olds.filter((old) => !src.includes(old));
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucketUri,
        Delete: {
          Objects: remove.map((key) => ({ Key: key })),
        },
      })
    );

    // src にあるファイルを Bucket にアップロードする
    const files = await fs.readdir(src, { recursive: true });
    for (const file of files) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketUri,
          Key: file,
          Body: await fs.readFile(file),
        })
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
