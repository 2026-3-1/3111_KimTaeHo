import api from "./axios";
import type {
  CoursePageResponse,
  CourseDetail,
  Lecture,
  Review,
} from "../types";

export type CourseParams = {
  keyword?: string;
  category?: string;
  level?: string;
  sort?: string;
  page?: number;
  size?: number;
};

export const getCourses = async (
  params: CourseParams,
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
