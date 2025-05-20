import { ensureBucket } from '../lib/minio';

// アプリ起動時にMinIOバケットを初期化
const initializeMinio = async () => {
  const bucketName = process.env.MINIO_BUCKET_NAME || 'mybucket';
  
  try {
    await ensureBucket(bucketName);
    console.log(`MinIO bucket '${bucketName}' initialized successfully`);
  } catch (error) {
    console.error('Failed to initialize MinIO bucket:', error);
  }
};

// スクリプトを直接実行した場合に初期化を実行
if (require.main === module) {
  initializeMinio()
    .then(() => console.log('MinIO initialization completed'))
    .catch(console.error);
}

export default initializeMinio;