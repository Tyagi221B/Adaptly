import { render, screen } from '@testing-library/react';
import { Footer } from './footer';

describe('Footer Component', () => {
  test('displays developer name', () => {
    render(<Footer />);

    // Check if your name appears
    expect(screen.getByText(/Asmit Tyagi/i)).toBeInTheDocument();
  });

  test('displays correct GitHub link', () => {
    render(<Footer />);

    // Find the GitHub link - it's a link element containing the text
    const githubLink = screen.getByRole('link', { name: /github\.com\/Tyagi221B/i });

    // Verify it has the correct href
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Tyagi221B');

    // Verify it opens in new tab
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('displays correct LinkedIn link', () => {
    render(<Footer />);

    // Find the LinkedIn link - it's a link element
    const linkedInLink = screen.getByRole('link', { name: /LinkedIn Profile/i });

    // Verify it has the correct href
    expect(linkedInLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/asmit-tyagi-0482081ba/'
    );

    // Verify it opens in new tab
    expect(linkedInLink).toHaveAttribute('target', '_blank');
  });

  test('displays tech stack badges', () => {
    render(<Footer />);

    // Check if key technologies are listed
    expect(screen.getByText('Next.js 16')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
    expect(screen.getByText('AI-SDK')).toBeInTheDocument();
  });

  test('displays platform description', () => {
    render(<Footer />);

    // Check if Adaptly branding is present
    expect(screen.getByText('Adaptly')).toBeInTheDocument();

    // Check if description contains AI-powered mention
    expect(
      screen.getByText(/AI-Powered Adaptive Learning Platform/i)
    ).toBeInTheDocument();
  });

  test('displays current year in copyright', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();

    // Check if copyright with current year is displayed
    expect(screen.getByText(new RegExp(`${currentYear} Adaptly`))).toBeInTheDocument();
  });

  test('displays contact phone number', () => {
    render(<Footer />);

    // Check if phone number is displayed
    expect(screen.getByText('7817089866')).toBeInTheDocument();
  });
});
