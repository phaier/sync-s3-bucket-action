import { S3Client, ListObjectsCommand, DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export async function listS3ObjectKeys(client: S3Client, bucketUri: string): Promise<ReadonlyArray<string>> {
  const command = new ListObjectsCommand({
    Bucket: bucketUri,
  });
  const response = await client.send(command);

  const keys: string[] = [];

  for (const object of response.Contents ?? []) {
    if (object.Key) {
      keys.push(object.Key);
    }
  }

  return keys;
}

export async function deleteS3Objects(client: S3Client, bucketUri: string, keys: ReadonlyArray<string>): Promise<void> {
  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucketUri,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    })
  );
}

export async function uploadS3Object(
  client: S3Client,
  bucketUri: string,
  key: string,
  body: Uint8Array
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucketUri,
    Key: key,
    Body: body,
  });

  await client.send(command);
}
