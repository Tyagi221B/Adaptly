"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-animated px-4 overflow-hidden">
      <div className="mx-auto max-w-3xl text-center">
        {/* Logo/Brand with scale animation */}
        <motion.h1
          className="mb-4 text-5xl font-bold tracking-tight gradient-text sm:text-6xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Adaptly
        </motion.h1>

        {/* Tagline with slide up */}
        <motion.p
          className="mb-8 text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          AI-Powered Adaptive Learning Platform
        </motion.p>

        {/* Description */}
        <motion.p
          className="mb-12 text-lg leading-relaxed text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Learn smarter with AI that understands your mistakes and creates
          personalized content just for you. Like Duolingo, but for technical
          courses.
        </motion.p>

        {/* CTA Buttons with stagger */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button asChild size="lg" className="text-lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/login">Login</Link>
          </Button>
        </motion.div>

        {/* Features with scroll-based reveal */}
        <div ref={ref} className="mt-16 grid gap-8 sm:grid-cols-3">
          <motion.div
            className="rounded-lg border bg-card p-6 shadow-soft hover:shadow-elevated transition-all hover-lift"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Brain className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 font-semibold text-foreground">
              Personalized Learning
            </h3>
            <p className="text-sm text-muted-foreground">
              AI analyzes your mistakes and creates custom explanations tailored
              to your understanding
            </p>
          </motion.div>

          <motion.div
            className="rounded-lg border bg-card p-6 shadow-soft hover:shadow-elevated transition-all hover-lift"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 font-semibold text-foreground">
              Adaptive Quizzes
            </h3>
            <p className="text-sm text-muted-foreground">
              Questions adjust to your level, ensuring you&apos;re always challenged
              but never overwhelmed
            </p>
          </motion.div>

          <motion.div
            className="rounded-lg border bg-card p-6 shadow-soft hover:shadow-elevated transition-all hover-lift"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 font-semibold text-foreground">
              Track Progress
            </h3>
            <p className="text-sm text-muted-foreground">
              Visual analytics show your knowledge evolution and weak areas to
              focus on
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
