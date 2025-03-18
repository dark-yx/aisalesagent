import jwt from 'jsonwebtoken';
import { createCipheriv, createDecipheriv } from 'crypto';

export class SecurityLayer {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;
  private iv: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.JWT_SECRET!.padEnd(32), 'utf-8');
    this.iv = this.key.subarray(0, 16);
  }

  async validateRequest(context: any) {
    try {
      jwt.verify(context.token, process.env.JWT_SECRET!);
      this.decryptData(context.encryptedData);
    } catch (error) {
      throw new Error('Validación de seguridad fallida');
    }
  }

  generateToken(threadId: string) {
    return jwt.sign({ threadId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  }

  encryptData(data: string): string {
    const cipher = createCipheriv(this.algorithm, this.key, this.iv);
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  }

  decryptData(encryptedData: string): string {
    const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
    return decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8');
  }
}