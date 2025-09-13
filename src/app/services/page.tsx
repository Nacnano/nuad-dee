"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  MapPin,
  Star,
  Search,
  Filter,
  Calendar,
  User,
  Heart,
  Award,
  Phone,
  Mail,
} from "lucide-react";

interface Therapist {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  avatar: string;
  bio: string;
  rates: {
    "60min": number;
    "90min": number;
    "120min": number;
  };
  availability: string[];
}

export default function ServicesPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Mock therapist data
    const mockTherapists: Therapist[] = [
      {
        id: "1",
        name: "David Chen",
        specialties: ["Deep Tissue", "Sports Massage", "Injury Recovery"],
        rating: 4.9,
        reviews: 127,
        experience: "8 years",
        location: "Downtown",
        avatar: "👨‍⚕️",
        bio: "Specialized in therapeutic massage with focus on sports injury recovery and deep tissue work.",
        rates: { "60min": 80, "90min": 110, "120min": 140 },
        availability: ["Mon", "Wed", "Fri", "Sat"],
      },
      {
        id: "2",
        name: "Maria Santos",
        specialties: ["Relaxation", "Prenatal", "Aromatherapy"],
        rating: 4.8,
        reviews: 94,
        experience: "6 years",
        location: "Midtown",
        avatar: "👩‍⚕️",
        bio: "Expert in relaxation techniques and prenatal massage, creating a peaceful healing environment.",
        rates: { "60min": 75, "90min": 105, "120min": 135 },
        availability: ["Tue", "Thu", "Fri", "Sun"],
      },
      {
        id: "3",
        name: "James Wilson",
        specialties: ["Swedish", "Hot Stone", "Reflexology"],
        rating: 4.9,
        reviews: 156,
        experience: "10 years",
        location: "Uptown",
        avatar: "👨‍⚕️",
        bio: "Traditional Swedish massage expert with specialty in hot stone therapy and reflexology.",
        rates: { "60min": 85, "90min": 115, "120min": 145 },
        availability: ["Mon", "Tue", "Thu", "Sat"],
      },
      {
        id: "4",
        name: "Lisa Chang",
        specialties: ["Corporate Wellness", "Chair Massage", "Stress Relief"],
        rating: 4.7,
        reviews: 89,
        experience: "5 years",
        location: "Business District",
        avatar: "👩‍⚕️",
        bio: "Specializes in corporate wellness programs and on-site chair massage services.",
        rates: { "60min": 70, "90min": 100, "120min": 130 },
        availability: ["Mon", "Wed", "Thu", "Fri"],
      },
    ];

    setTherapists(mockTherapists);
    setFilteredTherapists(mockTherapists);
  }, []);

  useEffect(() => {
    let filtered = therapists;

    if (searchTerm) {
      filtered = filtered.filter(
        (therapist) =>
          therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          therapist.specialties.some((specialty) =>
            specialty.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (specialtyFilter !== "all") {
      filtered = filtered.filter((therapist) =>
        therapist.specialties.some((specialty) =>
          specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
        )
      );
    }

    setFilteredTherapists(filtered);
  }, [searchTerm, specialtyFilter, therapists]);

  const handleBooking = (therapistId: string, therapistName: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book a session",
        variant: "destructive",
      });
      return;
    }

    // Mock booking logic
    toast({
      title: "Booking Initiated",
      description: `Booking session with ${therapistName}. You will be contacted to confirm your appointment.`,
      variant: "default",
    });
  };

  const allSpecialties = [...new Set(therapists.flatMap((t) => t.specialties))];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">
            Professional Massage Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Book sessions with our certified visually impaired massage
            therapists. Each session supports meaningful employment and
            exceptional healing.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-card rounded-2xl shadow-soft border-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search therapists or specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="md:w-64">
              <Select
                value={specialtyFilter}
                onValueChange={setSpecialtyFilter}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {allSpecialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty.toLowerCase()}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: "In-Home Sessions",
              description: "Professional massage in the comfort of your home",
              icon: "🏠",
              features: [
                "Premium equipment",
                "Travel included",
                "Flexible scheduling",
              ],
              startingPrice: 100,
            },
            {
              title: "Corporate Wellness",
              description: "On-site massage for workplace wellness programs",
              icon: "🏢",
              features: ["Group sessions", "Chair massage", "Regular programs"],
              startingPrice: 150,
            },
            {
              title: "Clinic Sessions",
              description: "Visit our professional massage therapy clinics",
              icon: "🏥",
              features: ["Full facilities", "All modalities", "Spa amenities"],
              startingPrice: 70,
            },
          ].map((service, index) => (
            <Card key={index} className="card-hover border-0 shadow-medium">
              <CardHeader>
                <div className="text-4xl mb-2">{service.icon}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Heart className="h-4 w-4 text-healing mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gradient-healing">
                    From ${service.startingPrice}
                  </span>
                  <Button className="btn-healing">Learn More</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Therapists Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gradient-primary mb-6">
            Our Certified Therapists
          </h2>

          {filteredTherapists.length === 0 ? (
            <Card className="text-center py-12 border-0 shadow-soft">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No therapists found matching your criteria. Try adjusting your
                  search.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTherapists.map((therapist) => (
                <Card
                  key={therapist.id}
                  className="card-hover border-0 shadow-medium"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl">{therapist.avatar}</span>
                      <div>
                        <CardTitle className="text-lg">
                          {therapist.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-accent fill-accent" />
                            <span className="text-sm font-medium ml-1">
                              {therapist.rating}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({therapist.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {therapist.specialties.map((specialty, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {therapist.bio}
                    </p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-healing mr-2" />
                        <span>{therapist.experience} experience</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-healing mr-2" />
                        <span>{therapist.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-healing mr-2" />
                        <span>
                          Available: {therapist.availability.join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="bg-background-secondary p-3 rounded-lg mb-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Starting rates:
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>60min: ${therapist.rates["60min"]}</span>
                        <span>90min: ${therapist.rates["90min"]}</span>
                        <span>120min: ${therapist.rates["120min"]}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() =>
                          handleBooking(therapist.id, therapist.name)
                        }
                        className="flex-1 btn-healing"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Session
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-card-hover"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <Card className="border-0 shadow-medium bg-gradient-soft">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gradient-primary mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our customer service team can help you find the perfect therapist
              for your specific needs and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="btn-healing">
                <Phone className="h-4 w-4 mr-2" />
                Call (555) 123-HEAL
              </Button>
              <Button variant="outline" className="hover:bg-card-hover">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
