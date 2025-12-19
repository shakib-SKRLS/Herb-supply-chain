import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaFlask, FaIndustry, FaLeaf, FaSeedling, FaQrcode } from 'react-icons/fa';
import '../styles/Login.css';
import '../styles/login-animation.css';
import api from '../utils/api';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Create animated particles
  useEffect(() => {
    const createParticles = () => {
      const container = document.querySelector('.login-animation-container');
      if (!container) return;
      
      // Clear existing particles
      container.innerHTML = '';
      
      // Create herb particles
      for (let i = 0; i < 5; i++) {
        const herbType = Math.floor(Math.random() * 3) + 1;
        const particle = document.createElement('div');
        particle.className = `herb-particle herb-${herbType}`;
        
        // Random starting position
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        // Random delay
        const delay = Math.random() * 10;
        
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
      }
      
      // Create blockchain cubes
      for (let i = 0; i < 3; i++) {
        const cube = document.createElement('div');
        cube.className = 'blockchain-cube';
        
        // Random starting position
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        // Random delay
        const delay = Math.random() * 10;
        
        cube.style.left = `${startX}px`;
        cube.style.top = `${startY}px`;
        cube.style.animationDelay = `${delay}s`;
        
        container.appendChild(cube);
      }
    };
    
    createParticles();
    
    // Recreate particles on window resize
    window.addEventListener('resize', createParticles);
    
    return () => {
      window.removeEventListener('resize', createParticles);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = await api.post('/api/auth/login', { email, password });
      // payload: { success, token, user }
      const { token, user } = payload;
      // Optional: enforce role selection match
      if (role && user.role !== role) {
        setError(`This account has role "${user.role}". Please select the correct role.`);
        setIsLoading(false);
        return;
      }
      // Persist token & user for subsequent requests/UI
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Navigate to dashboard by role
      if (user.role === 'consumer') {
        navigate('/consumer/dashboard');
      } else if (user.role === 'lab') {
        navigate('/lab/dashboard');
      } else if (user.role === 'processor') {
        navigate('/processor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/farmers');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="login-animation-container"></div>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="auth-card">
              <Row className="g-0">
                <Col md={6} className="d-none d-md-block">
                  <div className="login-side-image">
                    <div className="login-side-content">
                      <h2>Herb Traceability</h2>
                      <p>Track authentic herbs with blockchain technology</p>
                      <div className="login-features">
                        <div className="login-feature">
                          <FaLeaf />
                          <h4>Quality Assurance</h4>
                          <p>Verified by labs</p>
                        </div>
                        <div className="login-feature">
                          <FaQrcode />
                          <h4>Easy Tracking</h4>
                          <p>Scan QR codes</p>
                        </div>
                        <div className="login-feature">
                          <FaSeedling />
                          <h4>Authenticity</h4>
                          <p>Blockchain verified</p>
                        </div>
                        <div className="login-feature">
                          <FaIndustry />
                          <h4>Processing</h4>
                          <p>Standardized methods</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <Card.Body>
                    <div className="text-center mb-4 auth-header">
                      <h2 className="fw-bold">Login</h2>
                      <p>Access your dashboard</p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Login as</Form.Label>
                    <Form.Select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="role-select"
                    >
                      {/* Avoid placing SVG/icon elements inside option tags to satisfy DOM nesting rules */}
                      <option value="consumer">Consumer</option>
                      <option value="lab">Laboratory</option>
                      <option value="processor">Processor</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="success"
                      type="submit"
                      className="login-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" /> 
                          Logging in...
                        </>
                      ) : 'Login'}
                    </Button>
                  </div>

                  <div className="mt-3 text-center demo-credentials">
                    <h6>Demo Credentials</h6>
                    <p className="mb-1"><small><code>consumer@example.com / password</code></small></p>
                    <p className="mb-1"><small><code>lab@example.com / password</code></small></p>
                    <p className="mb-0"><small><code>processor@example.com / password</code></small></p>
                  </div>
                </Form>
                </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;