# Hotel Management System

## 📋 Overview

A microservices-based Hotel Management System built with Spring Boot and Angular. The system enables hotel booking, billing, user management, and comprehensive reporting features.

## 🏗️ Architecture

- **Pattern**: Microservices with API Gateway
- **Service Discovery**: Netflix Eureka
- **Configuration**: Spring Cloud Config Server
- **Messaging**: Apache Kafka (Event-Driven)
- **Database**: MySQL (Separate DB per service)
- **Cache**: Redis
- **Authentication**: JWT


## Frontend Running 

localhost:4200




## 📸 UI Screenshots

### Landing Page
<img width="1466" height="768" alt="Screenshot 2026-01-07 at 2 31 37 AM" src="https://github.com/user-attachments/assets/11e119ce-91c0-470b-8d5a-82b93fb32e16" />

### Hotel List Page
<img width="1467" height="783" alt="Screenshot 2026-01-07 at 2 31 50 AM" src="https://github.com/user-attachments/assets/aaad0387-d994-4403-a063-efc88ffc1800" />


### Hotel Details Page

<img width="1470" height="956" alt="Screenshot 2026-01-07 at 3 17 05 AM" src="https://github.com/user-attachments/assets/813ef8ba-9cc8-4d6c-b7bc-ead4156f7303" />

## Admin Analytics Page
<img width="1463" height="729" alt="Screenshot 2026-01-07 at 3 01 37 AM" src="https://github.com/user-attachments/assets/f4c0094a-dece-4a09-8089-9d09c6be18b9" />


### Booking Modal

<img width="568" height="794" alt="Screenshot 2026-01-07 at 3 19 38 AM" src="https://github.com/user-attachments/assets/32a9af7f-3d14-4ad5-b09d-93cf03e2c02e" />

### Dashboard

<img width="1470" height="763" alt="Screenshot 2026-01-07 at 3 13 04 AM" src="https://github.com/user-attachments/assets/f81b487b-c435-4787-a664-5aee6d3a4768" />


### Architecture Diagram
<img width="17100" height="7886" alt="RoomManagementFlow-2026-01-06-202234" src="https://github.com/user-attachments/assets/47607dba-6095-4157-b1f8-279b50614e84" />

## 🎯 Services

| Service | Port | Description |
|---------|------|-------------|
| Eureka Service | 8761 | Service Discovery |
| Config Server | 8888 | Centralized Configuration |
| API Gateway | 8080 | Single Entry Point, Routing |
| Auth Service | 9001 | Authentication & Authorization |
| Hotel Service | 9002 | Hotel & Room Management |
| Booking Service | 9003 | Booking Management |
| Billing Service | 9005 | Bill Generation & Payments |
| Notification Service | 9004 | Email/SMS Notifications |
| Reports Service | 9006 | Dashboards & Analytics |

### Service Architecture Diagram
```
[Service Architecture Diagram Placeholder - Add ARCHITECTURE_DIAGRAM.md content visualization]
```

## 👥 User Roles

- **ADMIN**: Full system access
- **GUEST**: Can make bookings
- **MANAGER**: Hotel manager (bound to specific hotel)
- **RECEPTIONIST**: Front desk staff (bound to specific hotel)

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+
- MySQL 8.0
- Redis
- Apache Kafka

### Backend Setup

docker compose up --build

### Frontend Setup

```bash
cd hms-frontend
npm install
ng serve
```

## 📡 Key API Endpoints

### Auth Service
- `POST /auth/register/guest` - Guest registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Hotel Service
- `GET /hotels/search` - Search hotels (Public)
- `GET /hotels/{hotelId}` - Get hotel details (Public)
- `POST /hotels` - Create hotel (Admin only)

### Booking Service
- `GET /bookings/check-availability` - Check availability (Public)
- `POST /bookings` - Create booking (Protected)
- `GET /bookings/my-bookings` - Get user bookings

### Billing Service
- `GET /bills/booking/{bookingId}` - Get bill by booking
- `POST /bills/{billId}/mark-paid` - Mark bill as paid (Admin)

**Full API Documentation**: See `SOFTWARE_DESIGN_DOCUMENT.md`

## 🗄️ Database Schema

### Core Entities
- **User**: Authentication & user management
- **Hotel**: Hotel information
- **Room**: Room details per hotel
- **Booking**: Booking records
- **Bill**: Billing information
- **Payment**: Payment records

### ER Diagram
```
[ER Diagram Placeholder - Add ErDiagram.png here]
```

