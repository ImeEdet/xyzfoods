import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, ChefHat, Leaf, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import heroJollof from "@/assets/hero-jollof.jpg";
import storyChef from "@/assets/story-chef.jpg";
import dishJollof from "@/assets/dish-jollof.jpg";
import dishEgusi from "@/assets/dish-egusi.jpg";
import dishGrill from "@/assets/dish-grill.jpg";
import dishPasta from "@/assets/dish-pasta.jpg";

const signatureDishes = [
  { name: "Jollof Rice & Chicken", category: "Nigerian", time: "25 min", img: dishJollof, span: "lg:row-span-2 lg:col-span-2" },
  { name: "Pounded Yam & Egusi", category: "Nigerian", time: "30 min", img: dishEgusi, span: "" },
  { name: "Grilled Chicken", category: "Continental", time: "20 min", img: dishGrill, span: "" },
  { name: "Spaghetti Bolognese", category: "Italian", time: "18 min", img: dishPasta, span: "lg:col-span-2" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-primary tracking-tight">
            XYZ <span className="text-foreground">Foods</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="hidden sm:inline text-sm text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/menu?tab=reservation" className="hidden sm:inline text-sm text-foreground hover:text-primary transition-colors font-medium">
              Reserve
            </Link>
            <Link to="/menu">
              <Button size="sm" className="rounded-full px-5 gradient-sun text-primary-foreground border-0 shadow-warm hover:opacity-90">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={heroJollof}
            alt="Plate of Nigerian jollof rice with grilled chicken and plantain"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 pattern-ankara opacity-40" />
        </div>

        <div className="relative container mx-auto px-4 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="eyebrow"><span className="gold-rule" />Authentic Nigerian Kitchen</span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.95] mt-5 text-foreground">
              Taste the soul of <em className="not-italic text-primary">Nigeria.</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mt-6 leading-relaxed">
              From smoky jollof to continental classics — a fusion of African warmth and global flavour, plated with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/menu">
                <Button size="lg" className="rounded-full px-8 h-14 text-base gradient-sun text-primary-foreground border-0 shadow-warm hover:opacity-95">
                  Explore the menu <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/menu?tab=reservation">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-foreground/20 hover:bg-foreground/5">
                  Reserve a table
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story strip */}
      <section className="py-20 md:py-28 px-4 bg-background">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <img
              src={storyChef}
              alt="XYZ Foods chef plating a dish"
              className="w-full aspect-[4/5] object-cover rounded-sm shadow-card"
              loading="lazy"
              width={1024}
              height={1280}
            />
            <div className="absolute -bottom-6 -right-6 hidden md:block w-40 h-40 gradient-sun rounded-sm shadow-warm -z-10" />
          </motion.div>

          <div>
            <span className="eyebrow"><span className="gold-rule" />Our Story</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight">
              Cooked the way<br/>grandma did it — <em className="not-italic text-primary">only finer.</em>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Every dish at XYZ Foods is a love letter to West African heritage — refined through decades of kitchen craft and a deep respect for the table.
            </p>

            <ul className="mt-8 space-y-6">
              {[
                { n: "01", icon: ChefHat, t: "Master chefs", d: "Trained in both pepper soup and pasta — fluent in flavour from Lagos to Lombardy." },
                { n: "02", icon: Leaf, t: "Living ingredients", d: "Sourced daily from local markets so every plate tastes alive." },
                { n: "03", icon: Globe, t: "Borderless menu", d: "Nigerian, Continental, Italian — served under one warm roof." },
              ].map(({ n, icon: Icon, t, d }) => (
                <li key={n} className="flex gap-5">
                  <span className="font-display text-2xl text-accent w-10 shrink-0">{n}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" /> {t}
                    </h3>
                    <p className="text-muted-foreground mt-1">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="py-20 md:py-28 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="eyebrow"><span className="gold-rule" />Signature Plates</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 leading-tight">
                A glimpse of<br/>what awaits.
              </h2>
            </div>
            <Link to="/menu" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              View full menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 md:gap-5 auto-rows-[260px]">
            {signatureDishes.map((dish, i) => (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-sm shadow-card ${dish.span}`}
              >
                <img
                  src={dish.img}
                  alt={dish.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-background">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-accent font-medium">{dish.category}</span>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold mt-1">{dish.name}</h3>
                  <p className="text-xs opacity-80 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {dish.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact band */}
      <section className="relative py-20 px-4 gradient-forest text-background overflow-hidden">
        <div className="absolute inset-0 pattern-ankara opacity-30" />
        <div className="relative container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-accent">
              <span className="inline-block w-10 h-px bg-accent align-middle mr-3" />Visit us
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Come share the table.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {[
              { icon: MapPin, t: "Location", d: "123 Lagos Street, Victoria Island" },
              { icon: Clock, t: "Open Daily", d: "Mon – Sun · 10:00 – 22:00" },
              { icon: Phone, t: "Reservations", d: "+234 801 234 5678" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border border-accent/40 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold">{t}</h3>
                <div className="w-8 h-px bg-accent/60 my-3" />
                <p className="opacity-85 text-sm">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-foreground text-background">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-display text-lg">
            XYZ <span className="text-accent">Foods</span>
          </p>
          <p className="text-xs opacity-70">© 2026 XYZ Foods. Made with fire and love.</p>
          <a href="/admin/login" className="text-xs opacity-70 hover:opacity-100 underline">Staff login</a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
