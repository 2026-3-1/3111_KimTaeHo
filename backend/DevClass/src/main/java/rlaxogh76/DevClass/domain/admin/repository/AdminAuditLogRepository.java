package rlaxogh76.DevClass.domain.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rlaxogh76.DevClass.domain.admin.entity.AdminAuditLog;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
}
