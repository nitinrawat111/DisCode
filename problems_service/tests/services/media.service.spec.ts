import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { S3Client } from '@aws-sdk/client-s3';
import { S3_FOLDER_NAME, MAX_MEDIA_SIZE } from '../../src/constants';

use(chaiAsPromised);

describe('MediaService - Unit Tests', () => {
    let sandbox: sinon.SinonSandbox;
    let MediaService: typeof import('../../src/services/media.service').MediaService;
    let createPresignedPostStub: sinon.SinonStub;

    // Setup sandbox and mock module before each test
    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Set environment variables
        process.env.AWS_BUCKET_NAME = 'test-bucket';
        process.env.AWS_REGION = 'us-east-1';
        process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
        process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';

        // Stub createPresignedPost
        createPresignedPostStub = sandbox.stub().resolves({
            url: 'https://test-bucket.s3.amazonaws.com/',
            fields: {
                key: `${S3_FOLDER_NAME}/mock-uuid`,
                AWSAccessKeyId: 'test-access-key',
                Policy: 'mock-policy',
                'X-Amz-Signature': 'mock-signature',
                'Content-Type': 'image/jpeg',
            },
        });

        // Use proxyquire to mock the module
        const mediaServiceModule = proxyquire('../../src/services/media.service', {
            '@aws-sdk/s3-presigned-post': {
                createPresignedPost: createPresignedPostStub,
            },
            'uuid': {
                v4: sandbox.stub().returns('mock-uuid'), // Ensure uuid.v4 returns 'mock-uuid'
            },
        });

        MediaService = mediaServiceModule.MediaService;
    });

    // Clean up after each test
    afterEach(() => {
        sandbox.restore();
        delete process.env.AWS_BUCKET_NAME;
        delete process.env.AWS_REGION;
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;
    });

    describe('constructor', () => {
        it('should throw error if AWS_BUCKET_NAME is missing', () => {
            delete process.env.AWS_BUCKET_NAME;
            expect(() => new MediaService()).to.throw('AWS_BUCKET_NAME is not defined');
        });

        it('should throw error if AWS_REGION is missing', () => {
            delete process.env.AWS_REGION;
            expect(() => new MediaService()).to.throw('AWS_REGION is not defined');
        });

        it('should throw error if AWS_ACCESS_KEY_ID is missing', () => {
            delete process.env.AWS_ACCESS_KEY_ID;
            expect(() => new MediaService()).to.throw('AWS_ACCESS_KEY_ID is not defined');
        });

        it('should throw error if AWS_SECRET_ACCESS_KEY is missing', () => {
            delete process.env.AWS_SECRET_ACCESS_KEY;
            expect(() => new MediaService()).to.throw('AWS_SECRET_ACCESS_KEY is not defined');
        });

        it('should initialize successfully with all env vars present', () => {
            const service = new MediaService();
            expect(service).to.be.instanceOf(MediaService);
            expect((service as any).bucketName).to.equal('test-bucket');
            expect((service as any).s3Client).to.be.instanceOf(S3Client);
        });
    });

    describe('getSignedUploadUrl', () => {
        let mediaService: InstanceType<typeof MediaService>;

        beforeEach(() => {
            mediaService = new MediaService();
        });

        it('should generate a pre-signed POST URL successfully', async () => {
            const contentType = 'image/jpeg';
            const result = await mediaService.getSignedUploadUrl(contentType);

            expect(result.url).to.equal('https://test-bucket.s3.amazonaws.com/');
            expect(result.fields.key).to.equal(`${S3_FOLDER_NAME}/mock-uuid`);
            expect(result.fields['Content-Type']).to.equal('image/jpeg');
            expect(createPresignedPostStub.calledOnce).to.be.true;

            const args = createPresignedPostStub.firstCall.args[1];
            expect(args).to.deep.include({
                Bucket: 'test-bucket',
                Key: result.fields.key,
                Conditions: [
                    ['content-length-range', 1, MAX_MEDIA_SIZE],
                    ['eq', '$Content-Type', 'image/jpeg'],
                ],
                Fields: { 'Content-Type': 'image/jpeg' },
                Expires: 3600,
            });
        });

        it('should throw error for invalid contentType', async () => {
            const invalidContentType = 'text/plain';
            // Using any to allow invalid contentType
            await expect(mediaService.getSignedUploadUrl(invalidContentType as any))
                .to.be.rejectedWith('Content type must be one of: image/jpeg, image/png, image/gif, image/webp');
        });

        it('should throw error if createPresignedPost fails', async () => {
            createPresignedPostStub.rejects(new Error('S3 error'));
            await expect(mediaService.getSignedUploadUrl('image/jpeg'))
                .to.be.rejectedWith(Error, 'S3 error');
        });
    });
});