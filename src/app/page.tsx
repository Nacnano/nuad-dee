"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Star, Users, Clock, Heart, Award, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-massage.jpg";
import trainingImage from "@/assets/training-class.jpg";

export default function HomePage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: "500+", label: "Trained Therapists", icon: Users },
    { number: "15,000+", label: "Happy Clients", icon: Heart },
    { number: "98%", label: "Satisfaction Rate", icon: Star },
    { number: "24/7", label: "Support Available", icon: Clock },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Regular Client",
      content:
        "The quality of massage therapy is exceptional. The therapists are so skilled and professional.",
      rating: 5,
      avatar: "👩‍💼",
    },
    {
      name: "Michael Rodriguez",
      role: "Corporate Partner",
      content:
        "We provide workplace wellness sessions for our employees. Outstanding service every time.",
      rating: 5,
      avatar: "👨‍💼",
    },
    {
      name: "Emily Watson",
      role: "Training Graduate",
      content:
        "The training program transformed my life. I found meaningful work and gained independence.",
      rating: 5,
      avatar: "👩‍⚕️",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <img
          src={heroImage.src}
          alt="Professional massage therapy session"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
              🌟 Empowering Lives Through Healing Touch
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Professional
              <span className="block text-gradient-primary bg-gradient-to-r from-accent-glow to-healing-glow bg-clip-text text-transparent">
                Massage Therapy
              </span>
              by Skilled Visually Impaired Therapists
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience exceptional therapeutic massage while supporting
              meaningful employment and social inclusion in our community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="btn-hero text-lg px-8 py-4">
                <Link href="/services">Book Your Session</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20 text-lg px-8 py-4"
              >
                <Link href="/training">Join Our Training</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <Heart className="h-8 w-8 text-healing-glow" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center card-hover animate-on-scroll border-0 shadow-soft"
              >
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-2xl w-fit mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-gradient-primary mb-2">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gradient-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gradient-primary mb-4">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional therapeutic services tailored to your wellness needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Therapeutic Massage",
                description:
                  "Deep tissue and relaxation massage for pain relief and stress reduction",
                icon: "💆‍♀️",
                price: "From $80",
              },
              {
                title: "Corporate Wellness",
                description:
                  "On-site massage services for workplace wellness programs",
                icon: "🏢",
                price: "Custom pricing",
              },
              {
                title: "Home Visits",
                description:
                  "Convenient in-home massage services in the comfort of your space",
                icon: "🏠",
                price: "From $100",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="card-hover animate-on-scroll border-0 shadow-medium"
              >
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gradient-healing">
                      {service.price}
                    </span>
                    <Button className="btn-healing">Learn More</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <h2 className="text-4xl font-bold text-gradient-primary mb-6">
                Professional Training Programs
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                We provide comprehensive massage therapy training specifically
                designed for visually impaired individuals, combining
                traditional techniques with adaptive learning methods.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Certified professional curriculum",
                  "Adaptive learning techniques",
                  "Job placement assistance",
                  "Ongoing support and mentorship",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="bg-gradient-healing p-1 rounded-full">
                      <Award className="h-4 w-4 text-healing-foreground" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="btn-healing text-lg px-6 py-3">
                <Link href="/training">Explore Training</Link>
              </Button>
            </div>

            <div className="animate-on-scroll">
              <img
                src={trainingImage.src}
                alt="Massage therapy training classroom"
                className="rounded-2xl shadow-strong w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-20 bg-gradient-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gradient-primary mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from clients, partners, and graduates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="card-hover animate-on-scroll border-0 shadow-medium"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-accent fill-accent"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Healing Touch?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Book your session today and support meaningful employment in our
            community
          </p>
          <Button asChild size="lg" className="btn-hero text-lg px-8 py-4">
            <Link href="/services">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
