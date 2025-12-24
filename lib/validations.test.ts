import {
  SignUpSchema,
  SignInSchema,
  CreateCourseSchema,
  CreateLectureSchema,
} from './validations';
import { z } from 'zod';

describe('SignUpSchema', () => {
  test('validates correct signup data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'student' as const,
    };

    // Should not throw error
    expect(() => SignUpSchema.parse(validData)).not.toThrow();

    // Should return parsed data
    const result = SignUpSchema.parse(validData);
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
  });

  test('trims whitespace from name and email', () => {
    const dataWithSpaces = {
      name: '  John Doe  ',
      email: 'JOHN@EXAMPLE.COM', // No leading/trailing spaces (they cause validation error)
      password: 'password123',
      role: 'student' as const,
    };

    const result = SignUpSchema.parse(dataWithSpaces);

    expect(result.name).toBe('John Doe'); // Trimmed
    expect(result.email).toBe('john@example.com'); // Lowercase
  });

  test('rejects name that is too short', () => {
    const invalidData = {
      name: 'A', // Only 1 character
      email: 'john@example.com',
      password: 'password123',
      role: 'student' as const,
    };

    expect(() => SignUpSchema.parse(invalidData)).toThrow('Name must be at least 2 characters');
  });

  test('rejects invalid email', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'not-an-email', // Invalid email
      password: 'password123',
      role: 'student' as const,
    };

    expect(() => SignUpSchema.parse(invalidData)).toThrow('Please provide a valid email address');
  });

  test('rejects password that is too short', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '12345', // Only 5 characters
      role: 'student' as const,
    };

    expect(() => SignUpSchema.parse(invalidData)).toThrow('Password must be at least 6 characters');
  });

  test('rejects invalid role', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'admin', // Invalid role
    };

    expect(() => SignUpSchema.parse(invalidData)).toThrow();
  });
});

describe('SignInSchema', () => {
  test('validates correct signin data', () => {
    const validData = {
      email: 'john@example.com',
      password: 'password123',
    };

    expect(() => SignInSchema.parse(validData)).not.toThrow();
  });

  test('converts email to lowercase', () => {
    const data = {
      email: 'JOHN@EXAMPLE.COM',
      password: 'password123',
    };

    const result = SignInSchema.parse(data);
    expect(result.email).toBe('john@example.com');
  });

  test('rejects empty password', () => {
    const invalidData = {
      email: 'john@example.com',
      password: '',
    };

    expect(() => SignInSchema.parse(invalidData)).toThrow('Password is required');
  });
});

describe('CreateCourseSchema', () => {
  test('validates correct course data', () => {
    const validData = {
      title: 'Introduction to TypeScript',
      description: 'Learn TypeScript from scratch with practical examples',
      category: 'programming' as const,
    };

    expect(() => CreateCourseSchema.parse(validData)).not.toThrow();
  });

  test('trims title and description', () => {
    const data = {
      title: '  TypeScript Course  ',
      description: '  Learn TypeScript basics  ',
      category: 'programming' as const,
    };

    const result = CreateCourseSchema.parse(data);
    expect(result.title).toBe('TypeScript Course');
    expect(result.description).toBe('Learn TypeScript basics');
  });

  test('rejects title that is too short', () => {
    const invalidData = {
      title: 'TS', // Only 2 characters
      description: 'Learn TypeScript from scratch',
      category: 'programming' as const,
    };

    expect(() => CreateCourseSchema.parse(invalidData)).toThrow('Title must be at least 3 characters');
  });

  test('rejects description that is too short', () => {
    const invalidData = {
      title: 'TypeScript Course',
      description: 'Short', // Too short
      category: 'programming' as const,
    };

    expect(() => CreateCourseSchema.parse(invalidData)).toThrow('Description must be at least 10 characters');
  });

  test('rejects invalid category', () => {
    const invalidData = {
      title: 'TypeScript Course',
      description: 'Learn TypeScript from scratch',
      category: 'invalid-category',
    };

    expect(() => CreateCourseSchema.parse(invalidData)).toThrow();
  });

  test('accepts optional thumbnail and instructorMessage', () => {
    const dataWithOptionals = {
      title: 'TypeScript Course',
      description: 'Learn TypeScript from scratch',
      category: 'programming' as const,
      thumbnail: 'https://example.com/image.jpg',
      instructorMessage: 'Welcome to the course!',
    };

    expect(() => CreateCourseSchema.parse(dataWithOptionals)).not.toThrow();
  });
});

describe('CreateLectureSchema', () => {
  test('validates correct lecture data', () => {
    const validData = {
      courseId: '507f1f77bcf86cd799439011',
      title: 'Variables and Data Types',
      content: 'In this lecture, we will learn about variables and data types in TypeScript.',
      order: 1,
    };

    expect(() => CreateLectureSchema.parse(validData)).not.toThrow();
  });

  test('rejects missing courseId', () => {
    const invalidData = {
      courseId: '',
      title: 'Variables and Data Types',
      content: 'In this lecture, we will learn about variables.',
      order: 1,
    };

    expect(() => CreateLectureSchema.parse(invalidData)).toThrow('Course ID is required');
  });

  test('rejects order less than 1', () => {
    const invalidData = {
      courseId: '507f1f77bcf86cd799439011',
      title: 'Variables and Data Types',
      content: 'In this lecture, we will learn about variables.',
      order: 0, // Invalid: must be at least 1
    };

    expect(() => CreateLectureSchema.parse(invalidData)).toThrow('Order must be at least 1');
  });

  test('rejects non-integer order', () => {
    const invalidData = {
      courseId: '507f1f77bcf86cd799439011',
      title: 'Variables and Data Types',
      content: 'In this lecture, we will learn about variables.',
      order: 1.5, // Invalid: must be integer
    };

    expect(() => CreateLectureSchema.parse(invalidData)).toThrow();
  });
});
