# SmartNest – Smart Home Automation & Energy Monitoring System

SmartNest is an **IoT-based Smart Home Automation and Energy Monitoring System** designed to provide remote appliance control and real-time monitoring of electricity consumption.

The system integrates an **ESP32-based hardware layer, energy sensors, relay modules, Node.js/Express backend, MongoDB database, and React Native mobile application** to create a unified smart-home solution.

Users can remotely control connected appliances through the mobile application while monitoring current and historical energy consumption.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Problem Statement](#problem-statement)
* [Objectives](#objectives)
* [Key Features](#key-features)
* [System Architecture](#system-architecture)
* [How the System Works](#how-the-system-works)
* [Technology Stack](#technology-stack)
* [Hardware Components](#hardware-components)
* [Software Architecture](#software-architecture)
* [Real-Time Communication](#real-time-communication)
* [REST API](#rest-api)
* [Database](#database)
* [Project Workflow](#project-workflow)
* [Advantages](#advantages)
* [Future Scope](#future-scope)
* [Project Outcomes](#project-outcomes)
* [Installation and Setup](#installation-and-setup)
* [Security Considerations](#security-considerations)
* [Limitations](#Limitations)
* [Contributing](#Contributing)
* [License](#license)
* [Conclusion](#conclusion)

---

## Project Overview

SmartNest is designed to solve common problems associated with traditional home appliances and electricity monitoring.

The system allows users to:

* Control connected appliances remotely.
* Monitor electricity consumption in real time.
* View historical energy usage.
* Manage connected devices from a centralized mobile application.
* Receive updated device and energy information through real-time communication.

The project combines **IoT, embedded systems, mobile development, backend development, database management, and real-time communication** into a single platform.

---

## Problem Statement

Traditional home appliances generally require manual operation and provide limited information about electricity consumption.

Some of the major problems include:

* Manual control of appliances.
* Unnecessary electricity consumption.
* Lack of real-time energy monitoring.
* No centralized appliance control.
* Difficulty tracking historical power usage.
* Limited remote accessibility.

### Solution

SmartNest addresses these problems by integrating **home automation and energy monitoring into a single IoT platform**.

The system provides a centralized interface through which users can control appliances and monitor their energy consumption.

---

## Objectives

The main objectives of SmartNest are:

* Remotely control home appliances.
* Monitor energy consumption in real time.
* Store and analyze historical energy data.
* Provide a user-friendly mobile interface.
* Establish real-time communication between hardware and application.
* Reduce unnecessary electricity consumption.
* Build a modular and scalable IoT architecture.

---

## Key Features

| Feature                     | Description                                            |
| --------------------------- | ------------------------------------------------------ |
| Smart Home Automation       | Control connected home appliances                      |
| Real-Time Energy Monitoring | Monitor current energy consumption                     |
| Mobile Application          | Control and monitor devices through a mobile interface |
| Remote Appliance Control    | Turn connected appliances ON/OFF remotely              |
| Energy History              | Store and view historical energy consumption           |
| Real-Time Synchronization   | Keep device status synchronized                        |
| REST API                    | Application-to-backend communication                   |
| Socket.IO                   | Real-time communication                                |
| MongoDB                     | Store application and energy data                      |
| ESP32                       | Hardware control and sensor communication              |

---

## System Architecture

```text
┌──────────────────────┐
│        User          │
│    Mobile Device     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   React Native App   │
│                      │
│ • Device Control     │
│ • Energy Monitoring  │
└──────────┬───────────┘
           │
      REST API / Socket.IO
           │
           ▼
┌──────────────────────┐
│    Backend Server    │
│    Node.js/Express   │
│                      │
│ • Business Logic     │
│ • API Handling       │
│ • Real-Time Events   │
└──────────┬───────────┘
           │
           ├───────────────────┐
           │                   │
           ▼                   ▼
┌──────────────────┐   ┌──────────────────┐
│     MongoDB      │   │      ESP32       │
│                  │   │                  │
│ • Device Data    │   │ • Hardware       │
│ • Energy Data    │   │   Control        │
│ • History        │   │ • Sensor Data    │
└──────────────────┘   └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Relay + Sensors  │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Home Appliances  │
                       └──────────────────┘
```

---

## How the System Works

The overall system workflow is:

1. The user opens the SmartNest mobile application.
2. The user selects a connected appliance.
3. The mobile application sends a control request to the backend.
4. The backend processes the request.
5. The command is communicated to the ESP32.
6. The ESP32 controls the corresponding relay.
7. The relay switches the connected appliance ON/OFF.
8. Energy sensors continuously collect consumption-related data.
9. The ESP32 sends the collected data to the backend.
10. The backend stores the data in MongoDB.
11. Updated device and energy information is displayed in the mobile application.

### Simplified Flow

```text
User
  ↓
React Native App
  ↓
Backend API / Socket.IO
  ↓
ESP32
  ↓
Relay
  ↓
Appliance

Energy Sensor
  ↓
ESP32
  ↓
Backend
  ↓
MongoDB
  ↓
React Native App
```

---

## Technology Stack

| Component            | Technology            |
| -------------------- | --------------------- |
| Mobile Application   | React Native          |
| Backend              | Node.js               |
| API Framework        | Express.js            |
| Database             | MongoDB               |
| Hardware Controller  | ESP32                 |
| Communication        | REST API, Socket.IO   |
| Hardware Programming | Embedded C            |
| Energy Monitoring    | Energy/Current Sensor |
| Appliance Control    | Relay Module          |
| Version Control      | Git & GitHub          |

---

## Hardware Components

The SmartNest hardware prototype consists of:

* ESP32 Development Board
* Relay Module
* Energy/Current Monitoring Sensor
* Connected Home Appliances
* Power Supply
* Jumper Wires
* Breadboard / Prototype Board

---

## Software Architecture

SmartNest follows a modular architecture consisting of three major layers.

### 1. Presentation Layer

Responsible for interaction with the user.

```text
React Native Mobile Application
│
├── Dashboard
├── Device Control
└── Energy Monitoring
```

### 2. Application Layer

Responsible for processing requests and implementing business logic.

```text
Node.js
│
├── Express.js
├── REST APIs
├── Socket.IO
└── Business Logic
```

### 3. Hardware Layer

Responsible for physical device control and energy data collection.

```text
ESP32
│
├── Sensors
├── Relay Module
└── Home Appliances
```

This separation makes the system easier to maintain, test, and extend.

---

## Real-Time Communication

SmartNest uses **Socket.IO** to support real-time communication.

A simplified communication flow is:

```text
Mobile App
     ↓
 Socket.IO
     ↓
  Backend
     ↓
   ESP32
     ↓
   Relay
     ↓
 Appliance
```

When an appliance state changes, the updated status can be reflected in the mobile application without requiring the user to manually refresh the interface.

This provides a more responsive smart-home experience.

---

## REST API

REST APIs are used for communication between the mobile application and backend server.

Typical REST operations include:

| Method   | Purpose                               |
| -------- | ------------------------------------- |
| `GET`    | Retrieve device or energy data        |
| `POST`   | Send new device or energy information |
| `PUT`    | Update existing information           |
| `DELETE` | Remove stored information             |
---

## Database

SmartNest uses **MongoDB** to store application and energy-monitoring data.

Depending on the final implementation, the database can contain:

* User information
* Device information
* Device status
* Energy consumption
* Historical readings
* Timestamps

### Example Device Document

```text
Device
├── deviceName
├── deviceType
├── status
└── updatedAt
```

### Example Energy Reading

```text
Energy Reading
├── deviceId
├── voltage
├── current
├── power
├── energyConsumed
└── timestamp
```

---

## Project Workflow

```text
┌─────────────┐
│    User     │
└──────┬──────┘
       ↓
┌─────────────────┐
│ Mobile App      │
│ React Native    │
└──────┬──────────┘
       ↓
┌─────────────────┐
│ API / Socket.IO │
└──────┬──────────┘
       ↓
┌─────────────────┐
│ Backend Server  │
│ Node.js/Express │
└──────┬──────────┘
       ↓
┌─────────────────┐
│     MongoDB     │
└──────┬──────────┘
       ↓
┌─────────────────┐
│      ESP32      │
└──────┬──────────┘
       ↓
┌─────────────────┐
│ Sensors / Relay │
└──────┬──────────┘
       ↓
┌─────────────────┐
│   Appliance     │
└─────────────────┘
```

---

## Advantages

SmartNest provides several benefits:

* Easy appliance control.
* Real-time energy monitoring.
* Remote accessibility.
* Centralized device management.
* Energy usage tracking.
* Real-time device synchronization.
* Modular architecture.
* Scalable IoT design.
* Better awareness of electricity consumption.

---

## Future Scope

Future versions of SmartNest can include:

* Adding offline functionality.

* Cloud-based IoT deployment.
* AI-based energy-saving recommendations.
* Advanced authentication and security.
* Integration with other smart-home ecosystems.

---

## Project Outcomes

SmartNest demonstrates the integration of multiple technologies into a single IoT-based platform:

```text
IoT
 +
Embedded Systems
 +
Mobile Development
 +
Backend Development
 +
Database
 +
Real-Time Communication
 =
SmartNest
```

The project provides a practical foundation for developing scalable **smart-home automation and energy-monitoring systems**.

---

## Installation and Setup

> The exact setup instructions depend on the final project folder structure and implementation.

The project is divided into multiple components:

```text
SmartNest
│
├── Mobile Application
├── Backend
├── Hardware
└── Database
```

### Backend

Install the required Node.js dependencies:

```bash
npm install
```

Start the backend server:

```bash
npm start
```

### Mobile Application

Install the required dependencies:

```bash
npm install
```

Start the React Native application using the appropriate development command for the project.

### ESP32

1. Connect the ESP32 development board.
2. Connect the relay module.
3. Connect the energy-monitoring sensor.
4. Connect the required appliances according to the hardware design.
5. Upload the embedded firmware to the ESP32.
6. Configure the backend/server connection details.

> Add the exact commands, environment variables, database configuration, and ESP32 setup instructions once the final project structure is available.

---

## Security Considerations

For a production deployment, SmartNest should consider:

* Secure authentication.
* Password hashing.
* Environment variables for sensitive configuration.
* API authentication and authorization.
* Secure communication between devices and backend.
* Input validation.
* Access control for connected appliances.

Sensitive credentials such as database URLs, API keys, passwords, and secret tokens **should never be committed to GitHub**

---
## Limitations
- No offline mode yet — requires an active internet connection for both the mobile app and ESP32.
- No cloud deployment yet; runs on local network only.
- Authentication/authorization is not yet fully implemented.
---
## Contributing
This project is currently maintained by Team ANVAYA. If you'd like to report a bug or suggest a feature, please open an issue in the repository.

---

## License

SmartNest is a project developed by **Team ANVAYA** as part of the college's **Club, Incubation and Innovation initiative**.

The concept, design, implementation, and project work are developed by the team.

The project is currently intended for **demonstration, development, and innovation purposes within the college ecosystem**.

No open-source license has been applied at this stage. Any use, reproduction, modification, or distribution of this project should be undertaken with the permission of the project team and relevant institutional authorities.

---

## Conclusion

SmartNest combines **IoT, embedded systems, mobile development, backend technologies, database management, and real-time communication** to create a centralized smart-home automation and energy-monitoring platform.

The system enables users to remotely control appliances while monitoring energy consumption, providing a foundation for smarter and more energy-aware homes.

---

## Developed By

**Team ANVAYA**

**Ayush Gupta · Saurabh Yadav · Omji Dubey · Arpit Gangwar**
