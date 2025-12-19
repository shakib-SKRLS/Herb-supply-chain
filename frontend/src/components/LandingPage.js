import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="hero-content">
              <h1 className="hero-title">Blockchain Herb Traceability</h1>
              <p className="hero-subtitle">
                Ensuring authenticity and quality of medicinal herbs through transparent blockchain tracking
              </p>
              <Link to="/login">
                <Button variant="primary" size="lg" className="hero-button">
                  Get Started
                </Button>
              </Link>
            </Col>
            <Col md={6} className="hero-image-container">
              <div className="hero-image">
                <div className="floating-icons">
                  <div className="icon icon-1">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <div className="icon icon-2">
                    <i className="fas fa-flask"></i>
                  </div>
                  <div className="icon icon-3">
                    <i className="fas fa-industry"></i>
                  </div>
                  <div className="icon icon-4">
                    <i className="fas fa-qrcode"></i>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <Container>
          <h2 className="section-title text-center">How It Works</h2>
          <div className="section-divider"></div>
          <Row className="mt-5">
            <Col md={3}>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-seedling"></i>
                </div>
                <h3>Herb Sourcing</h3>
                <p>Farmers register herbs with location and cultivation details</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-vial"></i>
                </div>
                <h3>Quality Testing</h3>
                <p>Labs verify and certify herb quality and authenticity</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-box-open"></i>
                </div>
                <h3>Processing</h3>
                <p>Processors prepare herbs with standardized methods</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-user-check"></i>
                </div>
                <h3>Consumer Verification</h3>
                <p>Scan QR code to verify complete herb journey</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="benefits-image">
                <div className="blockchain-animation">
                  <div className="block block-1"></div>
                  <div className="block block-2"></div>
                  <div className="block block-3"></div>
                  <div className="block block-4"></div>
                  <div className="chain"></div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <h2 className="section-title">Why Choose Our Platform?</h2>
              <div className="section-divider"></div>
              <ul className="benefits-list">
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Complete transparency from farm to consumer</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Immutable blockchain records ensure data integrity</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Quality certification from authorized laboratories</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Easy verification through QR code scanning</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Support for local farmers and sustainable practices</span>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <Container>
          <h2 className="section-title text-center">What Our Users Say</h2>
          <div className="section-divider"></div>
          <Row className="mt-5">
            <Col md={4}>
              <Card className="testimonial-card">
                <Card.Body>
                  <div className="testimonial-quote">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <Card.Text>
                    "As a consumer, I can now verify the authenticity of herbs I purchase. The transparency this platform provides is revolutionary."
                  </Card.Text>
                  <div className="testimonial-author">
                    <h5>Priya Sharma</h5>
                    <p>Consumer</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="testimonial-card">
                <Card.Body>
                  <div className="testimonial-quote">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <Card.Text>
                    "Our lab can now provide verifiable certification that integrates seamlessly with the supply chain. It's improved our credibility."
                  </Card.Text>
                  <div className="testimonial-author">
                    <h5>Dr. Rajesh Kumar</h5>
                    <p>Laboratory Director</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="testimonial-card">
                <Card.Body>
                  <div className="testimonial-quote">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <Card.Text>
                    "The blockchain integration has streamlined our processing workflow and increased consumer trust in our products."
                  </Card.Text>
                  <div className="testimonial-author">
                    <h5>Anita Patel</h5>
                    <p>Herb Processor</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <Container className="text-center">
          <h2>Ready to Experience Transparent Herb Traceability?</h2>
          <p>Join our platform today and be part of the revolution in medicinal herb authentication</p>
          <Link to="/login">
            <Button variant="primary" size="lg" className="cta-button">
              Get Started Now
            </Button>
          </Link>
        </Container>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <Row>
            <Col md={4}>
              <h4>Herb Traceability</h4>
              <p>Ensuring authenticity through blockchain technology</p>
            </Col>
            <Col md={4}>
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/login">Login</Link></li>
                <li><a href="#features">How It Works</a></li>
                <li><a href="#benefits">Benefits</a></li>
              </ul>
            </Col>
            <Col md={4}>
              <h4>Contact Us</h4>
              <p>
                <i className="fas fa-envelope"></i> info@herbtraceability.com<br />
                <i className="fas fa-phone"></i> +91 123 456 7890
              </p>
              <div className="social-icons">
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
              </div>
            </Col>
          </Row>
          <div className="copyright">
            <p>&copy; 2023 Herb Traceability. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;