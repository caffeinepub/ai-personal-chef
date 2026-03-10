import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ChefHat, Clock, Filter, Heart, Mic, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    desc: "Smart recipes from whatever you have on hand",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: Mic,
    title: "Voice Input",
    desc: "Just say what's in your fridge",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Filter,
    title: "Smart Filters",
    desc: "Veg, time limits, and difficulty levels",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Heart,
    title: "Save Favourites",
    desc: "Build your personal cookbook",
    color: "text-rose-600 bg-rose-50",
  },
  {
    icon: Clock,
    title: "Quick Recipes",
    desc: "Filter by cooking time — from 15 mins up",
    color: "text-sky-600 bg-sky-50",
  },
  {
    icon: ChefHat,
    title: "Step-by-Step",
    desc: "Detailed cooking instructions for every recipe",
    color: "text-violet-600 bg-violet-50",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    if (!isInitializing && identity) {
      navigate({ to: "/home" });
    }
  }, [identity, isInitializing, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-kitchen.dim_1200x800.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-chef-brown/70 via-chef-brown/50 to-background" />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              AI Personal Chef
            </span>
          </div>
          <Button
            variant="outline"
            className="text-white border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20"
            onClick={() => navigate({ to: "/home" })}
          >
            Open App
          </Button>
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-24 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by AI · College Innovation Project
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-5">
              Cook Something
              <br />
              <span className="text-amber-300">Extraordinary</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Tell us what's in your kitchen. Our AI chef finds the perfect
              recipes using exactly what you have.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm text-base px-8 py-6 rounded-xl"
                onClick={() => navigate({ to: "/home" })}
              >
                <ChefHat className="w-5 h-5 mr-2" />
                Start Cooking
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 md:px-12 bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need
              <br />
              <span className="text-primary">to cook brilliantly</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A full-featured AI kitchen companion designed for modern home
              cooks.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}
                >
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-4xl font-bold text-primary-foreground mb-4">
              Ready to cook?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Open your fridge, tell the AI what you have, and start cooking.
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-base px-8 py-6 rounded-xl shadow-warm"
              onClick={() => navigate({ to: "/home" })}
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-rose-500">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
