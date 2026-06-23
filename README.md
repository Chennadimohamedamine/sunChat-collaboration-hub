# Sunday Collaboration Hub 

Sunday Collaboration Hub is a high-performance, responsive real-time communication platform built to emulate a tech-forward workspace. Featuring a high-contrast dark aesthetic with brand accents in Sunday Orange (#FF6B35), the application provides seamless instant messaging pipelines, live node presence tracking, robust profile parameter synchronization, and automated notification engines.

---

## Core Architecture & Micro-Stack

The ecosystem is split into two cleanly separated runtime environments designed for scalability and strict typing:
  [ Frontend Client ] <--- (WebSockets / REST API) ---> [ NestJS Backend Engine ]
      (React + Tailwind) (TypeORM + Modular Architecture)

---

##  Client Subsystem (Frontend)

- **Runtime Layer:** React (Vite-based) with TypeScript for full component type safety  
- **Interface Layouts:** Tailwind CSS with custom layout isolation layers for smooth dark/light transitions  
- **Visual Identity:** Lucide React icons for clean geometric UI consistency  

---

##  Infrastructure Subsystem (Backend)

- **Framework:** NestJS with modular MVC architecture (`users.module`, `chat.module`)  
- **Database Pipeline:** TypeORM for structured persistence (User, Conversation, Message)  
- **Real-Time Stream:** Socket.io for low-latency bidirectional communication  
- **Security Context:** Passport JWT guards for authenticated request handling  

---

## Features Breakdown

### 1. Real-Time Engine & Synchronization
Powered by a stateful WebSockets gateway (`chat.gateway.ts`) managing active socket connections.

Supports:
- Live message broadcasting (`receive_message`)
- Typing indicators (`user_typing`)
- Connection lifecycle handling (`leave_conversation`)

---

### 2. Properties Inspector Panel (SlideOut.tsx)

A dynamic side drawer with two main scopes:
- Peer Details (inspect active user/session data)
- My Profile (edit personal account parameters)

**Zero-Blur Rendering Utility:**
Uses CSS transforms (`translate-x-full`, shadow toggling) to ensure no UI overlap or rendering artifacts across message feeds and input layers.

---

### 3. Parameter-Safe Account Guarding

Implements strict backend validation and isolation layers inside `users.service.ts`.

- Prevents modification of locked fields (e.g., username, email)
- Sanitizes all update payloads
- Adds safe-chain checks to avoid runtime crashes (`undefined` protection)

---

### 4. Branded Mail Services (transporter)

Includes HTML email templates for:
- Account verification
- Password reset flows

Styled with the platform’s dark theme and Sunday Orange branding.
