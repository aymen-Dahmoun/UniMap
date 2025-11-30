# UniMap – Indoor Mapping & Navigation API

UniMap is a FastAPI-based backend for managing indoor maps, buildings, rooms, paths, and route calculations. It provides a clean RESTful API to help applications render indoor maps and generate shortest paths between rooms.

---

## Features

*  Manage buildings and their rooms
*  Store and fetch room metadata
*  Manage pathways between points
*  Compute shortest indoor navigation paths
*  Seed test data for quick demos
* Get a complete map structure (buildings + rooms + paths)

---

## Tech Stack

*  **FastAPI**
*  **Python**
*  **PostgreSQL**
*  **SQLAlchemy**
*  **Pydantic & pydantic-settings**
*  **Uvicorn**
*  **FApi**

---

## Configuration

UniMap uses Pydantic Settings for environment configuration.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "UniMap"

    DATABASE_URL: str = "postgresql://aymenpostgres:MOUAINE202005@localhost/db" # or any url here

    class Config:
        env_file = ".env"

settings = Settings()
```

Example `.env` file:

```
APP_NAME=UniMap
DATABASE_URL=postgresql://user:password@localhost/dbname
```

---

## Project Structure

```
app/
 ├── api/
 ├── core/
 ├── models/
 ├── schemas/
 ├── services/
 ├── main.py
 └── ...
```

---

## API Endpoints

### Buildings

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/buildings/`     | List buildings      |
| POST   | `/api/buildings/`     | Create buildings    |
| GET    | `/api/buildings/{id}` | Get single building |

---

### Rooms

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| GET    | `/api/rooms/`                   | List rooms        |
| POST   | `/api/rooms/`                   | Create rooms      |
| GET    | `/api/rooms/{room_id}/metadata` | Get room metadata |

---

### Paths

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| GET    | `/api/path/`         | List paths                          |
| POST   | `/api/path/`         | Create paths                        |
| GET    | `/api/path/shortest` | Get shortest path between two rooms |

---

### Map API

| Method | Endpoint        | Description  |
| ------ | --------------- | ------------ |
| GET    | `/api/map/`     | Get full map |
| POST   | `/api/map/maps` | Create map   |

---

### Testing Utilities

| Method | Endpoint                       | Description                         |
| ------ | ------------------------------ | ----------------------------------- |
| POST   | `/api/test/seed_two_buildings` | Insert two test buildings with data |

---

### Default

| Method | Endpoint  | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

---

## Running the Application

### Install dependencies

```bash
pip install -r requirements.txt
```

### Start the server

```bash
uvicorn app.main:app --reload
```

### API Documentation

* Swagger UI → [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc → [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Database Setup

Ensure PostgreSQL is running.

```sql
CREATE DATABASE unimap;
```

If using Alembic:

```bash
alembic upgrade head
```

---

## License

MIT License

---

Made with ❤️ for clean indoor navigation APIs.
