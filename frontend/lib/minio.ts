import * as Minio from 'minio';

// MinIOクライアントの設定
export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// バケットが存在するか確認し、存在しなければ作成する関数
export const ensureBucket = async (bucketName: string) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket '${bucketName}' created successfully`);
    }
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
};

// ファイルをアップロードする関数
export const uploadFile = async (
  bucketName: string,
  objectName: string,
  filePath: string,
  metaData?: Minio.ItemBucketMetadata
) => {
  try {
    await ensureBucket(bucketName);
    await minioClient.fPutObject(bucketName, objectName, filePath, metaData || {});
    return true;
  } catch (error) {
    console.error('Error uploading file:', error);
    return false;
  }
};

// ファイルの一時的なURLを取得する関数（例えば7日間有効）
export const getFileUrl = async (bucketName: string, objectName: string, expiresIn = 60 * 60 * 24 * 7) => {
  try {
    return await minioClient.presignedGetObject(bucketName, objectName, expiresIn);
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};