**Complete Schema**: See `SOFTWARE_DESIGN_DOCUMENT.md`

## 🔄 Key Flows

### Booking Flow
```
1. Guest searches hotels
2. Checks availability
3. Selects room & dates
4. Provides guest details
5. Booking created (status: CREATED)
6. Booking confirmed → Bill generated
7. Payment made → Booking confirmed
8. Check-in → Check-out
```

### Booking Flow Diagram
```
[Booking Flow Diagram Placeholder - Add BookingFlow.png here]
```

### Billing Flow
```
1. Booking confirmed
2. Kafka event: booking-confirmed
3. Billing Service generates bill (PENDING)
4. Admin marks bill as PAID
5. Payment record created
```

### Billing Flow Diagram
```
[Bill Generation Flow Diagram Placeholder - Add BillGenerateFlow.png here]
```

## 🔐 Security

- **JWT Authentication**: Token-based auth
- **Role-Based Access Control**: Admin, Guest, Manager, Receptionist
- **Context-Aware Authorization**: Staff bound to hotels
- **Password Encryption**: BCrypt

## 📊 Features

### Guest Features
- Search hotels by city/category
- View hotel details
- Check room availability
- Create bookings
- View booking history
- Make payments

### Staff Features
- Manage hotel rooms
- Handle check-in/check-out
- View hotel bookings
- Generate bills
- View dashboards

### Admin Features
- Manage all hotels
- Create staff users
- View system-wide reports
- Manage users

## 🛠️ Technology Stack

### Backend
- Spring Boot 3.x
- Spring Cloud (Gateway, Config, Eureka)
- Apache Kafka
- MySQL 8.0
- Redis
- JWT

### Frontend
- Angular
- TypeScript
- RxJS

## 📁 Project Structure

```
Hotel_Management_System/
├── HMS_Backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── hotel-service/
│   ├── booking-service/
│   ├── billing-service/
│   ├── notification-service/
│   ├── reports-service/
│   ├── eureka-service/
│   ├── config-server/
│   └── docker-compose.yml
├── hms-frontend/
│   └── src/
└── README.md
```

## 🔧 Configuration

### Local Development
- Update `bootstrap.properties` in each service
- Set database URLs to `localhost:3306`
- Set Eureka URL to `http://localhost:8761/eureka`
- Set Config Server URL to `http://localhost:8888`
- Set Redis host to `localhost:6379`
- Set Kafka bootstrap servers to `localhost:9092`

### Important Configuration Files
- `bootstrap.properties` - Service configuration
- `application.properties` - Application settings
- `docker-compose.yml` - Docker setup

## 📈 Reports & Analytics

The Reports Service provides:
- Manager Dashboard (hotel-specific metrics)
- Admin Dashboard (system-wide metrics)
- Revenue tracking
- Booking analytics
- Occupancy rates

### Reports Dashboard Screenshots
```
[Reports Dashboard Placeholder - Add dashboard screenshots]
```

## 🧪 Testing

### Test Coverage
- Unit tests for all services
- Integration tests
- Service coverage reports in `JacocoReports/`

### Coverage Reports
```
[Coverage Reports Placeholder - Add JacocoReports images]
```

## 📚 Documentation

- **Software Design Document**: `HMS_Backend/SOFTWARE_DESIGN_DOCUMENT.md`
- **Service READMEs**: Individual service documentation
- **API Documentation**: Postman collection available

## 🔄 Event Flow

### Kafka Events
- `booking-created` → Notification Service
- `booking-confirmed` → Billing Service, Notification Service
- `guest-checked-in` → Notification Service
- `checkout-completed` → Notification Service

### Event Flow Diagrams
```
[Notification Flow Diagram Placeholder - Add NotificationFlow.png here]
```


## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Individual Service Deployment
- Each service has its own Dockerfile
- Use `docker-compose.yml` for orchestration

## 📞 Contact & Support

- **Company**: Chubb
- **Email**: ishiii25arya@gmail.com
- **Phone**: 8340457343

## 📝 License

© 2024 BELLE VUE | Chubb | All rights reserved

## 🎯 Quick Links

- [Software Design Document](./HMS_Backend/SOFTWARE_DESIGN_DOCUMENT.md)
- [Architecture Diagram](./HMS_Backend/ARCHITECTURE_DIAGRAM.md)
- [Service READMEs](./HMS_Backend/)

---

**Last Updated**: January 2026

