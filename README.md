# Estimo (PlanitPoker)

Estimo is an online tool for estimating the effort or complexity of tasks in software development, particularly within **Agile** and **Scrum** methodologies.  
It’s a digital implementation of the traditional **Planning Poker** technique — a collaborative estimation method that helps teams reach consensus estimates in a transparent and engaging way.

## Features
- Collaborative real-time estimation for teams.
- Multiple estimation scales:
    - Modified Fibonacci sequence (`1, 2, 3, 5, 8, 13, …`)
    - T-shirt sizes (`S, M, L, XL`)
    - Custom scales
- Support for multiple rooms and participants.
- Easy integration into Agile workflows.

---

## Prerequisites

Before running Estimo locally, ensure you have:

- **Java 17**
- **Node.js** (latest LTS recommended)
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose**
- **IntelliJ IDEA** (recommended for backend development)
- Internet connection for installing dependencies
  
## Default Users
After the first run, Liquibase seeds some default users for testing.
  **User with Admin Role**
      - USERNAME: andrea
      - PASSWORD: admin
  **User with MODERATOR Role**
      - USERNAME: raul 
      - PASSWORD: manager
  **User with USER Role**
      - USERNAME: tudor
      - PASSWORD: user