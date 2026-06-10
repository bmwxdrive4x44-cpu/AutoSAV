import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap, Globe, Package, MessageSquare, Handshake } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border-subtle bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[rgb(11,45,100)] to-[rgb(255,95,60)] text-white font-bold">
                A
              </div>
              <span className="font-semibold text-lg text-text-primary">AutoSAV</span>
            </div>
            <button className="px-4 py-2 rounded-lg font-medium text-[rgb(255,95,60)] hover:bg-[rgb(255,230,215)] transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 md:px-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[rgb(225,240,255)]/50 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(255,230,215)] text-[rgb(255,95,60)]">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">New Design System</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight text-text-primary">
                  Find trusted
                  <span className="block bg-gradient-to-r from-[rgb(11,45,100)] to-[rgb(255,95,60)] bg-clip-text text-transparent">
                    sources smarter
                  </span>
                </h1>
                <p className="text-lg text-text-secondary max-w-lg">
                  Connect with verified suppliers and source products with confidence on our modern, intuitive marketplace.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3 rounded-lg bg-[rgb(255,95,60)] text-white font-semibold hover:bg-[rgb(255,75,40)] transition-colors flex items-center justify-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button className="px-8 py-3 rounded-lg border-2 border-[rgb(11,45,100)] text-[rgb(11,45,100)] font-semibold hover:bg-[rgb(225,240,255)] transition-colors">
                  Learn More
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {["Verified Network", "Fast Matching", "Global Scale"].map((chip) => (
                  <div key={chip} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-[rgb(35,165,105)]" />
                    <span className="text-text-secondary">{chip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Card */}
            <div className="rounded-2xl bg-surface border border-border-subtle shadow-lg p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Platform Metrics</h3>
                <div className="space-y-3">
                  {[
                    { label: "Active Requests", value: "1,200+" },
                    { label: "Verified Users", value: "5,000+" },
                    { label: "Average Response", value: "< 2 hours" }
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-bg">
                      <span className="text-sm text-text-secondary">{metric.label}</span>
                      <span className="font-bold text-text-primary">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-[rgb(225,240,255)] to-[rgb(255,230,215)]">
                <p className="text-sm text-text-primary font-medium">
                  New modern design with improved visual hierarchy and premium color palette.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-transparent to-[rgb(248,251,255)]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Why Choose AutoSAV</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Experience a marketplace built with modern design principles and premium user experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verified Sellers", desc: "All suppliers are vetted for reliability and quality" },
              { icon: Zap, title: "Fast Responses", desc: "Get offers within hours, not days" },
              { icon: Globe, title: "Global Network", desc: "Connect with suppliers across multiple countries" }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="rounded-xl bg-surface border border-border-subtle p-8 hover:shadow-lg transition-shadow">
                  <div className="inline-flex p-3 rounded-lg bg-[rgb(255,230,215)] text-[rgb(255,95,60)] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">How It Works</h2>
            <p className="text-lg text-text-secondary">Simple, transparent, and fast. Source in three steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Package, title: "Post Your Request", desc: "Share product details, quantity, and budget" },
              { icon: MessageSquare, title: "Receive Offers", desc: "Verified providers reply with pricing and terms" },
              { icon: Handshake, title: "Complete Order", desc: "Compare, negotiate, and finalize with visibility" }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative">
                  {idx < 2 && (
                    <div className="hidden md:block absolute right-0 top-1/2 w-8 h-1 bg-gradient-to-r from-[rgb(11,45,100)] to-[rgb(255,95,60)] transform translate-x-1/2 -translate-y-1/2" />
                  )}
                  <div className="rounded-xl bg-surface border border-border-subtle p-8 text-center">
                    <div className="inline-flex p-4 rounded-full bg-[rgb(225,240,255)] text-[rgb(11,45,100)] mb-4">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                    <p className="text-text-secondary">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-[rgb(11,45,100)] to-[rgb(20,60,140)] p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90">Join businesses sourcing smarter today</p>
            <button className="px-8 py-4 rounded-lg bg-[rgb(255,95,60)] text-white font-bold hover:bg-[rgb(255,75,40)] transition-colors">
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface py-12 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-[rgb(11,45,100)] to-[rgb(255,95,60)] text-white text-xs font-bold">
                  A
                </div>
                <span className="font-bold text-text-primary">AutoSAV</span>
              </div>
              <p className="text-sm text-text-muted">Modern marketplace for global sourcing</p>
            </div>
            {["Product", "Company", "Support"].map((col) => (
              <div key={col}>
                <h4 className="font-semibold text-text-primary mb-4">{col}</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><a href="#" className="hover:text-[rgb(255,95,60)] transition-colors">Link One</a></li>
                  <li><a href="#" className="hover:text-[rgb(255,95,60)] transition-colors">Link Two</a></li>
                  <li><a href="#" className="hover:text-[rgb(255,95,60)] transition-colors">Link Three</a></li>
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border-subtle pt-8 flex items-center justify-between text-sm text-text-muted">
            <p>&copy; 2024 AutoSAV. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
