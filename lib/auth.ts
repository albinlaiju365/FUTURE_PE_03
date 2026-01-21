import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'nexis-secret-key-change-this-in-production';

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

// Password Verification
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// Generate JWT Token
export function generateToken(payload: any): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

// Verify JWT Token
export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Get Current User from Session
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('nexis_session')?.value;

    if (!token) return null;

    return verifyToken(token);
}
