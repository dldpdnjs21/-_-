가계부 관리 웹 애플리케이션
--------------------
##프로젝트 설명

이 프로젝트는 개인의 재정 관리를 돕기 위한 웹 애플리케이션입니다. 사용자는 수입 및 지출 내역을 추가, 수정, 삭제, 확인할 수 있으며, 월별 총 수입, 지출 및 거래 금액을 조회할 수 있습니다.

##주요 기능

	•	CRUD 작업: 수입 및 지출 내역 추가, 수정, 삭제, 확인
	•	월별 요약: 월별 총 수입, 지출 및 거래 금액 조회

##기술 스택

	•	백엔드: Spring Boot
	•	프론트엔드: HTML, CSS, JavaScript
	•	데이터베이스: JPA, MySQL

##개발 일정

	•	2024.07.23 ~ 2024.07.24: 개발 계획 및 화면 설계
	•	2024.07.24 ~ 2024.07.25: DB 연결 및 백엔드 구현
	•	2024.07.26 ~ 2024.07.29: 프론트엔드 UI 및 기능 구현
	•	2024.07.29 ~ 2024.07.30: 산출물 제작 및 제출

##디렉토리 구조

java/com/ureca/expensemanager/

  ├── ExpenseManagerApplication.java
  
  ├── controller/
  
  │   ├── ExpenseController.java
  
  │   └── HomeController.java
  
  ├── model/
  
  │   └── Expense.java
  
  ├── repository/
  
  │   └── ExpenseRepository.java
  
  └── service/
  
  │   └── ExpenseService.java


resources/

  ├── application.properties
  
  ├── static/
  
  │   ├── style.css
  
  │   ├── app.js
  
  │   └── index.html
