import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as pg from 'pg';
import * as sinon from 'sinon';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../src/services/user.service';
import { dbPool } from '../../src/config/db';
import ApiError from '../../src/utils/ApiError';
import { BCRYPT_SALT_ROUNDS } from '../../src/constants';
import { UserRoleEnum } from '../../src/dtos/users.dto';

// Enable chai-as-promised for async assertions
use(chaiAsPromised);

describe('UserService - Unit Tests', () => {
    let userService: UserService;
    let dbPoolQueryStub: sinon.SinonStub;
    let bcryptHashStub: sinon.SinonStub;
    let bcryptCompareStub: sinon.SinonStub;

    beforeEach(() => {
        userService = new UserService();
        dbPoolQueryStub = sinon.stub(dbPool, 'query');
        bcryptHashStub = sinon.stub(bcrypt, 'hash');
        bcryptCompareStub = sinon.stub(bcrypt, 'compare');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('register', () => {
        const validUser = {
            username: 'john_doe',
            email: 'john@example.com',
            password: 'password123',
            bio: 'Hello world',
            avatarUrl: 'https://example.com/avatar.jpg',
        };

        it('should successfully register a new user', async () => {
            bcryptHashStub.resolves('hashed_password');
            dbPoolQueryStub.resolves({ rows: [] });

            await expect(userService.register(validUser)).to.eventually.be.fulfilled;
            expect(bcryptHashStub.calledWith('password123', BCRYPT_SALT_ROUNDS)).to.be.true;
            expect(dbPoolQueryStub.calledWith(
                'INSERT INTO USERS VALUES (DEFAULT, $1, $2, $3, DEFAULT, $4, $5, DEFAULT)',
                ['john_doe', 'john@example.com', 'hashed_password', 'Hello world', 'https://example.com/avatar.jpg']
            )).to.be.true;
        });

        it('should throw ApiError for duplicate email', async () => {
            bcryptHashStub.resolves('hashed_password');
            const pgError = new pg.DatabaseError('duplicate key value violates unique constraint', 1, 'error');
            pgError.code = '23505';
            pgError.constraint = 'users_email_key';
            dbPoolQueryStub.rejects(pgError);

            await expect(userService.register(validUser)).to.be.rejectedWith(ApiError, 'Email already exists');
        });

        it('should throw ApiError for duplicate username', async () => {
            bcryptHashStub.resolves('hashed_password');
            const pgError = new pg.DatabaseError('duplicate key value violates unique constraint', 1, 'error');
            pgError.code = '23505';
            pgError.constraint = 'users_username_key';
            dbPoolQueryStub.rejects(pgError);

            await expect(userService.register(validUser)).to.be.rejectedWith(ApiError, 'Username already exists');
        });
    });

    describe('login', () => {
        const validLogin = { email: 'john@example.com', password: 'password123' };
        const dbUser = { user_id: 1, email: 'john@example.com', password_hash: 'hashed_password', role: UserRoleEnum.NORMAL };

        it('should successfully login and return payload', async () => {
            dbPoolQueryStub.resolves({ rows: [dbUser] });
            bcryptCompareStub.resolves(true);

            const result = await userService.login(validLogin);
            expect(result).to.deep.equal({ userId: 1, role: UserRoleEnum.NORMAL });
            expect(dbPoolQueryStub.calledWith(
                'SELECT user_id, email, password_hash FROM USERS WHERE email=$1',
                ['john@example.com']
            )).to.be.true;
            expect(bcryptCompareStub.calledWith('password123', 'hashed_password')).to.be.true;
        });

        it('should throw ApiError for invalid email', async () => {
            dbPoolQueryStub.resolves({ rows: [] });

            await expect(userService.login(validLogin)).to.be.rejectedWith(ApiError, 'Email not found');
        });

        it('should throw ApiError for incorrect password', async () => {
            dbPoolQueryStub.resolves({ rows: [dbUser] });
            bcryptCompareStub.resolves(false);

            await expect(userService.login(validLogin)).to.be.rejectedWith(ApiError, 'Incorrect Password');
        });
    });

    describe('getUserProfile', () => {
        const dbUser = {
            user_id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            password_hash: 'hashed_password',
            role: UserRoleEnum.NORMAL,
            bio: 'Hello',
            avatar_url: 'https://example.com/avatar.jpg',
        };

        it('should return user profile', async () => {
            dbPoolQueryStub.resolves({ rows: [dbUser] });

            const result = await userService.getUserProfile(1);
            expect(result).to.deep.equal({
                userId: 1,
                username: 'john_doe',
                email: 'john@example.com',
                role: UserRoleEnum.NORMAL,
                bio: 'Hello',
                avatarUrl: 'https://example.com/avatar.jpg',
            });
            expect(dbPoolQueryStub.calledWith('SELECT * FROM USERS WHERE user_id=$1', [1])).to.be.true;
        });

        it('should throw ApiError for non-existent user', async () => {
            dbPoolQueryStub.resolves({ rows: [] });

            await expect(userService.getUserProfile(1)).to.be.rejectedWith(ApiError, 'User not found');
        });
    });

    describe('updateProfile', () => {
        const validUpdate = { username: 'new_name', bio: 'New bio', avatarUrl: 'https://newurl.com' };

        it('should successfully update profile', async () => {
            dbPoolQueryStub.resolves({ rows: [] });

            await expect(userService.updateProfile(1, validUpdate)).to.eventually.be.fulfilled;
            expect(dbPoolQueryStub.calledWith(
                `UPDATE USERS SET username = COALESCE($1, username), bio = COALESCE($2, bio), avatar_url = COALESCE($3, avatar_url) WHERE user_id = $4`,
                ['new_name', 'New bio', 'https://newurl.com', 1]
            )).to.be.true;
        });

        it('should throw ApiError for duplicate username', async () => {
            const pgError = new pg.DatabaseError('duplicate key value violates unique constraint', 1, 'error');
            pgError.code = '23505';
            pgError.constraint = 'users_username_key';
            dbPoolQueryStub.rejects(pgError);

            await expect(userService.updateProfile(1, validUpdate)).to.be.rejectedWith(ApiError, 'Username already exists');
        });
    });

    describe('getUserRole', () => {
        it('should return user role', async () => {
            dbPoolQueryStub.resolves({ rows: [{ role: UserRoleEnum.ADMIN }], rowCount: 1 });

            const role = await userService.getUserRole(1);
            expect(role).to.equal(UserRoleEnum.ADMIN);
            expect(dbPoolQueryStub.calledWith('SELECT role FROM users where user_id = $1', [1])).to.be.true;
        });

        it('should throw ApiError if user not found', async () => {
            dbPoolQueryStub.resolves({ rows: [], rowCount: 0 });

            await expect(userService.getUserRole(1)).to.be.rejectedWith(ApiError, 'UserId not found');
        });
    });

    describe('changeRole', () => {
        it('should allow superadmin to change role', async () => {
            const getUserRoleStub = sinon.stub(userService, 'getUserRole');
            getUserRoleStub.withArgs(1).resolves(UserRoleEnum.SUPERADMIN);
            getUserRoleStub.withArgs(2).resolves(UserRoleEnum.NORMAL);
            dbPoolQueryStub.resolves({ rows: [] });

            await expect(userService.changeRole(2, UserRoleEnum.MODERATOR, 1)).to.eventually.be.fulfilled;
            expect(dbPoolQueryStub.calledWith('UPDATE users SET role = $1 where user_id = $2', [UserRoleEnum.MODERATOR, 2])).to.be.true;
        });

        it('should allow admin to promote normal to moderator', async () => {
            const getUserRoleStub = sinon.stub(userService, 'getUserRole');
            getUserRoleStub.withArgs(1).resolves(UserRoleEnum.ADMIN);
            getUserRoleStub.withArgs(2).resolves(UserRoleEnum.NORMAL);
            dbPoolQueryStub.resolves({ rows: [] });

            await expect(userService.changeRole(2, UserRoleEnum.MODERATOR, 1)).to.eventually.be.fulfilled;
        });

        it('should throw ApiError if changer lacks permission to modify higher role', async () => {
            const getUserRoleStub = sinon.stub(userService, 'getUserRole');
            getUserRoleStub.withArgs(1).resolves(UserRoleEnum.MODERATOR);
            getUserRoleStub.withArgs(2).resolves(UserRoleEnum.ADMIN);

            await expect(userService.changeRole(2, UserRoleEnum.NORMAL, 1)).to.be.rejectedWith(ApiError, 'You do not have permission to modify this user\'s role');
        });

        it('should throw ApiError if changer assigns role higher than their own', async () => {
            const getUserRoleStub = sinon.stub(userService, 'getUserRole');
            getUserRoleStub.withArgs(1).resolves(UserRoleEnum.ADMIN);
            getUserRoleStub.withArgs(2).resolves(UserRoleEnum.NORMAL);

            await expect(userService.changeRole(2, UserRoleEnum.SUPERADMIN, 1)).to.be.rejectedWith(ApiError, 'You do not have permission to assign this role');
        });
    });
});