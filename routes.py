from flask import render_template, request, jsonify, redirect, url_for, flash, make_response
from app import app, db
from models import Project, Skill, Testimonial, Timeline, Contact, Stats, Achievement
import json
from datetime import datetime

@app.route('/')
def index():
    """Main portfolio homepage"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Interactive dashboard page"""
    return render_template('dashboard.html')

# API Routes
@app.route('/api/projects')
def get_projects():
    """Get all projects with optional filtering"""
    category = request.args.get('category')
    featured_only = request.args.get('featured', '').lower() == 'true'
    
    query = Project.query
    
    if category:
        query = query.filter(Project.category == category)
    if featured_only:
        query = query.filter(Project.featured == True)
    
    projects = query.order_by(Project.created_at.desc()).all()
    
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'description': p.description,
        'tech_stack': json.loads(p.tech_stack) if p.tech_stack else [],
        'github_url': p.github_url,
        'live_url': p.live_url,
        'image_url': p.image_url,
        'category': p.category,
        'featured': p.featured,
        'created_at': p.created_at.isoformat() if p.created_at else None
    } for p in projects])

@app.route('/api/skills')
def get_skills():
    """Get all skills grouped by category"""
    skills = Skill.query.all()
    
    # Group skills by category
    skills_by_category = {}
    for skill in skills:
        if skill.category not in skills_by_category:
            skills_by_category[skill.category] = []
        skills_by_category[skill.category].append({
            'id': skill.id,
            'name': skill.name,
            'proficiency': skill.proficiency,
            'years_experience': skill.years_experience
        })
    
    return jsonify(skills_by_category)

@app.route('/api/testimonials')
def get_testimonials():
    """Get all testimonials"""
    testimonials = Testimonial.query.order_by(Testimonial.created_at.desc()).all()
    
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'company': t.company,
        'position': t.position,
        'content': t.content,
        'avatar_url': t.avatar_url,
        'location': t.location,
        'latitude': t.latitude,
        'longitude': t.longitude,
        'created_at': t.created_at.isoformat() if t.created_at else None
    } for t in testimonials])

@app.route('/api/timeline')
def get_timeline():
    """Get timeline items"""
    timeline_items = Timeline.query.order_by(Timeline.start_date.desc()).all()
    
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'company': t.company,
        'description': t.description,
        'start_date': t.start_date.isoformat() if t.start_date else None,
        'end_date': t.end_date.isoformat() if t.end_date else None,
        'category': t.category,
        'current': t.current
    } for t in timeline_items])

@app.route('/api/stats')
def get_stats():
    """Get portfolio statistics"""
    stats = Stats.query.all()
    
    return jsonify([{
        'metric_name': s.metric_name,
        'metric_value': s.metric_value,
        'metric_label': s.metric_label,
        'updated_at': s.updated_at.isoformat() if s.updated_at else None
    } for s in stats])

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Handle contact form submissions with real-time email notifications"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Import email service
        from email_service import EmailService
        email_service = EmailService()
        
        # Create new contact entry in database
        contact = Contact(
            name=data['name'].strip(),
            email=data['email'].strip(),
            subject=data.get('subject', '').strip(),
            message=data['message'].strip()
        )
        
        db.session.add(contact)
        db.session.commit()
        
        # Send email notification to you
        email_result = email_service.send_contact_notification(data)
        
        # Send auto-reply to the person who contacted
        auto_reply_result = email_service.send_auto_reply(data)
        
        if email_result.get('success'):
            app.logger.info(f"Contact notification sent successfully. Email ID: {email_result.get('email_id')}")
            
            return jsonify({
                'success': True,
                'message': 'Thank you for your message! I\'ll get back to you soon.'
            })
        else:
            # Even if email fails, the contact is saved in database
            app.logger.warning(f"Email notification failed: {email_result.get('error')}")
            return jsonify({
                'success': True,
                'message': 'Thank you for your message! I\'ll get back to you soon.',
                'note': 'Message saved successfully'
            })
        
    except Exception as e:
        app.logger.error(f"Contact form error: {str(e)}")
        return jsonify({'error': 'An error occurred while sending your message'}), 500

@app.route('/api/achievements')
def get_achievements():
    """Get all achievements grouped by category"""
    achievements = Achievement.query.order_by(Achievement.date_achieved.desc()).all()
    
    # Group achievements by category
    grouped_achievements = {}
    for achievement in achievements:
        category = achievement.category
        if category not in grouped_achievements:
            grouped_achievements[category] = []
        
        grouped_achievements[category].append({
            'id': achievement.id,
            'title': achievement.title,
            'organization': achievement.organization,
            'description': achievement.description,
            'date_achieved': achievement.date_achieved.isoformat() if achievement.date_achieved else None,
            'icon': achievement.icon,
            'badge_color': achievement.badge_color
        })
    
    return jsonify(grouped_achievements)

