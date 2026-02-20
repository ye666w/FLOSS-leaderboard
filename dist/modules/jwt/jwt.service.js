import jwt from 'jsonwebtoken';
const TOKEN_TTL = '12h';
const JWT_ALGORITHM = 'HS256';
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
};
export const createToken = (payload) => jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: TOKEN_TTL
});
export const verifyToken = (token) => {
    try {
        jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
        return true;
    }
    catch {
        return false;
    }
};
//# sourceMappingURL=jwt.service.js.map