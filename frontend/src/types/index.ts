export type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  teacherName: string;
  category: string;
  level: string;
  rating: number;
};

export type CoursePageResponse = {
  content: Course[];
  page: number;
  size: number;
  totalElements: number;
};

export type Review = {
  reviewId: number;
  courseId: number;
  userId: number;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type CourseDetail = {
  id: number;
  title: string;
  description: string;
  price: number;
  teacherId: number;
  teacherName: string;
  category: string;
  level: string;
  lectureCount: number;
  averageRating: number;
  reviewCount: number;
};

export type Lecture = {
  id: number;
  title: string;
  videoUrl: string;
  duration: number;
};
