import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Phone, ChefHat, Leaf, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary font-serif">
            XYZ Foods
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/menu">
              <Button variant="default">View Menu</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Authentic Nigerian Cuisine
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 font-serif leading-tight">
            Taste the Soul of<br />
            <span className="text-primary">Nigeria</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            From jollof rice to continental favorites, experience a fusion of African warmth 
            and global flavors crafted with love and tradition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <Button size="lg" className="text-lg px-8 py-6">
                Explore Our Menu
              </Button>
            </Link>
            <Link to="/menu?tab=reservation">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Make a Reservation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif">
            Why Choose XYZ Foods?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-serif">Expert Chefs</h3>
                <p className="text-muted-foreground">
                  Our chefs bring decades of experience in both traditional Nigerian 
                  and continental cuisine.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-serif">Fresh Ingredients</h3>
                <p className="text-muted-foreground">
                  We source the freshest local and imported ingredients to ensure 
                  authentic flavors in every dish.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-serif">Global Fusion</h3>
                <p className="text-muted-foreground">
                  African, Continental, and International dishes — all under one roof 
                  for every palate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Our Signature Dishes
          </h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            A glimpse of what awaits you at XYZ Foods
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: "Jollof Rice", category: "Nigerian", time: "25 min" },
              { name: "Pounded Yam & Egusi", category: "Nigerian", time: "30 min" },
              { name: "Grilled Chicken", category: "Continental", time: "20 min" },
              { name: "Spaghetti Bolognese", category: "Italian", time: "18 min" },
            ].map((dish) => (
              <Card key={dish.name} className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <ChefHat className="w-12 h-12 text-primary/50 group-hover:scale-110 transition-transform" />
                </div>
                <CardContent className="pt-4">
                  <span className="text-xs text-primary font-medium">{dish.category}</span>
                  <h3 className="text-lg font-semibold font-serif">{dish.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-2">
                    <Clock className="w-4 h-4" /> {dish.time}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link to="/menu">
            <Button size="lg" className="text-lg px-8">
              View Full Menu
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-serif">Location</h3>
              <p className="opacity-90">123 Lagos Street, Victoria Island</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-serif">Hours</h3>
              <p className="opacity-90">Mon - Sun: 10:00 AM - 10:00 PM</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-serif">Contact</h3>
              <p className="opacity-90">+234 801 234 5678</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-foreground text-background">
        <div className="container mx-auto text-center">
          <p className="opacity-70">© 2026 XYZ Foods. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
