import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 28800,
  })
  expires_in: number;

  @ApiProperty({
    description: 'User data',
    example: {
      id: '1234-5678-abcd',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'SALON_OWNER',
    },
  })
  user: Record<string, any>;
} 