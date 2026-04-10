-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: devclass
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `lectures`
--

DROP TABLE IF EXISTS `lectures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lectures` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(200) NOT NULL,
  `video_url` varchar(500) NOT NULL,
  `duration` int NOT NULL DEFAULT '0' COMMENT '영상 길이(초)',
  `sequence` int NOT NULL DEFAULT '0' COMMENT '재생 순서',
  PRIMARY KEY (`id`),
  KEY `idx_lectures_course_id` (`course_id`),
  CONSTRAINT `fk_lectures_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lectures`
--

LOCK TABLES `lectures` WRITE;
/*!40000 ALTER TABLE `lectures` DISABLE KEYS */;
INSERT INTO `lectures` VALUES (1,1,'React 소개 및 환경 설정','https://www.youtube.com/embed/Du1aeNElueA',600,1),(2,1,'JSX 기초','https://www.youtube.com/embed/Du1aeNElueA',900,2),(3,1,'Props와 State','https://www.youtube.com/embed/Du1aeNElueA',1200,3),(4,1,'useEffect Hook','https://www.youtube.com/embed/Du1aeNElueA',1080,4),(5,1,'컴포넌트 분리 실습','https://www.youtube.com/embed/Du1aeNElueA',1500,5),(6,2,'Spring Boot 프로젝트 생성','https://www.youtube.com/embed/Du1aeNElueA',720,1),(7,2,'REST API 설계 원칙','https://www.youtube.com/embed/Du1aeNElueA',960,2),(8,2,'JPA Entity 설계','https://www.youtube.com/embed/Du1aeNElueA',1140,3),(9,2,'Service & Repository 패턴','https://www.youtube.com/embed/Du1aeNElueA',900,4),(10,3,'시간복잡도와 Big-O','https://www.youtube.com/embed/Du1aeNElueA',600,1),(11,3,'배열과 연결 리스트','https://www.youtube.com/embed/Du1aeNElueA',900,2),(12,3,'스택과 큐','https://www.youtube.com/embed/Du1aeNElueA',780,3),(13,4,'Docker란 무엇인가','https://www.youtube.com/embed/Du1aeNElueA',540,1),(14,4,'Dockerfile 작성법','https://www.youtube.com/embed/Du1aeNElueA',840,2),(15,4,'docker-compose 실습','https://www.youtube.com/embed/Du1aeNElueA',1020,3),(16,5,'Vue.js 소개 및 환경 설정','https://www.youtube.com/embed/Du1aeNElueA',600,1),(17,5,'Vue 컴포넌트 기초','https://www.youtube.com/embed/Du1aeNElueA',900,2),(18,5,'Vue Router와 상태관리','https://www.youtube.com/embed/Du1aeNElueA',1080,3),(19,6,'TypeScript란 무엇인가','https://www.youtube.com/embed/Du1aeNElueA',600,1),(20,6,'타입 시스템과 인터페이스','https://www.youtube.com/embed/Du1aeNElueA',900,2),(21,6,'제네릭과 유틸리티 타입','https://www.youtube.com/embed/Du1aeNElueA',1020,3),(22,7,'Redux 핵심 개념','https://www.youtube.com/embed/Du1aeNElueA',900,1),(23,7,'Zustand로 간단하게','https://www.youtube.com/embed/Du1aeNElueA',780,2),(24,7,'React Query 실전','https://www.youtube.com/embed/Du1aeNElueA',1200,3),(25,8,'Next.js App Router 소개','https://www.youtube.com/embed/Du1aeNElueA',720,1),(26,8,'서버 컴포넌트와 클라이언트 컴포넌트','https://www.youtube.com/embed/Du1aeNElueA',960,2),(27,8,'API Route와 데이터 페칭','https://www.youtube.com/embed/Du1aeNElueA',1140,3),(28,9,'Node.js와 Express 기초','https://www.youtube.com/embed/Du1aeNElueA',600,1),(29,9,'REST API 설계','https://www.youtube.com/embed/Du1aeNElueA',900,2),(30,9,'미들웨어와 에러 처리','https://www.youtube.com/embed/Du1aeNElueA',840,3),(31,10,'연관관계 매핑','https://www.youtube.com/embed/Du1aeNElueA',1080,1),(32,10,'페치 전략과 N+1 문제','https://www.youtube.com/embed/Du1aeNElueA',1200,2),(33,10,'QueryDSL 실전','https://www.youtube.com/embed/Du1aeNElueA',1320,3),(34,11,'마이크로서비스란 무엇인가','https://www.youtube.com/embed/Du1aeNElueA',720,1),(35,11,'Spring Cloud Gateway','https://www.youtube.com/embed/Du1aeNElueA',1080,2),(36,11,'서비스 간 통신과 장애 처리','https://www.youtube.com/embed/Du1aeNElueA',1260,3),(37,12,'Pandas 기초','https://www.youtube.com/embed/Du1aeNElueA',600,1),(38,12,'NumPy와 배열 연산','https://www.youtube.com/embed/Du1aeNElueA',780,2),(39,12,'데이터 시각화 with Matplotlib','https://www.youtube.com/embed/Du1aeNElueA',900,3),(40,13,'지도학습 개념과 선형회귀','https://www.youtube.com/embed/Du1aeNElueA',840,1),(41,13,'분류 알고리즘','https://www.youtube.com/embed/Du1aeNElueA',960,2),(42,13,'모델 평가와 교차검증','https://www.youtube.com/embed/Du1aeNElueA',780,3),(43,14,'PyTorch 기초','https://www.youtube.com/embed/Du1aeNElueA',900,1),(44,14,'CNN 구현','https://www.youtube.com/embed/Du1aeNElueA',1200,2),(45,14,'Transformer 아키텍처','https://www.youtube.com/embed/Du1aeNElueA',1500,3),(46,15,'LLM 파인튜닝 개요','https://www.youtube.com/embed/Du1aeNElueA',840,1),(47,15,'LoRA와 PEFT 기법','https://www.youtube.com/embed/Du1aeNElueA',1080,2),(48,15,'RAG 파이프라인 구축','https://www.youtube.com/embed/Du1aeNElueA',1320,3),(49,16,'리눅스 기본 명령어','https://www.youtube.com/embed/Du1aeNElueA',600,1),(50,16,'파일 권한과 프로세스 관리','https://www.youtube.com/embed/Du1aeNElueA',780,2),(51,16,'쉘 스크립트 작성','https://www.youtube.com/embed/Du1aeNElueA',900,3),(52,17,'EC2 인스턴스 생성과 배포','https://www.youtube.com/embed/Du1aeNElueA',720,1),(53,17,'S3와 정적 웹 호스팅','https://www.youtube.com/embed/Du1aeNElueA',660,2),(54,17,'RDS 데이터베이스 연결','https://www.youtube.com/embed/Du1aeNElueA',840,3),(55,18,'k8s 핵심 개념과 클러스터 구성','https://www.youtube.com/embed/Du1aeNElueA',900,1),(56,18,'Deployment와 Service','https://www.youtube.com/embed/Du1aeNElueA',1080,2),(57,18,'모니터링과 배포 전략','https://www.youtube.com/embed/Du1aeNElueA',1200,3),(58,19,'GitHub Actions 기초','https://www.youtube.com/embed/Du1aeNElueA',720,1),(59,19,'ArgoCD와 GitOps','https://www.youtube.com/embed/Du1aeNElueA',960,2),(60,19,'배포 자동화 실전','https://www.youtube.com/embed/Du1aeNElueA',1140,3),(61,20,'시간복잡도와 입출력 처리','https://www.youtube.com/embed/Du1aeNElueA',600,1),(62,20,'완전탐색과 재귀','https://www.youtube.com/embed/Du1aeNElueA',900,2),(63,20,'정렬과 이진탐색','https://www.youtube.com/embed/Du1aeNElueA',780,3),(64,21,'BFS와 DFS','https://www.youtube.com/embed/Du1aeNElueA',900,1),(65,21,'최단경로 다익스트라','https://www.youtube.com/embed/Du1aeNElueA',1020,2),(66,21,'최소신장트리 크루스칼','https://www.youtube.com/embed/Du1aeNElueA',960,3),(67,22,'프로세스와 스레드','https://www.youtube.com/embed/Du1aeNElueA',900,1),(68,22,'메모리 관리와 가상 메모리','https://www.youtube.com/embed/Du1aeNElueA',1080,2),(69,22,'동기화와 교착상태','https://www.youtube.com/embed/Du1aeNElueA',960,3),(70,23,'대규모 시스템 설계 기초','https://www.youtube.com/embed/Du1aeNElueA',1080,1),(71,23,'캐시와 CDN 전략','https://www.youtube.com/embed/Du1aeNElueA',900,2),(72,23,'데이터베이스 샤딩과 복제','https://www.youtube.com/embed/Du1aeNElueA',1200,3),(73,24,'Dart 언어 기초','https://www.youtube.com/embed/Du1aeNElueA',720,1),(74,24,'Flutter 위젯 기초','https://www.youtube.com/embed/Du1aeNElueA',900,2),(75,24,'상태관리와 네비게이션','https://www.youtube.com/embed/Du1aeNElueA',1020,3),(76,25,'React Native 환경 설정','https://www.youtube.com/embed/Du1aeNElueA',600,1),(77,25,'네이티브 컴포넌트 활용','https://www.youtube.com/embed/Du1aeNElueA',900,2),(78,25,'API 연동과 배포','https://www.youtube.com/embed/Du1aeNElueA',1080,3),(79,26,'SwiftUI 기초','https://www.youtube.com/embed/Du1aeNElueA',780,1),(80,26,'MVVM 패턴 적용','https://www.youtube.com/embed/Du1aeNElueA',1020,2),(81,26,'Combine과 비동기 처리','https://www.youtube.com/embed/Du1aeNElueA',1140,3),(82,27,'Jetpack Compose 기초','https://www.youtube.com/embed/Du1aeNElueA',840,1),(83,27,'ViewModel과 Hilt DI','https://www.youtube.com/embed/Du1aeNElueA',1080,2),(84,27,'모던 Android 앱 배포','https://www.youtube.com/embed/Du1aeNElueA',960,3);
/*!40000 ALTER TABLE `lectures` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-10 23:47:26
