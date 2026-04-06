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
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `price` int NOT NULL DEFAULT '0',
  `teacher_id` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(50) NOT NULL,
  `level` varchar(20) NOT NULL,
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `enrollment_count` int NOT NULL DEFAULT '0',
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00' COMMENT '강의 평균 평점 (0.00 ~ 5.00)',
  PRIMARY KEY (`id`),
  KEY `idx_courses_teacher_id` (`teacher_id`),
  KEY `idx_course_category` (`category`),
  KEY `idx_course_level` (`level`),
  KEY `idx_course_price` (`price`),
  KEY `idx_course_created_at` (`created_at`),
  KEY `idx_course_category_level` (`category`,`level`),
  KEY `idx_course_avg_rating` (`average_rating`),
  CONSTRAINT `fk_courses_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'React 완벽 가이드','React를 처음부터 배우는 강의입니다. JSX, Hooks, 상태 관리까지 다룹니다.',39000,1,'2026-03-17 21:54:36','프론트엔드','입문',5.00,1,4.80),(2,'Spring Boot 백엔드 입문','Spring Boot로 REST API를 설계하고 구축하는 강의입니다.',49000,1,'2026-03-17 21:54:36','백엔드','초급',4.80,0,4.50),(3,'Java 자료구조와 알고리즘','Java로 배우는 핵심 자료구조와 알고리즘 강의입니다.',29000,2,'2026-03-17 21:54:36','알고리즘 / CS 기초','중급',1.20,0,4.20),(4,'Docker & Kubernetes 입문','컨테이너 기반 배포 환경을 실습하며 배우는 강의입니다.',59000,2,'2026-03-17 21:54:36','DevOps / 인프라','초급',3.20,0,4.70),(5,'Vue.js 완벽 입문','Vue.js의 기초부터 컴포넌트, 라우터까지 배우는 강의입니다.',29000,1,'2026-03-22 22:33:11','프론트엔드','입문',4.70,0,4.60),(6,'TypeScript 핵심 가이드','자바스크립트 개발자를 위한 TypeScript 실전 강의입니다.',39000,1,'2026-03-22 22:33:11','프론트엔드','초급',5.00,0,4.75),(7,'React 상태관리 심화','Redux, Zustand, React Query로 배우는 상태관리 전략.',49000,1,'2026-03-22 22:33:11','프론트엔드','중급',5.00,0,4.85),(8,'Next.js 풀스택 개발','Next.js App Router와 서버 컴포넌트로 풀스택 앱 구축.',59000,1,'2026-03-22 22:33:11','프론트엔드','고급',5.00,0,4.90),(9,'Node.js API 서버 입문','Node.js와 Express로 REST API 서버를 처음부터 만드는 강의.',29000,2,'2026-03-22 22:33:11','백엔드','입문',3.10,0,4.40),(10,'JPA 완전 정복','Spring Data JPA의 연관관계, 페치 전략, 성능 최적화를 다룹니다.',49000,2,'2026-03-22 22:33:11','백엔드','중급',2.90,0,4.70),(11,'MSA 아키텍처 설계','마이크로서비스 아키텍처 설계와 Spring Cloud 실전 적용.',69000,2,'2026-03-22 22:33:11','백엔드','고급',2.60,0,4.80),(12,'파이썬으로 시작하는 데이터 분석','판다스, 넘파이로 배우는 데이터 분석 기초.',29000,1,'2026-03-22 22:33:11','데이터사이언스','입문',1.00,0,4.55),(13,'머신러닝 기초','Scikit-learn으로 배우는 지도학습, 비지도학습 핵심 개념.',39000,1,'2026-03-22 22:33:11','데이터사이언스','초급',1.12,0,4.60),(14,'딥러닝 실전','PyTorch를 활용한 CNN, RNN, Transformer 구현.',59000,2,'2026-03-22 22:33:11','데이터사이언스','중급',3.12,0,4.75),(15,'LLM 파인튜닝 마스터','GPT, LLaMA 기반 모델 파인튜닝과 RAG 파이프라인 구축.',79000,2,'2026-03-22 22:33:11','데이터사이언스','고급',4.81,0,4.95),(16,'Linux 기초부터 시작','개발자를 위한 리눅스 명령어와 쉘 스크립트 입문.',19000,2,'2026-03-22 22:33:11','DevOps / 인프라','입문',3.13,0,4.50),(17,'AWS 클라우드 입문','EC2, S3, RDS로 배우는 AWS 핵심 서비스 실습.',39000,2,'2026-03-22 22:33:11','DevOps / 인프라','초급',5.00,0,4.65),(18,'Kubernetes 실전','k8s 클러스터 구성, 배포 전략, 모니터링 실전 가이드.',59000,1,'2026-03-22 22:33:11','DevOps / 인프라','중급',5.00,0,4.70),(19,'CI/CD 고급 파이프라인','GitHub Actions, ArgoCD로 구축하는 GitOps 기반 배포 자동화.',69000,1,'2026-03-22 22:33:11','DevOps / 인프라','고급',1.87,0,4.85),(20,'코딩테스트 첫걸음','알고리즘 문제 풀이를 처음 시작하는 분들을 위한 입문 강의.',19000,2,'2026-03-22 22:33:11','알고리즘 / CS 기초','입문',1.99,0,4.80),(21,'그래프 알고리즘 정복','BFS, DFS, 최단경로, 최소신장트리를 문제로 완전 정복.',39000,2,'2026-03-22 22:33:11','알고리즘 / CS 기초','중급',4.55,0,4.75),(22,'운영체제 핵심 이론','프로세스, 스레드, 메모리 관리, 동기화를 깊게 파헤칩니다.',39000,1,'2026-03-22 22:33:11','알고리즘 / CS 기초','중급',5.00,0,4.60),(23,'시스템 설계 인터뷰','대규모 트래픽을 다루는 시스템 설계 방법론과 실전 사례.',59000,1,'2026-03-22 22:33:11','알고리즘 / CS 기초','고급',4.67,0,4.90),(24,'Flutter 앱 개발 입문','Dart와 Flutter로 iOS/Android 앱을 동시에 개발하는 강의.',29000,2,'2026-03-22 22:33:11','모바일','입문',2.45,0,4.55),(25,'React Native 실전','리액트 네이티브로 크로스플랫폼 앱을 빠르게 구축합니다.',39000,1,'2026-03-22 22:33:11','모바일','초급',5.00,1,4.60),(26,'Swift iOS 앱 개발','SwiftUI로 배우는 네이티브 iOS 앱 개발 중급 과정.',49000,2,'2026-03-22 22:33:11','모바일','중급',4.89,2,4.70),(27,'Android Jetpack 심화','Compose, ViewModel, Hilt로 구축하는 모던 Android 앱.',59000,1,'2026-03-22 22:33:11','모바일','고급',2.50,3,4.80);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 21:06:30
