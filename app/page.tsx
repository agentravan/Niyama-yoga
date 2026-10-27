import Link from "next/link";
import { ArrowRight, CalendarCheck, HeartPulse, Leaf, MonitorPlay, Moon, Star, Sun, UserCheck, Users, Wind } from "lucide-react";
import { PricingSection } from "@/components/PricingSection";

const styles = [
  { icon: Sun, title: "Sunrise Hatha", text: "Gentle, grounding postures and breathwork to start your day with clarity." },
  { icon: Wind, title: "Vinyasa Flow", text: "Breath-linked movement that builds strength, heat and focus." },
  { icon: Moon, title: "Yin & Nidra", text: "Long, quiet holds and guided rest to release deep tension." },
  { icon: HeartPulse, title: "Therapeutic Yoga", text: "Back-care, posture and mobility for desk-bound bodies." },
];

const steps = [
  { icon: CalendarCheck, title: "Pick your plan", text: "Choose a membership and start a 3-day free trial — no card needed." },
  { icon: UserCheck, title: "Tell us about you", text: "Share your experience level so we can guide you safely." },
  { icon: MonitorPlay, title: "Join live in your browser", text: "One click from your dashboard. No Zoom, no downloads." },
];

const testimonials = [
  { name: "Ananya S.", role: "Software engineer, Gurugram", text: "My back pain is gone after six weeks. Joining from the browser is so easy I never skip a class." },
  { name: "Rahul M.", role: "Beginner, Pune", text: "I was nervous as a total beginner. The teacher corrects my posture live — it feels like a private session." },
  { name: "Priya K.", role: "Annual member, Bengaluru", text: "The evening Yin classes changed my sleep. The annual plan with the nutrition guides is worth every rupee." },
];

const faqs = [
  { q: "Do I need to pay for the free trial?", a: "No. Your 3-day trial is completely free and needs no card. At the end we'll email you to continue with your chosen plan — or tell us why not." },
  { q: "What do I need to join a live class?", a: "A laptop, tablet or phone with a camera, a mat and a little space. Classes run directly in your browser — nothing to install." },
  { q: "I'm a complete beginner. Is this for me?", a: "Absolutely. Every class offers modifications, and you'll tell us your experience level when you sign up so the teacher can guide you." },
  { q: "Can I switch plans later?", a: "Yes — you can upgrade at any time from your dashboard's Membership page." },
  { q: "Is my camera required?", a: "It's optional but recommended, so the teacher can offer posture corrections. You control your camera and mic at all times." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 md:pt-24 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-sage-700 dark:text-sage-300">
            <Leaf className="h-3.5 w-3.5" /> Live classes every day · 3-day free trial
          </span>
          <h1 className="font-display mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Find your calm. <span className="text-sage-600 italic dark:text-sage-400">Live,</span> from home.
          </h1>
          <p className="muted mt-6 max-w-xl text-lg leading-relaxed">
            Small-group yoga with real teachers who see you, guide you and correct your posture — streamed straight to your browser.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/start?plan=3m" className="btn-primary !px-7 !py-3.5 text-base">
              Start 3-day free trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#pricing" className="btn-secondary !px-7 !py-3.5 text-base">
              View memberships
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["bg-sage-400", "bg-clay-400", "bg-sand-400", "bg-sage-600"].map((c, i) => (
                <span key={i} className={`h-10 w-10 rounded-full border-2 border-sand-50 dark:border-sage-950 ${c}`} />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex text-clay-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="muted">Loved by 2,000+ students</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms]">
          <div className="glass relative aspect-[4/5] overflow-hidden rounded-[2.5rem] p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-sage-200/70 via-sand-100/40 to-clay-300/40 dark:from-sage-800/50 dark:via-sage-900/30 dark:to-clay-600/20" />
            <svg viewBox="0 0 200 240" className="relative h-full w-full" aria-hidden>
              <circle cx="100" cy="70" r="46" className="fill-clay-300/60 dark:fill-clay-500/30" />
              <g className="stroke-sage-700 dark:stroke-sage-300" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <circle cx="100" cy="62" r="11" className="fill-sage-700 dark:fill-sage-300" />
                <path d="M100 75v48" />
                <path d="M100 88 70 58M100 88l30-30" />
                <path d="M100 123c-16 6-32 14-44 30h48M100 123c16 6 32 14 44 30H96" />
              </g>
              <path d="M30 180h140" className="stroke-sage-700/40 dark:stroke-sage-300/40" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="glass absolute bottom-6 left-6 flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <div className="text-sm">
                <p className="font-semibold">Sunrise Hatha · Live</p>
                <p className="muted text-xs">18 students practising</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-6 text-center sm:p-8 md:grid-cols-4">
          {[
            ["21+", "live classes / week"],
            ["2,000+", "happy students"],
            ["4.9★", "average rating"],
            ["15 yrs", "teaching experience"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-semibold text-sage-700 dark:text-sage-300">{n}</p>
              <p className="muted mt-1 text-sm">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Class styles */}
      <section id="classes" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="section-eyebrow">Classes</p>
          <h2 className="section-title mt-3">A practice for every body and every mood</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {styles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass group rounded-3xl p-6 transition duration-300 hover:-translate-y-1">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-600/10 text-sage-700 transition group-hover:bg-sage-600 group-hover:text-white dark:text-sage-300">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-5 text-lg font-semibold">{title}</h3>
              <p className="muted mt-2 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6">
        <div className="glass rounded-[2.5rem] p-8 sm:p-12">
          <div className="mb-12 max-w-xl">
            <p className="section-eyebrow">How it works</p>
            <h2 className="section-title mt-3">From sign-up to savasana in 2 minutes</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="relative">
                <span className="font-display text-6xl font-semibold text-sage-600/15 dark:text-white/10">0{i + 1}</span>
                <div className="mt-2 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-clay-500" />
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                </div>
                <p className="muted mt-2 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="section-eyebrow">Stories</p>
          <h2 className="section-title mt-3">Real people, real change</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="glass flex flex-col rounded-3xl p-6">
              <blockquote className="flex-1 leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-600 font-semibold text-white">
                  {t.name[0]}
                </span>
                <div className="text-sm">
                  <p className="font-semibold">{t.name}</p>
                  <p className="muted text-xs">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <p className="section-eyebrow">FAQ</p>
          <h2 className="section-title mt-3">Questions, answered</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="glass group rounded-2xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-xl text-sage-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="muted mt-3 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-sage-700 px-6 py-16 text-center text-sand-50 sm:px-12 dark:bg-sage-800">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-clay-400/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sage-400/30 blur-3xl" />
          <Users className="relative mx-auto h-10 w-10 text-sage-200" />
          <h2 className="font-display relative mt-4 text-3xl font-semibold sm:text-4xl">Your mat is waiting.</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sand-100/80">
            Three days, every class, completely free. See how good your body can feel.
          </p>
          <Link href="/start?plan=3m" className="btn relative mt-8 bg-sand-50 !px-7 !py-3.5 text-base text-sage-800 hover:bg-white">
            Start my free trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
