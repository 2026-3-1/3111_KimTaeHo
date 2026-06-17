package rlaxogh76.DevClass.domain.admin.dto;

public record AdminStatsResponse(
        long totalUsers,
        long totalCourses,
        long totalPayments,
        long totalRevenue,
        long totalEnrollments
) {}
