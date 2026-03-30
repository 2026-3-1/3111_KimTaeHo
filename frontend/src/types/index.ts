export type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  teacherName: string;
  category: string;
  level: string;
  averageRating: number; // rating, avarageRating 제거 후 통일
};

export type CoursePageResponse = {
  content: Course[];
  page: number;
  size: number;
  totalElements: number;
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
  // 강의에 포함된 각 강좌(lecture)
  id: number;
  title: string;
  videoUrl: string;
  duration: number;
};

export type Review = {
  // 강의에 대한 리뷰
  reviewId: number;
  courseId: number;
  userId: number;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type MyEnrollment = {
  // 사용자가 수강 중인 강의 정보
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  coursePrice: number;
  teacherName: string;
  totalProgress: number;
  lastWatchedLectureTitle: string | null;
};
