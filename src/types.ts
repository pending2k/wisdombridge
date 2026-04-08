export type UserRole = 'mentor' | 'mentee' | 'admin';
export type MentorStatus = 'active' | 'inactive' | 'pending';
export type SessionStatus = 'requested' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  country?: string;
  language?: string;
  createdAt: string;
}

export interface MentorProfile {
  userId: string;
  title: string;
  description: string;
  domains: string[];
  experience: string;
  price: number;
  currency: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  status: MentorStatus;
  maxMentees: number;
  activeMentees: number;
  photoUrl?: string;
}

export interface MenteeProfile {
  userId: string;
  goals: string;
  level: string;
  preferences: string;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  date: string;
  duration: number;
  status: SessionStatus;
  videoLink?: string;
  notes?: string;
  objective?: string;
  mentorName?: string;
  menteeName?: string;
}

export interface Review {
  id: string;
  sessionId: string;
  mentorId: string;
  menteeId: string;
  rating: number;
  text: string;
  createdAt: string;
  menteeName?: string;
}

export interface Availability {
  mentorId: string;
  slots: {
    day: number; // 0-6
    start: string; // HH:mm
    end: string; // HH:mm
  }[];
  timezone: string;
}
