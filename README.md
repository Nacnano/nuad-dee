1. Project Goal & Purpose 🎯
   The primary goal remains to create a web platform that promotes and facilitates the employment of visually impaired masseurs. The website will serve as a comprehensive ecosystem for training, service booking, and showcasing social impact, connecting masseurs, customers, and partner businesses.

2. Core Functional Requirements ⚙️
   The website must be a hybrid platform combining an e-learning system, a service booking marketplace, and a social impact portal with simulated user roles.

2.1. Training & Education Module (Revised & Expanded)
This module will provide a complete, interactive e-learning experience.

User Flow for Trainees:

Enrollment: A logged-in trainee browses a catalog of available massage courses and clicks "Enroll." This action associates the course with their profile.

Dashboard: After enrolling, the trainee's personal dashboard displays their enrolled courses and a progress bar for each one.

Course Navigation: Clicking an enrolled course leads to a detailed page listing all its lessons and modules (e.g., "Module 1: Theory," "Module 2: Practical Posture"). Completed lessons are clearly marked.

Learning: The trainee clicks on a lesson to start learning.

Theory Lessons: Will display mock video content and text. A "Mark as Complete" button updates their progress.

Practical Lessons: Will lead to the Posture Analysis Feature.

Posture Analysis: On this page, the user will be prompted to "Upload Image for Analysis." This will be a mock file upload. Upon clicking "Analyze," the system will simulate processing and then return mock text feedback (e.g., "✅ Correct posture: Wrist angle is perfect" or "⚠️ Needs adjustment: Lower your shoulder").

Progress Tracking: All actions (enrollment, lesson completion) are saved to localStorage, ensuring the trainee's progress is persistent between sessions.

Booking & Service Platform: Unchanged.

Partnership & Recruitment Section: Unchanged.

Social Impact & Compliance Section: Unchanged.

3. Design, UX & Animation ✨
   This section's goals are unchanged, focusing on a colorful, modern, and animated user interface.

Aesthetic: Colorful & Modern Webpage

Animations: Smooth & Purposeful

Accessibility & Multilingual Support

4. Next.js Frontend Implementation Plan 🚀
   The technical plan is updated to support the detailed training module flow.

Technology Stack

Framework: Next.js (App Router)

Animation Library: Framer Motion

Styling: Tailwind CSS

Data Storage (Revised localStorage Structure)

currentUser: Stores the session info for the logged-in user.

courses: An array of mock course objects, each containing an ID, title, description, and a nested array of lessons. Lessons will have an ID, title, and type ('theory' or 'practice').

traineeProgress: An object that maps userId to their course progress. Example: { "trainee_user_id": { "course_id_1": ["lesson_id_101", "lesson_id_102"] } }

Mock Authentication Flow: Unchanged.

Next.js Folder Structure (Revised for Training Module)

/project-root
│
├── src/
│ ├── app/
│ │ ├── (main)/
│ │ │ ├── training/
│ │ │ │ ├── page.jsx # Course catalog
│ │ │ │ └── [courseId]/
│ │ │ │ ├── page.jsx # Course detail/lesson list
│ │ │ │ └── [lessonId]/
│ │ │ │ └── page.jsx # Individual lesson/posture analysis
│ │ │ ├── dashboard/
│ │ │ │ └── page.jsx # Trainee's dashboard
│ │ │ └── ... (other pages: booking, about, etc.)
│ │ │ └── layout.js
│ │ │
│ │ ├── login/
│ │ │ └── page.jsx
│ │ └── layout.js
│ │
│ ├── components/
│ ├── utils/ # Helper functions, mock data (courses, users)
│
└── ...
Page Breakdown and Functionalities (Updated)

app/(main)/dashboard/page.jsx (Trainee Dashboard): A new, protected page for logged-in trainees. It reads from localStorage (currentUser, courses, traineeProgress) to display enrolled courses and their completion percentage.

app/(main)/training/page.jsx (Course Catalog): Displays all available courses from the mock courses data. An "Enroll" button will update the traineeProgress object in localStorage.

app/(main)/training/[courseId]/page.jsx (Course Detail): A dynamic page that shows the lesson list for a specific course. It will visually distinguish between completed and pending lessons based on traineeProgress.

app/(main)/training/[courseId]/[lessonId]/page.jsx (Lesson Page): The core learning page. It will conditionally render either a mock video/text player (type: 'theory') or the mock Posture Analysis tool (type: 'practice').
