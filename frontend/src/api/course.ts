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
