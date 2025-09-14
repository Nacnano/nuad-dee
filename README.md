# Nuad Dee - Massage Training Platform

A comprehensive web platform that promotes and facilitates the employment of visually impaired masseurs. The website serves as a complete ecosystem for training, service booking, and showcasing social impact, connecting masseurs, customers, and partner businesses.

## 🚀 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: Bun
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animation**: Framer Motion (ready to integrate)
- **Language**: TypeScript

## ✨ Features

### Training & Education Module

- Interactive e-learning experience
- Course enrollment and progress tracking
- Theory lessons with mock video content
- Practical lessons with real-time posture analysis
- Adaptive learning techniques for visually impaired learners

### Service Booking Platform

- Professional massage therapy services
- Therapist profiles and specialties
- Booking system with availability
- Corporate wellness programs
- Home visit services

### Social Impact Portal

- Success stories and testimonials
- Impact metrics and statistics
- Partner network showcase
- Community outreach programs

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nuad-dee
```

2. Install dependencies:

```bash
bun install
```

3. Run the development server:

```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # User dashboard
│   ├── impact/           # Social impact page
│   ├── login/            # Authentication
│   ├── services/         # Service booking
│   ├── training/         # Training courses
│   │   ├── [courseId]/   # Dynamic course pages
│   │   └── [lessonId]/   # Dynamic lesson pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   └── Navbar.tsx       # Navigation component
├── hooks/               # Custom React hooks
│   └── useAuth.ts       # Authentication logic
├── lib/                 # Utility functions
└── assets/              # Static assets
```

## 🎯 Key Features

### Mock Authentication

- Demo accounts available for testing
- Role-based access (Customer, Therapist, Admin)
- Persistent login state with localStorage

### Course Management

- Dynamic course creation and enrollment
- Progress tracking with localStorage
- Theory and practical lesson types
- Posture analysis simulation

### Responsive Design

- Mobile-first approach
- Accessible design patterns
- Smooth animations and transitions
- Modern UI with Tailwind CSS

## 🔧 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint

## 🌟 Demo Accounts

For testing purposes, use these demo accounts:

- **Customer**: sarah@example.com (password: demo123)
- **Therapist**: david@therapist.com (password: demo123)
- **Admin**: admin@nueddee.com (password: demo123)

## 📱 Pages

- **Home** (`/`) - Landing page with hero section and features
- **Services** (`/services`) - Therapist directory and booking
- **Training** (`/training`) - Course catalog and enrollment
- **Dashboard** (`/dashboard`) - User progress and enrolled courses
- **Impact** (`/impact`) - Social impact metrics and stories
- **Login** (`/login`) - Authentication page

## 🎨 Design System

The platform uses a custom design system with:

- Healing-focused color palette
- Accessible contrast ratios
- Smooth animations and micro-interactions
- Responsive grid layouts
- Modern typography

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js and the App Router
- UI components from shadcn/ui
- Icons from Lucide React
- Styling with Tailwind CSS
