export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "customer" | "trainee" | "therapist";
  name: string;
}

export interface Trainee {
  id: string;
  userId: string;
  progress: number;
  completedLessons: string[];
  certificates: string[];
}

export interface Therapist {
  id: string;
  userId: string;
  location: string;
  skills: string[];
  price: number;
  rating: number;
  reviews: number;
  availability: string[];
}

export interface Booking {
  id: string;
  customerId: string;
  therapistId: string;
  date: string;
  time: string;
  service: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  price: number;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
  joinedDate: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  {
    id: "2",
    username: "customer1",
    password: "pass123",
    role: "customer",
    name: "John Doe",
  },
  {
    id: "3",
    username: "trainee1",
    password: "pass123",
    role: "trainee",
    name: "Jane Smith",
  },
  {
    id: "4",
    username: "therapist1",
    password: "pass123",
    role: "therapist",
    name: "Somchai J.",
  },
];

export const mockTherapists: Therapist[] = [
  {
    id: "1",
    userId: "4",
    location: "Bangkok",
    skills: ["Traditional Thai Massage", "Oil Massage", "Foot Massage"],
    price: 500,
    rating: 4.8,
    reviews: 156,
    availability: ["Monday", "Wednesday", "Friday"],
  },
  // Add more mock therapists as needed
];

export const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Bangkok Hospital",
    logo: "/images/partners/bh-logo.png",
    description: "Leading healthcare provider in Thailand",
    joinedDate: "2024-01-01",
  },
  {
    id: "2",
    name: "Wellness Group",
    logo: "/images/partners/wg-logo.png",
    description: "Spa and wellness chain",
    joinedDate: "2024-02-15",
  },
];

export const mockImpactStats = {
  jobsCreated: 450,
  activeTherapists: 380,
  partnersJoined: 25,
  customersServed: 15000,
  goalJobs: 7000,
  targetYear: 2027,
};

export const mockTrainingModules = [
  {
    id: "1",
    title: "Basic Massage Techniques",
    description: "Learn the fundamental techniques of traditional Thai massage",
    duration: "4 weeks",
    lessons: [
      {
        id: "l1",
        title: "Introduction to Thai Massage",
        type: "video",
        duration: "45 minutes",
      },
      {
        id: "l2",
        title: "Basic Posture and Movement",
        type: "interactive",
        duration: "60 minutes",
      },
    ],
  },
  // Add more modules as needed
];
