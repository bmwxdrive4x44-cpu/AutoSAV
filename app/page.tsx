export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[rgb(240,245,252)] to-[rgb(255,255,255)]">
      {/* Header */}
      <header className="border-b border-[rgb(215,230,250)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(11,45,100)]">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="font-semibold text-[rgb(15,25,50)]">AutoSAV</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <a href="#" className="text-sm text-[rgb(50,75,120)] hover:text-[rgb(11,45,100)]">Features</a>
            <a href="#" className="text-sm text-[rgb(50,75,120)] hover:text-[rgb(11,45,100)]">Pricing</a>
            <a href="#" className="text-sm text-[rgb(50,75,120)] hover:text-[rgb(11,45,100)]">About</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-[rgb(15,25,50)]">
          Smart Vehicle Management,{' '}
          <span className="bg-gradient-to-r from-[rgb(255,95,60)] to-[rgb(255,120,80)] bg-clip-text text-transparent">
            Simple & Powerful
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-[rgb(50,75,120)]">
          Track fuel consumption, maintenance schedules, and maximize your vehicle savings with our intelligent platform.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button className="rounded-lg bg-[rgb(255,95,60)] px-8 py-3 font-semibold text-white transition hover:bg-[rgb(255,75,40)]">
            Get Started
          </button>
          <button className="rounded-lg border-2 border-[rgb(11,45,100)] px-8 py-3 font-semibold text-[rgb(11,45,100)] transition hover:bg-[rgb(225,240,255)]">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-[rgb(15,25,50)]">
          Why Choose AutoSAV?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: 'Real-time Tracking',
              description: 'Monitor your vehicle metrics in real-time with our intuitive dashboard.',
              icon: '📊',
            },
            {
              title: 'Smart Analytics',
              description: 'Get actionable insights to optimize fuel consumption and maintenance.',
              icon: '🔍',
            },
            {
              title: 'Seamless Integration',
              description: 'Connect with your favorite tools and automate your workflow.',
              icon: '🔗',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-[rgb(215,230,250)] bg-white p-6 transition hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[rgb(255,230,215)] p-3">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="mb-2 font-semibold text-[rgb(15,25,50)]">{feature.title}</h3>
              <p className="text-sm text-[rgb(50,75,120)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Color Palette Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-[rgb(15,25,50)]">
          Design System
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Primary Color */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[rgb(15,25,50)]">Primary - Deep Navy Blue</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded bg-[rgb(11,45,100)]"></div>
                <div>
                  <p className="text-sm font-mono text-[rgb(50,75,120)]">rgb(11, 45, 100)</p>
                  <p className="text-xs text-[rgb(120,140,170)]">Trust & Stability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[rgb(15,25,50)]">Accent - Vibrant Coral</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded bg-[rgb(255,95,60)]"></div>
                <div>
                  <p className="text-sm font-mono text-[rgb(50,75,120)]">rgb(255, 95, 60)</p>
                  <p className="text-xs text-[rgb(120,140,170)]">Energy & Action</p>
                </div>
              </div>
            </div>
          </div>

          {/* Neutral Colors */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[rgb(15,25,50)]">Neutrals</h3>
            <div className="flex gap-2">
              {[
                { name: 'Background', color: 'rgb(240,245,252)' },
                { name: 'Surface', color: 'rgb(255,255,255)' },
                { name: 'Border', color: 'rgb(215,230,250)' },
              ].map((neutral) => (
                <div key={neutral.name} className="flex-1">
                  <div className="mb-2 h-8 rounded border border-[rgb(215,230,250)]" style={{ backgroundColor: neutral.color }}></div>
                  <p className="text-xs text-[rgb(120,140,170)]">{neutral.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[rgb(15,25,50)]">Semantic Colors</h3>
            <div className="flex gap-2">
              {[
                { name: 'Success', color: 'rgb(35,165,105)' },
                { name: 'Warning', color: 'rgb(225,150,30)' },
                { name: 'Danger', color: 'rgb(225,55,55)' },
              ].map((semantic) => (
                <div key={semantic.name} className="flex-1">
                  <div className="mb-2 h-8 rounded" style={{ backgroundColor: semantic.color }}></div>
                  <p className="text-xs text-[rgb(120,140,170)]">{semantic.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[rgb(11,45,100)] to-[rgb(11,70,130)] px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to transform your fleet?</h2>
          <p className="mb-8 text-lg text-blue-100">
            Join thousands of businesses optimizing their vehicle management with AutoSAV.
          </p>
          <button className="rounded-lg bg-[rgb(255,95,60)] px-8 py-3 font-semibold text-white transition hover:bg-[rgb(255,75,40)]">
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgb(215,230,250)] bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl text-center text-sm text-[rgb(120,140,170)]">
          <p>© 2024 AutoSAV. All rights reserved. | Design with improved navy blue and coral palette.</p>
        </div>
      </footer>
    </main>
  )
}
