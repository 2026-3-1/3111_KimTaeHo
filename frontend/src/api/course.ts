import api from "./axios";
import type {
  CoursePageResponse,
  CourseDetail,
  Lecture,
  Review,
  MyEnrollment,
} from "../types";

export const getCourses = async (
  params: Record<string, string>,
): Promise<CoursePageResponse> => {
  const { data } = await api.get("/courses", { params });
  return data;
};

export const getCourse = async (courseId: number): Promise<CourseDetail> => {
  const { data } = await api.get(`/courses/${courseId}`);
  return data;
};

export const getLectures = async (courseId: number): Promise<Lecture[]> => {
  const { data } = await api.get(`/courses/${courseId}/lectures`);
  return data;
};

export const getReviews = async (courseId: number): Promise<Review[]> => {
  const { data } = await api.get("/reviews", { params: { courseId } });
  return data;
};

export const enroll = async (
  userId: number,
  courseId: number,
): Promise<void> => {
  await api.post("/enrollments", { userId, courseId });
};

export const getMyEnrollments = async (
  userId: number,
): Promise<MyEnrollment[]> => {
  const { data } = await api.get("/enrollments/my", { params: { userId } });
  return data;
};

export const updateProgress = async (
  enrollmentId: number,
  body: { userId: number; lastWatchedLectureId: number; currentProgress: number },
): Promise<void> => {
  await api.patch(`/enrollments/${enrollmentId}/progress`, body);
};

export const postReview = async (body: {
  courseId: number;
  userId: number;
  rating: number;
  comment: string;
}): Promise<void> => {
  await api.post("/reviews", body);
};

// QnA
export type QnaAnswer = {
  id: number;
  content: string;
  authorName: string;
  authorId: number;
  createdAt: string;
};

export type QnaQuestion = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorId: number;
  createdAt: string;
  answers: QnaAnswer[];
};

export const getQuestions = async (courseId: number): Promise<QnaQuestion[]> => {
  const { data } = await api.get(`/courses/${courseId}/questions`);
  return data;
};

export const createQuestion = async (
  courseId: number,
  body: { title: string; content: string },
): Promise<QnaQuestion> => {
  const { data } = await api.post(`/courses/${courseId}/questions`, body);
  return data;
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  await api.delete(`/questions/${questionId}`);
};

export const createAnswer = async (
  questionId: number,
  body: { content: string },
): Promise<QnaQuestion> => {
  const { data } = await api.post(`/questions/${questionId}/answers`, body);
  return data;
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
  await api.delete(`/answers/${answerId}`);
};
