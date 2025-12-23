"use client"

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users,
  Award,
  Lightbulb,
  Rocket,
  Code2,
} from "lucide-react";
import CountUp from "react-countup";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION - Asymmetric Layout */}
      <HeroSection />

      {/* PROBLEM-SOLUTION SECTION */}
      <ProblemSolutionSection />

      {/* HOW IT WORKS */}
      <HowItWorksSection />

      {/* FEATURES BENTO GRID */}
      <FeaturesSection />

      {/* STATS MARQUEE */}
      <StatsSection />

      {/* FINAL CTA */}
      <CTASection />
    </div>
  );
}

// ==================== HERO SECTION ====================
function HeroSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center gradient-animated overflow-hidden"
    >
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Badge className="px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Learning Platform
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Stop Failing.
                <br />
                <span className="gradient-text">Start Learning.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                AI that understands your mistakes and creates personalized content
                just for you. Like Duolingo, but for technical courses.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button asChild size="lg" className="text-lg px-8 rounded-full">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 rounded-full">
                <Link href="/login">
                  Login
                </Link>
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-8 pt-8"
            >
              <div>
                <div className="text-3xl font-bold gradient-text">
                  {inView && <CountUp end={1000} suffix="+" duration={2} />}
                </div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">
                  {inView && <CountUp end={50} suffix="+" duration={2} />}
                </div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">
                  {inView && <CountUp end={98} suffix="%" duration={2} />}
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive Demo Widget */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <DemoWidget />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-muted-foreground"
        >
          <div className="w-6 h-10 border-2 border-current rounded-full p-1">
            <div className="w-1.5 h-3 bg-current rounded-full mx-auto" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Demo Widget Component
