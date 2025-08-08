https://www.canva.com/design/DAGvdLL_rbk/6-zzkWEASK_JbgquMtsKQg/edit?utm_content=DAGvdLL_rbk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
# TradeNom - Next-Gen Trading Platform

## Overview
TradeNom is a full-stack trading simulation platform with user authentication, portfolio management, order placement, analytics, and news. The backend is built with FastAPI and MongoDB, and the frontend is built with React.

---

## Features
- User authentication (register/login)
- Portfolio and order management
- Reports & Analytics (CSV-based and DB-based)
- News feed (from simulation data)
- Test trading

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd TradeNom
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirementsv1.txt
pip install -r requirementsv2.txt

```

#### Configure MongoDB
- Edit `backend/app/database.py` with your MongoDB Atlas URI and DB name if needed.

#### Run the Backend
```bash
uvicorn app.main:app --reload
```
- The API will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
- The frontend will be available at `http://localhost:3000`

---

## Data
- Place your simulation CSVs in `backend/data/simulation_price_data_July_1-Aug_30/`
- Place your news JSONs in `backend/data/simulation_news_data_July_1-Aug_30/`

---

## Environment Variables
- You may use a `.env` file for sensitive settings (MongoDB URI, etc.)

---

## Troubleshooting
- If you see MongoDB connection errors, check your Atlas cluster, IP whitelist, and credentials.
- For SSL errors, try upgrading `certifi`:
  ```
  pip install --upgrade certifi
  ```
- Make sure your data files are in the correct location.

---

## Project Structure
```
TradeNom/
  backend/
    app/
      routers/
      database.py
      main.py
    data/
  frontend/
    src/
      components/
      pages/
```

---

## License
MIT
