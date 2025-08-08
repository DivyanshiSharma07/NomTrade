# TradeNom - Next-Generation Trading Platform

A comprehensive full-stack trading simulation platform featuring real-time portfolio management, AI-powered trading insights, KYC verification, and advanced analytics.

## 🚀 Features

### Core Trading Features
- **Real-time Portfolio Management** - Live portfolio tracking with synthetic market data
- **Order Management** - Buy/sell orders with real-time execution
- **Performance Analytics** - Detailed P&L tracking and portfolio performance metrics
- **Market Data** - Real-time price updates and market information

### Advanced Features
- **AI Trading Assistant** - Powered by Google Gemini 2.0 Flash for market analysis and trading insights
- **KYC Verification System** - Complete Know Your Customer workflow with document upload
- **Admin Dashboard** - KYC review and user management capabilities
- **News Integration** - Real-time market news and updates
- **Test Trading** - Simulated trading environment for practice

### User Experience
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Real-time Updates** - Live portfolio updates and price feeds
- **Interactive Charts** - Portfolio performance visualization
- **Secure Authentication** - JWT-based authentication system

## 🏗️ Architecture

### Backend (FastAPI + MongoDB)
- **FastAPI** - High-performance async API framework
- **MongoDB Atlas** - Cloud-native NoSQL database
- **JWT Authentication** - Secure token-based authentication
- **File Upload** - Document management for KYC verification
- **Real-time Data** - Synthetic market data simulation

### Frontend (React)
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **Responsive UI** - Mobile-first design approach
- **Real-time Updates** - Live data synchronization

## 📋 Prerequisites

- **Node.js** 18+ 
- **Python** 3.10+
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd TradeNom
```

### 2. Backend Setup

#### Environment Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirementsv1.txt
pip install -r requirementsv2.txt
```

#### Configure Database
Edit `backend/app/database.py` with your MongoDB connection details:
```python
# MongoDB Atlas URI (recommended) or local MongoDB
MONGO_URI = "your-mongodb-atlas-uri"
DATABASE_NAME = "tradenome_db"
```

#### Add Simulation Data
Place your data files in the following structure:
```
backend/data/
├── simulation_price_data_July_1-Aug_30/
│   └── *.csv files
└── simulation_news_data_July_1-Aug_30/
    └── *.json files
```

#### Start the Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Start the Development Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### Individual Container Setup

#### Backend Container
```bash
cd backend
docker build -t tradenome-backend .
docker run -p 8000:8000 tradenome-backend
```

#### Frontend Container
```bash
cd frontend
docker build -t tradenome-frontend .
docker run -p 3000:3000 tradenome-frontend
```

## 📁 Project Structure

```
TradeNom/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── routers/           # API route handlers
│   │   │   ├── auth.py        # Authentication & KYC
│   │   │   ├── portfolio.py   # Portfolio management
│   │   │   ├── orders.py      # Order management
│   │   │   ├── trading.py     # Trading operations
│   │   │   ├── news.py        # News feed
│   │   │   └── analytics.py   # Analytics & reports
│   │   ├── schemas.py         # Pydantic data models
│   │   ├── crud.py           # Database operations
│   │   ├── database.py       # MongoDB connection
│   │   └── main.py           # FastAPI app entry point
│   ├── data/                 # Simulation data files
│   ├── requirements*.txt     # Python dependencies
│   └── Dockerfile           # Backend container config
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.js  # Main dashboard
│   │   │   ├── Portfolio.js  # Portfolio management
│   │   │   ├── AIChatbot.js  # AI trading assistant
│   │   │   ├── Register.js   # User registration & KYC
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.js          # Main React app
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile          # Frontend container config
└── README.md               # This file
```


## 🤖 AI Features

### Trading Assistant
- Powered by **Google Gemini 2.0 Flash**
- Real-time portfolio analysis
- Market insights and trading recommendations
- Natural language query processing

### Configuration
Update the API key in `frontend/src/components/AIChatbot.js`:
```javascript
const API_KEY = 'your-gemini-api-key';
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **KYC Verification** - Complete identity verification workflow
- **File Upload Security** - Secure document upload with validation
- **CORS Protection** - Configured for secure cross-origin requests
- **Input Validation** - Comprehensive data validation using Pydantic

## 🚀 Production Deployment

### Prerequisites for Production
- MongoDB Atlas cluster
- SSL certificates
- Environment variables configured
- Proper CORS settings

### Backend Production Settings
```bash
# Production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Production Build
```bash
npm run build
# Serve the build folder with a web server like nginx
```

## 🛠️ Troubleshooting

### Common Issues

#### MongoDB Connection Errors
- Verify MongoDB Atlas credentials
- Check IP whitelist settings
- Ensure network connectivity

#### SSL Certificate Issues
```bash
pip install --upgrade certifi
```

#### Port Already in Use
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### Missing Data Files
Ensure simulation data is placed in:
- `backend/data/simulation_price_data_July_1-Aug_30/`
- `backend/data/simulation_news_data_July_1-Aug_30/`

### Development Tips
- Use `--reload` flag for hot reloading during development
- Check browser console for frontend errors
- Monitor backend logs for API issues
- Use MongoDB Compass for database inspection

## 📊 Performance

- **Backend**: Supports concurrent requests with async FastAPI
- **Frontend**: Optimized React components with efficient re-rendering
- **Database**: Indexed queries for fast data retrieval
- **Real-time Updates**: Efficient price update mechanism

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review API documentation at `/docs` endpoint

---

**Built with ❤️ using FastAPI, React, and MongoDB**