@app.route('/api/social')
def get_social_feed():
    """Get social media feed data (placeholder for future implementation)"""
    # This would typically fetch from external APIs like Twitter/X
    # For now, returning mock structure
    return jsonify([
        {
            'id': 1,
            'platform': 'twitter',
            'content': 'Just shipped a new feature using Three.js! The 3D animations turned out amazing.',
            'timestamp': '2024-01-15T10:30:00Z',
            'likes': 42,
            'retweets': 8
        },
        {
            'id': 2,
            'platform': 'github',
            'content': 'Pushed latest updates to the portfolio project repository',
            'timestamp': '2024-01-14T15:45:00Z',
            'stars': 15
        }
    ])

@app.route('/download/source')
def download_source():
    """Generate and serve a downloadable source code package"""
    import zipfile
    import io
    import os
    from flask import send_file
    
    # Create a zip file in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add all Python files
        for py_file in ['app.py', 'main.py', 'models.py', 'routes.py', 'email_service.py']:
            if os.path.exists(py_file):
                zip_file.write(py_file)
        
        # Add configuration files
        for config_file in ['pyproject.toml', 'runtime.txt', 'Procfile', '.replit']:
            if os.path.exists(config_file):
                zip_file.write(config_file)
        
        # Add static files
        for root, dirs, files in os.walk('static'):
            for file in files:
                file_path = os.path.join(root, file)
                zip_file.write(file_path)
        
        # Add templates
        for root, dirs, files in os.walk('templates'):
            for file in files:
                file_path = os.path.join(root, file)
                zip_file.write(file_path)
        
        # Add requirements.txt
        requirements_content = """flask==3.0.0
flask-sqlalchemy==3.1.1
flask-cors==4.0.0
gunicorn==21.2.0
psycopg2-binary==2.9.9
email-validator==2.1.0
resend==0.7.0
sendgrid==6.10.0
sqlalchemy==2.0.23
werkzeug==3.0.1
"""
        zip_file.writestr('requirements.txt', requirements_content)
        
        # Add .env.example file
        env_example = """# Environment Variables Template
DATABASE_URL=postgresql://username:password@localhost:5432/portfolio_db
SESSION_SECRET=your-secret-key-here
RESEND_API_KEY=your-resend-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
"""
        zip_file.writestr('.env.example', env_example)
        
        # Add comprehensive README
        readme_content = """# RTX 4060 Optimized Portfolio

A cutting-edge 3D interactive portfolio platform with advanced GPU optimization for high-end graphics cards.

## 🚀 Features

- **3D Interactive Design**: Immersive Three.js powered experiences
- **GPU Optimization**: Specifically optimized for RTX 4060 and similar GPUs
- **Dynamic Content**: 21+ projects with real-time data
- **Contact System**: Email integration with auto-reply functionality
- **Achievement System**: Interactive achievement showcase
- **Responsive Design**: Works on all devices with adaptive rendering
- **Database Integration**: PostgreSQL for data persistence
- **Performance Monitoring**: Real-time FPS and performance tracking

## 🛠 Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: Three.js, JavaScript ES6+
- **Database**: PostgreSQL
- **Styling**: Advanced CSS3 with glassmorphism effects
- **Email**: Resend/SendGrid integration
- **Deployment**: Gunicorn WSGI server

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Set up PostgreSQL database**
   - Create a PostgreSQL database
   - Update DATABASE_URL in .env

6. **Run the application**
   ```bash
   python main.py
   ```

## 🎮 GPU Optimization

The portfolio automatically detects your GPU tier and adjusts:
- Particle count (800 for high-end GPUs)
- Shadow map resolution (2048x2048)
- Anti-aliasing settings
- Post-processing effects
- Pixel ratio optimization

## 🌐 Deployment

### Replit Deployment
1. Import project to Replit
2. Set environment variables in Secrets
3. Run with the configured workflow

### Manual Deployment
1. Configure your web server (nginx/apache)
2. Set up PostgreSQL database
3. Configure environment variables
4. Run with gunicorn:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
   ```

## 📧 Email Configuration

Choose one of the email providers:

### Resend (Recommended)
```env
RESEND_API_KEY=your_resend_api_key
```

### SendGrid
```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

## 🎨 Customization

### Adding Projects
Edit `models.py` and add projects via the admin interface or database.

### Modifying 3D Effects
Edit `static/js/3d-renderer.js` for custom 3D animations.

### Styling Changes
Modify `static/css/base.css` and `static/css/3d.css` for visual updates.

## 📱 Browser Compatibility

- Chrome 90+ (Recommended for RTX optimization)
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔧 Performance Tips

1. Use Chrome for best GPU acceleration
2. Enable hardware acceleration in browser settings
3. Close unnecessary tabs for optimal GPU usage
4. Ensure graphics drivers are updated

## 📄 License

This portfolio template is open source. Feel free to use and modify.

## 🤝 Support

For questions or issues, contact via the portfolio contact form.

---
Built with ❤️ and optimized for RTX 4060 performance.
"""
        zip_file.writestr('README.md', readme_content)
    
    zip_buffer.seek(0)
    
    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name='kavya-portfolio-rtx-optimized.zip',
        mimetype='application/zip'
    )

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500
