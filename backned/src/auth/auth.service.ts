import { Injectable, ConflictException, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterFacultyDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kaspro_secure_super_jwt_secret_key_2026_itvexo';
const JWT_EXPIRES_IN = '7d';

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    institutionName: string | null;
    departmentName: string | null;
    designation: string | null;
    createdAt: Date;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Register a new faculty/teacher account in PostgreSQL
   */
  async registerFaculty(dto: RegisterFacultyDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // 1. Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists. Please login instead.');
    }

    // 2. Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 3. Create user in PostgreSQL database
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'FACULTY',
        institutionName: dto.institutionName ? dto.institutionName.trim() : 'ITVEXO University Partner',
        departmentName: dto.departmentName ? dto.departmentName.trim() : 'Computer Science & Engineering',
        designation: dto.designation ? dto.designation.trim() : 'Faculty Member',
      },
    });

    this.logger.log(`New Faculty registered successfully: ${user.email} (${user.fullName})`);

    // 4. Generate JWT token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Faculty registration successful!',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institutionName: user.institutionName,
        departmentName: user.departmentName,
        designation: user.designation,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Authenticate faculty member with bcrypt verification
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password. Please verify your credentials.');
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password. Please verify your credentials.');
    }

    this.logger.log(`Faculty authenticated: ${user.email}`);

    // 3. Generate JWT token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institutionName: user.institutionName,
        departmentName: user.departmentName,
        designation: user.designation,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Retrieve current authenticated user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        institutionName: true,
        departmentName: true,
        designation: true,
        createdAt: true,
        facultySessions: {
          select: {
            id: true,
            sessionCode: true,
            subjectName: true,
            department: true,
            status: true,
            startedAt: true,
            endedAt: true,
          },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    return {
      success: true,
      user,
    };
  }

  /**
   * Verify a JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }

  private generateToken(user: { id: string; email: string; role: string; fullName: string }): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}
