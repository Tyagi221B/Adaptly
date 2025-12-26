import Link from "next/link";
import { Mail, Code2, Video } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const techStack = [
    "Next.js 16",
    "TypeScript",
    "MongoDB",
    "Tailwind CSS",
    "AI-SDK",
    "NextAuth.js",
  ];

  return (
    <footer className="border-t bg-linear-to-b from-[#e6e5dd] to-[#ddd9d0] dark:from-background dark:to-background">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adaptly</h3>
            <p className="text-sm text-muted-foreground">
              AI-Powered Adaptive Learning Platform transforming education with
              personalized remedial content tailored to each student&apos;s knowledge
              gaps.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Code2 className="h-3 w-3" />
              <span>Built with modern web technologies</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Full-stack Next.js application with AI integration
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Developer</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Asmit Tyagi • Full Stack Developer</p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="https://www.youtube.com/watch?v=pQOskkCH1_g"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Video className="h-4 w-4" />
                  <span>Demo Video</span>
                </Link>
                <Link
                  href="https://github.com/Tyagi221B/Adaptly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>github.com/Tyagi221B/Adaptly</span>
                </Link>
                <Link
                  href="https://www.linkedin.com/in/asmit-tyagi-0482081ba/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn Profile</span>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>7817089866</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {currentYear} Adaptly.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/accessibility" className="text-xs hover:text-primary transition-colors">
              Accessibility Statement
            </Link>
            <span className="text-xs">|</span>
            <p className="text-xs">
              Created with Next.js 16 | Deployed on Vercel
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