function DemoWidget() {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 space-y-4 shadow-floating">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Quiz Result</h3>
        <Badge variant="secondary">Live Demo</Badge>
      </div>

      {/* Score */}
      <div className="text-center py-4">
        <div className="text-5xl font-bold gradient-text">6/10</div>
        <div className="text-sm text-muted-foreground mt-2">Your Score</div>
      </div>

      {/* AI Analysis Steps */}
      <div className="space-y-3">
        <motion.div
          animate={{ opacity: step >= 0 ? 1 : 0.3 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Strong Areas</div>
            <div className="text-muted-foreground">Functions, Loops</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: step >= 1 ? 1 : 0.3 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
        >
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Needs Work</div>
            <div className="text-muted-foreground">Variable Scope</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: step >= 2 ? 1 : 0.3 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="font-medium">AI-Generated Help</div>
            <motion.div
              initial={{ width: 0 }}
              animate={step >= 2 ? { width: "100%" } : {}}
              className="text-muted-foreground overflow-hidden"
            >
              Personalized content ready...
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ==================== PROBLEM-SOLUTION SECTION ====================
function ProblemSolutionSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge variant="destructive" className="px-3 py-1">
              The Problem
            </Badge>
            <h2 className="text-4xl font-bold">
              Online Courses Have a
              <span className="block gradient-text">70% Dropout Rate</span>
            </h2>
            <div className="space-y-4">
              {[
                "Students get stuck with no personalized help",
                "Re-reading the same content doesn't work",
                "Generic AI chatbots give surface answers",
                "Forums and instructor support don't scale",
              ].map((problem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="flex items-start gap-3"
                >
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-lg text-muted-foreground">{problem}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Badge className="px-3 py-1">
              <Zap className="w-4 h-4 mr-1" />
              The Solution
            </Badge>
            <h2 className="text-4xl font-bold">
              Adaptly Solves This With
              <span className="block gradient-text">AI-Powered Personalization</span>
            </h2>
            <div className="space-y-4">
              {[
                { icon: Brain, text: "Analyzes wrong answers semantically" },
                { icon: Target, text: "Identifies specific misconceptions" },
                { icon: Lightbulb, text: "Generates personalized explanations" },
                { icon: Rocket, text: "Adapts to your learning pace" },
              ].map((solution, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="flex items-start gap-3 p-4 rounded-lg hover-lift glass-effect"
                >
                  <solution.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p className="text-lg">{solution.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ==================== HOW IT WORKS SECTION ====================
function HowItWorksSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  const steps = [
    {
      icon: BookOpen,
      title: "Take a Quiz",
      description: "Answer questions after each lecture to test your understanding",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Brain,
      title: "AI Analyzes",
      description: "Our AI understands WHY you chose wrong answers and identifies misconceptions",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Sparkles,
      title: "Get Personal Help",
      description: "Receive custom explanations, examples, and practice problems tailored to you",
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <Badge className="px-4 py-2 mb-4">
            How It Works
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold">
            Learning Made
            <span className="block gradient-text">Simple & Effective</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 * i }}
              className="relative"
            >
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-primary/50 to-transparent" />
              )}

              <div className="glass-card p-6 space-y-4 hover-lift h-full">
                <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-muted-foreground">
                      0{i + 1}
                    </span>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== FEATURES BENTO GRID ====================
function FeaturesSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <Badge className="px-4 py-2 mb-4">
            Features
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold">
            Everything You Need to
            <span className="block gradient-text">Excel in Learning</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Card 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 glass-card p-8 hover-lift group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <Badge>AI-Powered</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-3">AI Quiz Generation</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Generate relevant quizzes from lecture content with one click.
              Our AI creates thoughtful questions that test real understanding.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">Automatic</Badge>
              <Badge variant="secondary">Smart</Badge>
              <Badge variant="secondary">Time-Saving</Badge>
            </div>
          </motion.div>

          {/* Small Card 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6 hover-lift group"
          >
            <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors w-fit mb-4">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Visualize your learning journey with detailed analytics
            </p>
          </motion.div>

          {/* Small Card 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 hover-lift group"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors w-fit mb-4">
              <Code2 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Rich Editor</h3>
            <p className="text-muted-foreground">
              Create engaging content with slash commands and formatting
            </p>
          </motion.div>

          {/* Large Card 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 glass-card p-8 hover-lift group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Target className="w-8 h-8 text-green-500" />
              </div>
              <Badge>Core Feature</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-3">Personalized Learning</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Get custom explanations for every mistake. Our AI analyzes your answers
              and creates content that addresses YOUR specific confusion.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm">Semantic analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm">Custom examples</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm">Adaptive difficulty</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm">Unlimited retakes</span>
              </div>
            </div>
          </motion.div>

          {/* Medium Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 hover-lift group"
          >
            <div className="p-3 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors w-fit mb-4">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Role-Based Access</h3>
            <p className="text-muted-foreground mb-4">
              Separate dashboards for students and instructors with tailored features
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">Students</Badge>
              <Badge variant="outline" className="text-xs">Instructors</Badge>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ==================== STATS MARQUEE ====================
function StatsSection() {
  const stats = [
    { icon: Users, value: "1000+", label: "Active Students" },
    { icon: BookOpen, value: "50+", label: "Courses" },
    { icon: Brain, value: "10k+", label: "AI Quizzes" },
    { icon: Award, value: "98%", label: "Success Rate" },
    { icon: Sparkles, value: "100%", label: "Personalized" },
    { icon: TrendingUp, value: "5x", label: "Faster Learning" },
  ];

  return (
    <section className="py-16 bg-muted/30 overflow-hidden">
      <div className="relative">
        {/* Gradient Fade on Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-muted/30 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-muted/30 to-transparent z-10" />

        {/* Marquee */}
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex gap-12"
        >
          {/* Duplicate stats for infinite effect */}
          {[...stats, ...stats, ...stats].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 min-w-62.5">
              <div className="p-3 rounded-xl bg-primary/10">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {stat.label}
                </div>
              </div>
              <div className="w-px h-12 bg-border ml-4" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==================== CTA SECTION ====================
function CTASection() {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <section ref={ref} className="py-32 px-4 sm:px-6 lg:px-8 gradient-animated">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center space-y-8"
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
          Ready to Learn
          <span className="block gradient-text">Smarter?</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of students who are already learning with personalized AI tutoring
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Button asChild size="lg" className="text-lg px-10 rounded-full h-14">
            <Link href="/signup">
              Get Started as Student
              <Rocket className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-10 rounded-full h-14">
            <Link href="/signup">
              I&apos;m an Instructor
              <Award className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Free to start
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            AI-powered from day one
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
