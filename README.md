# RTX 4060 Optimized Portfolio

A cutting-edge 3D interactive portfolio platform with advanced GPU optimization for high-end graphics cards.

## Features

- **3D Interactive Design**: Immersive Three.js powered experiences
- **GPU Optimization**: Specifically optimized for RTX 4060 and similar GPUs
- **Dynamic Content**: 21+ projects with real-time data
- **Contact System**: Email integration with auto-reply functionality
- **Achievement System**: Interactive achievement showcase
- **Responsive Design**: Works on all devices with adaptive rendering
- **Database Integration**: PostgreSQL for data persistence
- **Performance Monitoring**: Real-time FPS and performance tracking

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: Three.js, JavaScript ES6+
- **Database**: PostgreSQL
- **Styling**: Advanced CSS3 with glassmorphism effects
- **Email**: Resend/SendGrid integration
- **Deployment**: Gunicorn WSGI server

## Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up PostgreSQL database**
   - Create a PostgreSQL database
   - Update DATABASE_URL in .env

5. **Run the application**
   ```bash
   python main.py
   ```

## GPU Optimization

The portfolio automatically detects your GPU tier and adjusts:
- Particle count (800 for high-end GPUs)
- Shadow map resolution (2048x2048)
- Anti-aliasing settings
- Post-processing effects
- Pixel ratio optimization

## Deployment

### Manual Deployment
1. Configure your web server (nginx/apache)
2. Set up PostgreSQL database
3. Configure environment variables
4. Run with gunicorn:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
   ```

## Email Configuration

Choose one of the email providers:

### Resend (Recommended)
```env
RESEND_API_KEY=your_resend_api_key
```

### SendGrid
```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

## Browser Compatibility

- Chrome 90+ (Recommended for RTX optimization)
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

1. Use Chrome for best GPU acceleration
2. Enable hardware acceleration in browser settings
3. Close unnecessary tabs for optimal GPU usage
4. Ensure graphics drivers are updated

---
Built with RTX 4060 performance optimization.
