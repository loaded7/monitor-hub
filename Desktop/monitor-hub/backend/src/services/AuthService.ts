import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userRepository = AppDataSource.getRepository(User);

export class AuthService {
  static async register(email: string, password: string, fullName: string) {
    // Validar email
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email');
    }

    // Validar password
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Verificar se email já existe
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Gerar API Key
    const apiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

    // Criar usuário
    const user = userRepository.create({
      email,
      passwordHash,
      fullName: fullName || email.split('@')[0],
      apiKey,
    });

    await userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      apiKey: user.apiKey,
    };
  }

  static async login(email: string, password: string) {
    // Procurar usuário
    const user = await userRepository.findOneBy({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        apiKey: user.apiKey,
      },
    };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as any;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}