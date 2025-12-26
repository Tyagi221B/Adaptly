import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Accessibility Statement | Adaptly",
  description: "Adaptly's commitment to digital accessibility for all users",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Accessibility Statement</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Commitment</CardTitle>
              <CardDescription>Making learning accessible to everyone</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Adaptly is committed to ensuring digital accessibility for people with disabilities.
                We are continually improving the user experience for everyone and applying the
                relevant accessibility standards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conformance Status</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                The{" "}
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Web Content Accessibility Guidelines (WCAG)
                </a>{" "}
                define requirements for designers and developers to improve accessibility for
                people with disabilities. It defines three levels of conformance: Level A, Level AA,
                and Level AAA.
              </p>
              <p>
                Adaptly is partially conformant with WCAG 2.1 level AA. Partially conformant means
                that some parts of the content do not fully conform to the accessibility standard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Keyboard Navigation:</strong> Full keyboard support throughout the
                    application using Tab, Enter, Escape, and Arrow keys
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Screen Reader Compatible:</strong> Proper ARIA labels, landmarks, and
                    semantic HTML for assistive technologies
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Focus Management:</strong> Clear focus indicators and logical tab order
                    throughout the interface
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Color Contrast:</strong> Meets WCAG AA contrast ratios for text and
                    interactive elements
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Form Accessibility:</strong> Properly labeled inputs with error
                    announcements and validation messages
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Live Regions:</strong> Dynamic content changes announced to screen
                    readers
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Skip Navigation:</strong> Skip to main content link for keyboard users
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Alternative Text:</strong> Descriptive text for all meaningful images
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <div>
                    <strong>Responsive Design:</strong> Works across various screen sizes and devices
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Accessibility of Adaptly relies on the following technologies to work with the
                particular combination of web browser and any assistive technologies or plugins
                installed on your computer:
              </p>
              <ul>
                <li>HTML5</li>
                <li>WAI-ARIA</li>
                <li>CSS</li>
                <li>JavaScript</li>
              </ul>
              <p>
                These technologies are relied upon for conformance with the accessibility standards
                used.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitations and Alternatives</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Despite our best efforts to ensure accessibility of Adaptly, there may be some
                limitations. Below is a description of known limitations and potential solutions.
                Please contact us if you observe an issue not listed below.
              </p>
              <p>
                Known limitations:
              </p>
              <ul>
                <li>
                  <strong>Third-party content:</strong> Some embedded content may not be fully
                  accessible
                </li>
                <li>
                  <strong>Complex AI interactions:</strong> Some AI-generated content may require
                  additional context for screen reader users
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Approach</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Adaptly assessed the accessibility of this website by the following approaches:
              </p>
              <ul>
                <li>Self-evaluation using automated testing tools (axe-core)</li>
                <li>Manual testing with keyboard navigation</li>
                <li>Code review with ESLint jsx-a11y plugin</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                We welcome your feedback on the accessibility of Adaptly. Please let us know if you
                encounter accessibility barriers:
              </p>
              <ul>
                <li>
                  <strong>Email:</strong> 7817089866 (contact via email)
                </li>
                <li>
                  <strong>GitHub:</strong>{" "}
                  <a
                    href="https://github.com/Tyagi221B/Adaptly"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Report an accessibility issue
                  </a>
                </li>
              </ul>
              <p>We try to respond to feedback within 2 business days.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This statement was created on December 26, 2025.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
