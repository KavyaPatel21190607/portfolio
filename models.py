from app import db
from datetime import datetime
import json

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    tech_stack = db.Column(db.Text)  # JSON string of technologies
    github_url = db.Column(db.String(200))
    live_url = db.Column(db.String(200))
    image_url = db.Column(db.String(200))
    category = db.Column(db.String(50))
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    proficiency = db.Column(db.Integer, nullable=False)  # 1-100
    years_experience = db.Column(db.Integer, default=0)

class Testimonial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100))
    position = db.Column(db.String(100))
    content = db.Column(db.Text, nullable=False)
    avatar_url = db.Column(db.String(200))
    location = db.Column(db.String(100))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Timeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100))
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    category = db.Column(db.String(50))  # job, education, certification, etc.
    current = db.Column(db.Boolean, default=False)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='new')

class Stats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(50), nullable=False)
    metric_value = db.Column(db.Integer, nullable=False)
    metric_label = db.Column(db.String(100))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Professional Development, Competitions, etc.
    organization = db.Column(db.String(100))
    description = db.Column(db.Text)
    date_achieved = db.Column(db.Date)
    icon = db.Column(db.String(50))  # FontAwesome icon class
    badge_color = db.Column(db.String(20))  # Color theme for the achievement
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def init_sample_data():
    """Initialize the database with sample portfolio data"""
    
    # Complete projects portfolio
    projects = [
        {
            'title': 'LoveCompiler',
            'description': 'A multi-language compiler platform that supports various programming languages with real-time compilation and execution capabilities.',
            'tech_stack': json.dumps(['Python', 'Flask', 'JavaScript', 'Docker', 'Compiler Design']),
            'category': 'Full Stack',
            'featured': True,
            'github_url': '#',
            'live_url': '#',
            'image_url': '/static/assets/images/projects/love-compiler.svg'
        },
        {
            'title': 'Simple Portfolio Page',
            'description': 'A clean and minimalist portfolio website showcasing personal projects and skills with responsive design.',
            'tech_stack': json.dumps(['HTML5', 'CSS3', 'JavaScript', 'Bootstrap']),
            'category': 'Frontend',
            'featured': True,
            'image_url': '/static/assets/images/projects/simple-portfolio.svg'
        },
        {
            'title': 'AI Powered Relationship Adviser',
            'description': 'An intelligent relationship counseling platform using natural language processing to provide personalized advice and insights.',
            'tech_stack': json.dumps(['Python', 'Flask', 'TensorFlow', 'NLP', 'SQLite']),
            'category': 'AI/ML',
            'featured': True,
            'image_url': '/static/assets/images/projects/ai-relationship-adviser.svg'
        },
        {
            'title': 'Farming Assistant Chatbot',
            'description': 'A comprehensive chatbot that helps farmers with crop management, weather forecasts, and agricultural best practices.',
            'tech_stack': json.dumps(['Python', 'Flask', 'NLP', 'Weather API', 'Agriculture DB']),
            'category': 'AI/ML',
            'featured': True,
            'image_url': '/static/assets/images/projects/farming-chatbot.svg'
        },
        {
            'title': 'Weather Forecast App',
            'description': 'Real-time weather application with detailed forecasts, interactive maps, and location-based weather alerts.',
            'tech_stack': json.dumps(['Python', 'Flask', 'Weather API', 'JavaScript', 'Charts.js']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/weather-forecast.svg'
        },
        {
            'title': 'Kissan Kalyan',
            'description': 'A farmer welfare platform providing government scheme information, crop insurance, and agricultural support services.',
            'tech_stack': json.dumps(['Python', 'Flask', 'PostgreSQL', 'Bootstrap', 'Payment Gateway']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/kissan-kalyan.svg'
        },
        {
            'title': 'Finance App',
            'description': 'Comprehensive financial management application with separate user and admin panels for expense tracking and financial planning.',
            'tech_stack': json.dumps(['Python', 'Flask', 'PostgreSQL', 'Chart.js', 'Bootstrap']),
            'category': 'Fintech',
            'featured': True,
            'image_url': '/static/assets/images/projects/finance-app.svg'
        },
        {
            'title': 'Phishing Link Detector',
            'description': 'AI-powered security tool that detects malicious links, IP loggers, and phishing attempts using machine learning algorithms.',
            'tech_stack': json.dumps(['Python', 'Machine Learning', 'Flask', 'URL Analysis', 'Security']),
            'category': 'AI/ML',
            'featured': True,
            'image_url': '/static/assets/images/projects/phishing-detector.svg'
        },
        {
            'title': 'Scientific Calculator',
            'description': 'Advanced scientific calculator web application with complex mathematical functions and equation solving capabilities.',
            'tech_stack': json.dumps(['Python', 'Flask', 'JavaScript', 'MathJS', 'Bootstrap']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/scientific-calculator.svg'
        },
        {
            'title': 'Voter Mitra App',
            'description': 'Election management platform with voter registration, candidate profiles, and secure voting system for democratic processes.',
            'tech_stack': json.dumps(['Python', 'Flask', 'PostgreSQL', 'Security', 'Admin Panel']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/voter-mitra.svg'
        },
        {
            'title': 'Payment Gateway',
            'description': 'Secure payment processing system with multi-payment method support and transaction management capabilities.',
            'tech_stack': json.dumps(['Python', 'Flask', 'Stripe API', 'PayPal API', 'Security']),
            'category': 'Fintech',
            'featured': True,
            'image_url': '/static/assets/images/projects/payment-gateway.svg'
        },
        {
            'title': 'CarbonChain Marketplace',
            'description': 'Blockchain-based carbon credit trading platform with smart contracts and environmental impact tracking.',
            'tech_stack': json.dumps(['Solidity', 'Web3.js', 'React', 'Blockchain', 'Smart Contracts']),
            'category': 'Blockchain',
            'featured': True,
            'image_url': '/static/assets/images/projects/carbonchain-marketplace.svg'
        },
        {
            'title': 'Emergency Response & Blood Donation App',
            'description': 'Life-saving application connecting blood donors with recipients and emergency services for rapid response.',
            'tech_stack': json.dumps(['React Native', 'Node.js', 'MongoDB', 'GPS', 'Push Notifications']),
            'category': 'Mobile',
            'featured': True,
            'image_url': '/static/assets/images/projects/emergency-blood-donation.svg'
        },
        {
            'title': 'Calculus Solver',
            'description': 'Step-by-step mathematical solution platform for calculus problems with detailed explanations and graphical representations.',
            'tech_stack': json.dumps(['Python', 'Flask', 'SymPy', 'MathJax', 'Plotly']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/calculus-solver.svg'
        },
        {
            'title': 'Romantic Proposal Website',
            'description': 'Interactive and personalized proposal website with multimedia elements and romantic design for special moments.',
            'tech_stack': json.dumps(['HTML5', 'CSS3', 'JavaScript', 'Animation', 'Multimedia']),
            'category': 'Frontend',
            'featured': True,
            'image_url': '/static/assets/images/projects/romantic-proposal.svg'
        },
        {
            'title': 'TradePro - Trading Application',
            'description': 'Professional web-based trading platform with real-time market data, technical analysis, and portfolio management.',
            'tech_stack': json.dumps(['React', 'Node.js', 'WebSocket', 'Trading APIs', 'Chart.js']),
            'category': 'Fintech',
            'featured': True,
            'image_url': '/static/assets/images/projects/tradepro.svg'
        },
        {
            'title': 'Lavender Voice Reminder',
            'description': 'Voice-activated to-do list application with speech recognition and audio reminders for task management.',
            'tech_stack': json.dumps(['JavaScript', 'Web Speech API', 'Local Storage', 'PWA']),
            'category': 'Frontend',
            'featured': True,
            'image_url': '/static/assets/images/projects/lavender-voice-reminder.svg'
        },
        {
            'title': 'ShikshaSankalp - Rural E-Learning',
            'description': 'Educational platform designed for rural areas with offline capabilities and multilingual content delivery.',
            'tech_stack': json.dumps(['Python', 'Django', 'Progressive Web App', 'Offline Storage']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/shiksha-sankalp.svg'
        },
        {
            'title': 'E-commerce Website Store',
            'description': 'Professional e-commerce platform for selling digital products and services with integrated payment processing.',
            'tech_stack': json.dumps(['Python', 'Django', 'PostgreSQL', 'Stripe', 'Bootstrap']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/ecommerce-store.svg'
        },
        {
            'title': 'YouTube Clone',
            'description': 'Video sharing platform with upload functionality, streaming capabilities, and user interaction features.',
            'tech_stack': json.dumps(['React', 'Node.js', 'MongoDB', 'FFmpeg', 'AWS S3']),
            'category': 'Full Stack',
            'featured': True,
            'image_url': '/static/assets/images/projects/youtube-clone.svg'
        },
        {
            'title': 'Premium Portfolio Page',
            'description': 'High-end portfolio website with advanced animations, 3D effects, and professional design elements.',
            'tech_stack': json.dumps(['React', 'Three.js', 'GSAP', 'CSS3', 'WebGL']),
            'category': 'Frontend',
            'featured': True,
            'image_url': '/static/assets/images/projects/premium-portfolio.svg'
        }
    ]
    
    for project_data in projects:
        project = Project(**project_data)
        db.session.add(project)
    
    # Sample skills
    skills = [
        {'name': 'Python', 'category': 'Backend', 'proficiency': 95, 'years_experience': 5},
        {'name': 'JavaScript', 'category': 'Frontend', 'proficiency': 90, 'years_experience': 4},
        {'name': 'React', 'category': 'Frontend', 'proficiency': 85, 'years_experience': 3},
        {'name': 'Node.js', 'category': 'Backend', 'proficiency': 80, 'years_experience': 3},
        {'name': 'Three.js', 'category': 'Graphics', 'proficiency': 75, 'years_experience': 2},
        {'name': 'Machine Learning', 'category': 'AI', 'proficiency': 80, 'years_experience': 3},
        {'name': 'Docker', 'category': 'DevOps', 'proficiency': 70, 'years_experience': 2},
        {'name': 'AWS', 'category': 'Cloud', 'proficiency': 75, 'years_experience': 2}
    ]
    
    for skill_data in skills:
        skill = Skill(**skill_data)
        db.session.add(skill)
    
    # Sample testimonials
    testimonials = [
        {
            'name': 'Sarah Johnson',
            'company': 'TechCorp Inc.',
            'position': 'CTO',
            'content': 'Outstanding work on our analytics platform. Delivered exceptional results ahead of schedule.',
            'location': 'San Francisco, CA',
            'latitude': 37.7749,
            'longitude': -122.4194
        },
        {
            'name': 'Michael Chen',
            'company': 'StartupXYZ',
            'position': 'Founder',
            'content': 'Incredible attention to detail and innovative solutions. Highly recommended for complex projects.',
            'location': 'New York, NY',
            'latitude': 40.7128,
            'longitude': -74.0060
        }
    ]
    
    for testimonial_data in testimonials:
        testimonial = Testimonial(**testimonial_data)
        db.session.add(testimonial)
    
    # Sample timeline
    timeline_items = [
        {
            'title': 'Computer Science Degree',
            'company': 'Karnavati University',
            'description': 'pursuing a Bachelor of Technology in Computer Science',
            'start_date': datetime(2024, 8, 1).date(),
            'category': 'student',
            'current': True
        },
    ]
    
    for timeline_data in timeline_items:
        timeline = Timeline(**timeline_data)
        db.session.add(timeline)
    
    # Portfolio statistics
    stats = [
        {'metric_name': 'projects_completed', 'metric_value': 21, 'metric_label': 'Projects Completed'},
        {'metric_name': 'years_experience', 'metric_value': 3, 'metric_label': 'Years Experience'},
        {'metric_name': 'technologies', 'metric_value': 15, 'metric_label': 'Technologies Mastered'},
        {'metric_name': 'achievements', 'metric_value': 8, 'metric_label': 'Professional Achievements'}
    ]
    
    for stat_data in stats:
        stat = Stats(**stat_data)
        db.session.add(stat)
    
    # Sample achievements
    achievements = [
        # Professional Development
        {
            'title': 'Getting Started with Linux Fundamentals (RH104)',
            'category': 'Professional Development',
            'organization': 'Red Hat',
            'description': 'Completed foundational Linux system administration training',
            'date_achieved': datetime(2024, 1, 15).date(),
            'icon': 'fas fa-server',
            'badge_color': 'neon-red'
        },
        {
            'title': 'Introduction to Linux (LFS101)',
            'category': 'Professional Development',
            'organization': 'Linux Foundation',
            'description': 'Comprehensive introduction to Linux operating system fundamentals',
            'date_achieved': datetime(2024, 2, 10).date(),
            'icon': 'fab fa-linux',
            'badge_color': 'neon-orange'
        },
        {
            'title': 'Red Hat System Administration I (RH124)',
            'category': 'Professional Development',
            'organization': 'Red Hat',
            'description': 'Advanced system administration and enterprise Linux management',
            'date_achieved': datetime(2024, 3, 20).date(),
            'icon': 'fas fa-cogs',
            'badge_color': 'neon-red'
        },
        {
            'title': 'Certified AI Prompt Engineer - Be10x (Beginner)',
            'category': 'Professional Development',
            'organization': 'Be10x',
            'description': 'Specialized training in AI prompt engineering and optimization techniques',
            'date_achieved': datetime(2024, 6, 5).date(),
            'icon': 'fas fa-robot',
            'badge_color': 'neon-purple'
        },
        # Competitions & Hackathons
        {
            'title': 'Global Game Jam 2025',
            'category': 'Competitions & Hackathons',
            'organization': 'Global Game Jam',
            'description': 'Participated in the world\'s largest game development event, creating innovative games in 48 hours',
            'date_achieved': datetime(2025, 1, 26).date(),
            'icon': 'fas fa-gamepad',
            'badge_color': 'neon-cyan'
        },
        {
            'title': 'Pitch-a-thon at Karnavati University',
            'category': 'Competitions & Hackathons',
            'organization': 'Karnavati University',
            'description': 'Competed in innovative pitch competition showcasing entrepreneurial solutions',
            'date_achieved': datetime(2024, 10, 15).date(),
            'icon': 'fas fa-lightbulb',
            'badge_color': 'neon-yellow'
        },
        {
            'title': 'Code-a-thon at Karnavati University',
            'category': 'Competitions & Hackathons',
            'organization': 'Karnavati University',
            'description': 'Intensive coding competition focused on algorithmic problem solving and software development',
            'date_achieved': datetime(2024, 9, 12).date(),
            'icon': 'fas fa-code',
            'badge_color': 'neon-green'
        },
        {
            'title': 'Ariro 3.0 Technical Symposium - Code-a-thon',
            'category': 'Competitions & Hackathons',
            'organization': 'Ariro Technical Symposium',
            'description': 'Advanced technical coding competition as part of prestigious technology symposium',
            'date_achieved': datetime(2024, 11, 8).date(),
            'icon': 'fas fa-trophy',
            'badge_color': 'neon-gold'
        }
    ]
    
    for achievement_data in achievements:
        achievement = Achievement(**achievement_data)
        db.session.add(achievement)
    
    db.session.commit()
