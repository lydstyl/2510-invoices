import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../database/UserRepository';

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async validateCredentials(credentials: LoginCredentials): Promise<boolean> {
    const user = await this.userRepository.findByEmail(credentials.email);

    if (!user) {
      return false;
    }

    return await bcrypt.compare(credentials.password, user.password);
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
