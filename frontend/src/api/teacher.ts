import api from "./axios";

export type TeacherCourse = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  averageRating: number;
  enrollmentCount: number;
  createdAt: string;
  lectures: TeacherLecture[];
};

export type TeacherLecture = {
  id: number;
  title: string;
  videoUrl: string;
  duration: number;
  sequence: number;
};

export type DailyEnrollment = {
  date: string;
  count: number;
};

export type CourseStatsItem = {
  courseId: number;
  title: string;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  avgProgress: number;
};

export type StudentItem = {
  enrollmentId: number;
  userId: number;
  userEmail: string;
  userName: string;
  totalProgress: number;
  enrolledAt: string;
};

export type Profile = {
  id: number;
  email: string;
  name: string;
  bio: string;
  role: string;
};

export type CourseCreateBody = {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  lectures?: {
    title: string;
    videoUrl: string;
    duration: number;
    sequence: number;
  }[];
};

export type CourseUpdateBody = Partial<Omit<CourseCreateBody, "lectures">>;

export type LectureAddBody = {
  title: string;
  videoUrl: string;
  duration: number;
  sequence: number;
};

export const getProfile = async (): Promise<Profile> => {
  const { data } = await api.get("/teacher/profile");
  return data;
};

export const updateProfile = async (body: {
  name?: string;
  bio?: string;
}): Promise<Profile> => {
  const { data } = await api.patch("/teacher/profile", body);
  return data;
};

export const getTeacherCourses = async (): Promise<TeacherCourse[]> => {
  const { data } = await api.get("/teacher/courses");
  return data;
};

export const getTeacherCourse = async (
  courseId: number,
): Promise<TeacherCourse> => {
  const { data } = await api.get(`/teacher/courses/${courseId}`);
  return data;
};

export const createCourse = async (
  body: CourseCreateBody,
): Promise<TeacherCourse> => {
  const { data } = await api.post("/teacher/courses", body);
  return data;
};

export const updateCourse = async (
  courseId: number,
  body: CourseUpdateBody,
): Promise<TeacherCourse> => {
  const { data } = await api.patch(`/teacher/courses/${courseId}`, body);
  return data;
};

export const deleteCourse = async (courseId: number): Promise<void> => {
  await api.delete(`/teacher/courses/${courseId}`);
};

export const addLecture = async (
  courseId: number,
  body: LectureAddBody,
): Promise<TeacherLecture> => {
  const { data } = await api.post(
    `/teacher/courses/${courseId}/lectures`,
    body,
  );
  return data;
};

export const deleteLecture = async (
  courseId: number,
  lectureId: number,
): Promise<void> => {
  await api.delete(`/teacher/courses/${courseId}/lectures/${lectureId}`);
};

export const getCourseStats = async (): Promise<CourseStatsItem[]> => {
  const { data } = await api.get("/teacher/stats");
  return data;
};

export const getDailyEnrollments = async (): Promise<DailyEnrollment[]> => {
  const { data } = await api.get("/teacher/stats/daily-enrollments");
  return data;
};

export const getCourseStudents = async (
  courseId: number,
): Promise<StudentItem[]> => {
  const { data } = await api.get(`/teacher/courses/${courseId}/students`);
  return data;
};

export const getCourseReviewsTeacher = async (courseId: number) => {
  const { data } = await api.get(`/teacher/courses/${courseId}/reviews`);
  return data;
};
