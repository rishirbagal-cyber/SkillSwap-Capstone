import React from 'react';
import { Users, BookOpen, Globe, Award, Zap, ArrowRight, MousePointer2 } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const scrollToFeatures = () => {
    const featuresElement = document.getElementById('features');
    featuresElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-wrapper">
      <section className="hero-section">
        <h1 className="hero-headline">
          Swap Skills. <br />
          <span>Grow Together.</span>
        </h1>
        <p className="hero-subtitle">
          The high-impact peer learning network for students. 
          Trade what you know for what you want to learn.
        </p>
        <div className="cta-group">
          <button onClick={onGetStarted} className="btn-primary">
            Get Started <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </button>
          <button onClick={scrollToFeatures} className="btn-secondary">
            Explore Skills <MousePointer2 size={18} style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Users size={32} />
            </div>
            <h3>Find Skill Partners</h3>
            <p>Our neural matching algorithm pairs you with the perfect mentor based on your specific learning targets.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={32} />
            </div>
            <h3>Exchange Knowledge</h3>
            <p>Direct peer-to-peer exchange where teaching one hour earns you one hour of learning from an expert.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Globe size={32} />
            </div>
            <h3>Online & Offline</h3>
            <p>Meet in person at campus hubs or stream sessions through our integrated neural video collab tools.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Award size={32} />
            </div>
            <h3>Build Your Profile</h3>
            <p>Earn XP, unlock rare badges, and build a verified reputation as a top-tier peer educator.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;