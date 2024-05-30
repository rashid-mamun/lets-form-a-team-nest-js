import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntityService } from 'src/dataModules/user/user.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private readonly userService: UserEntityService,
    private readonly tokenService: TokenService,
  ) { }

  /**
   * Registers a new user and returns access and refresh tokens.
   * @param createUserDto - Data Transfer Object for creating a user.
   * @returns An object containing access and refresh tokens.
   */
  async registerUser(createUserDto: any): Promise<{ access_token: string, refresh_token: string }> {
    console.log({createUserDto});
    const user = await this.userService.insertUser(createUserDto);
    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.tokenService.generateAccessToken(payload),
      refresh_token: this.tokenService.generateRefreshToken(payload),
    };
  }

  /**
   * Logs in a user and returns access and refresh tokens.
   * @param loginUserDto - Data Transfer Object for logging in a user.
   * @returns An object containing access and refresh tokens.
   */
  async login(loginUserDto: any): Promise<{ access_token: string, refresh_token: string }> {
    const user = await this.userService.validateUser(loginUserDto.username, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.tokenService.generateAccessToken(payload),
      refresh_token: this.tokenService.generateRefreshToken(payload),
    };
  }

  /**
   * Logs out a user by adding the token to the blacklist.
   * @param token - The token to be blacklisted.
   */
  async logout(token: string): Promise<void> {
    this.tokenBlacklist.add(token);
  }

  /**
   * Refreshes the access token using the provided refresh token.
   * @param refreshToken - The refresh token.
   * @returns An object containing new access and refresh tokens.
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string, refresh_token: string }> {
    if (this.tokenBlacklist.has(refreshToken)) {
      throw new UnauthorizedException('Invalid token');
    }

    const decoded = this.tokenService.verifyToken(refreshToken);
    const payload = { username: decoded.username, sub: decoded.sub };

    return {
      access_token: this.tokenService.generateAccessToken(payload),
      refresh_token: this.tokenService.generateRefreshToken(payload),
    };
  }
  async validateUser(username: string, pass: string): Promise<any> {
    return this.userService.validateUser(username, pass);
  }


}


