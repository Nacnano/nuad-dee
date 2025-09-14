import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Heart,
  Briefcase,
  Award,
  TrendingUp,
  Globe,
  Building,
  GraduationCap,
  Target,
  Calendar,
} from "lucide-react";

const Impact = () => {
  const impactStats = [
    {
      title: "Lives Transformed",
      value: "1,247",
      change: "+23%",
      description: "Visually impaired individuals trained and employed",
      icon: Users,
      color: "text-healing",
    },
    {
      title: "Client Sessions",
      value: "45,892",
      change: "+34%",
      description: "Therapeutic sessions provided to community",
      icon: Heart,
      color: "text-primary",
    },
    {
      title: "Partner Businesses",
      value: "156",
      change: "+28%",
      description: "Companies supporting inclusive employment",
      icon: Building,
      color: "text-secondary",
    },
    {
      title: "Job Placements",
      value: "89%",
      change: "+12%",
      description: "Graduate employment rate within 6 months",
      icon: Briefcase,
      color: "text-wellness",
    },
  ];

  const programs = [
    {
      name: "Professional Training",
      description: "Comprehensive massage therapy education",
      participants: 324,
      completion: 87,
      outcomes: "95% employment rate",
    },
    {
      name: "Corporate Wellness",
      description: "Workplace massage programs",
      participants: 892,
      completion: 94,
      outcomes: "40% stress reduction",
    },
    {
      name: "Community Outreach",
      description: "Free sessions for underserved communities",
      participants: 567,
      completion: 92,
      outcomes: "15,000+ sessions donated",
    },
  ];

  const testimonials = [
    {
      name: "David Kim",
      role: "Training Graduate",
      company: "Self-employed",
      quote:
        "This program changed my life completely. I went from unemployment to running my own successful practice.",
      impact: "Now earns $65,000/year",
      avatar: "👨‍⚕️",
    },
    {
      name: "Rachel Torres",
      role: "HR Director",
      company: "TechCorp Solutions",
      quote:
        "Our workplace wellness program has dramatically improved employee satisfaction and reduced sick days.",
      impact: "30% reduction in stress leave",
      avatar: "👩‍💼",
    },
    {
      name: "Maria Santos",
      role: "Program Graduate",
      company: "Healing Hands Spa",
      quote:
        "The adaptive training methods made learning possible for me. I now help train other visually impaired therapists.",
      impact: "Trained 47 new therapists",
      avatar: "👩‍⚕️",
    },
  ];

  const partnerships = [
    { name: "Microsoft", type: "Corporate Wellness", employees: 1200 },
    {
      name: "City Health Department",
      type: "Community Programs",
      employees: 800,
    },
    { name: "Amazon", type: "Employee Benefits", employees: 2500 },
    { name: "Local Schools District", type: "Staff Wellness", employees: 450 },
    { name: "Nonprofit Alliance", type: "Social Impact", employees: 300 },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">
            Social Impact & Results
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Measuring our success through lives transformed, communities served,
            and barriers broken in the massage therapy industry.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <Card
              key={index}
              className="card-hover border-0 shadow-medium text-center"
            >
              <CardContent className="p-6">
                <div className="bg-gradient-primary p-3 rounded-2xl w-fit mx-auto mb-4">
                  <stat.icon className={`h-8 w-8 text-primary-foreground`} />
                </div>
                <div className="text-3xl font-bold text-gradient-primary mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{stat.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Program Results */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gradient-primary mb-8 text-center">
            Program Results
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <Card key={index} className="card-hover border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-6 w-6 mr-2 text-healing" />
                    {program.name}
                  </CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Participants</span>
                        <span className="font-semibold">
                          {program.participants}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completion Rate</span>
                        <span className="font-semibold">
                          {program.completion}%
                        </span>
                      </div>
                      <Progress value={program.completion} className="h-2" />
                    </div>

                    <div className="bg-background-secondary p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">
                        Key Outcome
                      </div>
                      <div className="font-semibold text-gradient-healing">
                        {program.outcomes}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gradient-primary mb-8 text-center">
            Success Stories
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover border-0 shadow-medium">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{testimonial.avatar}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription>
                        {testimonial.role} at {testimonial.company}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-muted-foreground italic mb-4 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="bg-gradient-healing p-3 rounded-lg">
                    <div className="text-sm text-healing-foreground">
                      <strong>Impact:</strong> {testimonial.impact}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Partner Network */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient-primary mb-4">
              Our Partner Network
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Working with leading organizations to create inclusive employment
              opportunities and expand access to quality massage therapy
              services.
            </p>
          </div>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerships.map((partner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background-secondary rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">{partner.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {partner.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {partner.employees}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        employees
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Goals & Future */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gradient-primary mb-6">
                2025 Goals
              </h2>
              <div className="space-y-6">
                {[
                  { goal: "Train 500 new therapists", progress: 65 },
                  { goal: "Partner with 100 new businesses", progress: 42 },
                  { goal: "Serve 75,000 client sessions", progress: 58 },
                  { goal: "Expand to 3 new cities", progress: 25 },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.goal}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.progress}%
                      </span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-medium bg-gradient-soft">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-healing mr-3" />
                  <h3 className="text-2xl font-bold text-gradient-healing">
                    Our Mission
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  To create a world where visual impairment is not a barrier to
                  meaningful employment, where skilled massage therapists can
                  thrive professionally while providing exceptional healing
                  services to their communities.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-healing mr-1" />
                    <span>Global Impact</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-healing mr-1" />
                    <span>Since 2019</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <Card className="border-0 shadow-medium bg-gradient-hero text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">Join Our Impact</h3>
            <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
              Whether you're looking to start your career, hire skilled
              therapists, or support our mission, there's a place for you in our
              community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
              >
                Get Involved
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-primary hover:bg-white/10 text-lg px-8 py-4"
              >
                Partner With Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Impact;
