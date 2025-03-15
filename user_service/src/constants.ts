export const SERVICE_NAME = 'user-service';
export const BCRYPT_SALT_ROUNDS = 10;
// In milliseconds, cause both res.cookie and jwt.sign can accepts milliseconds
export const ACCESS_TOKEN_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000;
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false
}
export const S3_FOLDER_NAME = "users";
export const MAX_MEDIA_SIZE = 5 * 1024 * 1024; // 5MB 