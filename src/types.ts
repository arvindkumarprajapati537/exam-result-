export type PostCategory =
  | 'latest-jobs'
  | 'results'
  | 'admit-card'
  | 'answer-key'
  | 'syllabus'
  | 'admissions'
  | 'important-links'
  | 'latest-updates';

export type PostStatus = 'draft' | 'published';

export interface ImportantDates {
  applicationBegin: string;
  lastDate: string;
  feePaymentLastDate?: string;
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
  correctionDate?: string;
}

export interface ApplicationFee {
  generalObc: string;
  scSt: string;
  phFemale?: string;
  paymentMode: string;
  notes?: string;
}

export interface AgeLimit {
  minAge?: number | string;
  maxAge?: number | string;
  asOfDate?: string;
  relaxationDetails?: string;
}

export interface VacancyItem {
  id?: string;
  postName: string;
  totalPosts: string | number;
  ur?: string | number;
  obc?: string | number;
  ews?: string | number;
  sc?: string | number;
  st?: string | number;
  eligibility: string;
}

export interface ImportantLink {
  id?: string;
  label: string;
  url: string;
  type: 'apply' | 'notification' | 'official' | 'admit_card' | 'result' | 'answer_key' | 'syllabus' | 'correction' | 'other';
  badge?: string;
}

export interface PhysicalEligibilityItem {
  id?: string;
  category: string; // e.g. "Height", "Chest", "Running", "Long Jump"
  male: string;
  female: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: PostCategory;
  organization: string;
  advtNo?: string; // e.g. "01/2026", "CEN 05/2026"
  stateOrCentral: string; // e.g. "Central Government", "Uttar Pradesh", "Bihar", "Rajasthan", "Delhi", "All India"
  qualification: string; // e.g. "10th Pass", "12th Pass", "Graduate", "Diploma", "B.Tech/BE", "Post Graduate", "Other"
  totalVacancies?: string | number;
  shortDescription: string;
  content?: string;
  importantDates: ImportantDates;
  applicationFee: ApplicationFee;
  ageLimit: AgeLimit;
  vacancyDetails: VacancyItem[];
  physicalEligibility?: PhysicalEligibilityItem[];
  eligibilitySummary?: string;
  howToApply: string[];
  importantLinks: ImportantLink[];
  officialWebsite?: string;
  status: PostStatus;
  isFeatured?: boolean;
  views?: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: PostCategory;
  name: string;
  slug: string;
  tagline: string;
  color: string;
  bgLight: string;
  borderColor: string;
  badgeBg: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  savedPostIds?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface PortalStats {
  totalPosts: number;
  totalJobs: number;
  totalResults: number;
  totalAdmitCards: number;
  totalAnswerKeys: number;
  totalAdmissions: number;
  totalSyllabus: number;
  totalUpdates: number;
  totalViews: number;
}

export interface SearchFilters {
  query: string;
  category: string;
  state: string;
  qualification: string;
  sortBy: 'latest' | 'closing-soon' | 'vacancies' | 'popular';
}
