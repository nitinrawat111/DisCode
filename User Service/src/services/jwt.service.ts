import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ACCESS_TOKEN_EXPIRATION_TIME } from '../constants.js';
import ApiError from '../utils/ApiError.js';

const jwtService = {
    privateKey: crypto.createPrivateKey(process.env.RSA_PRIVATE_KEY as string),
    publicKey: crypto.createPublicKey(process.env.RSA_PUBLIC_KEY as string),

    getAccessToken: function(payload: UserJWTPayload) {
        const accessToken = jwt.sign(
            payload,
            this.privateKey, 
            { 
                algorithm: 'RS256',
                expiresIn: ACCESS_TOKEN_EXPIRATION_TIME 
            }
        );
        return accessToken;
    },

    getPublicKey: function() {
        return this.publicKey;
    },

    verifyAccessToken: function(accessToken: string) {
        try{
            const payload = jwt.verify(accessToken, this.publicKey, { algorithms: ['RS256'] });
            return payload as UserJWTPayload;
        } catch (err) {
            throw new ApiError(401, "Unauthorized");
        }
    }
}

export default jwtService;