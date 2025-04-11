import { ConflictException } from '@nestjs/common';

export async function handleDuplicationMongoErrors<T>(
  operation: () => Promise<T>,
  errorMessage: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictException(errorMessage);
    }
    throw error;
  }
}
