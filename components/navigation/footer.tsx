import Link from "next/link";
import { Github, Linkedin, Mail, Code2 } from "lucide-react";
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
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
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

          {/* Tech Stack */}
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

          {/* Developer Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Developer</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Asmit Tyagi</p>
                <p className="text-sm text-muted-foreground">
                  Full Stack Developer
                </p>
              </div>

              {/* Social Links */}
              <div className="flex flex-col gap-2">
                <Link
                  href="https://github.com/Tyagi221B"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  <span>github.com/Tyagi221B</span>
                </Link>
                <Link
                  href="https://www.linkedin.com/in/asmit-tyagi-0482081ba/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" />
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
            &copy; {currentYear} Adaptly. Built for House of Edtech Assignment.
          </p>
          <p className="text-xs">
            Created with Next.js 16 | Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
