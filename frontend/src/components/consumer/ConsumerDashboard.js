import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import QRVerificationService from './QRVerificationService';
import '../../styles/Dashboard.css';

const ConsumerDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [ordersWithLab, setOrdersWithLab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRVerification, setShowQRVerification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders');
        const orderList = (res?.data || []).map((o) => ({
          _id: o._id,
          status: o.status,
          createdAt: o.createdAt,
          items: o.items || [],
        }));
        setOrders(orderList);
        // Enrich with latest lab result for the first herb in each order
        const enriched = await Promise.all(orderList.map(async (ord) => {
          const firstItem = ord.items && ord.items[0];
          const herbId = (firstItem?.herb && (firstItem.herb._id || firstItem.herb)) || null;
          let latestLab = null;
          try {
            if (herbId) {
              const labRes = await api.get(`/api/lab-results/herb/${herbId}/latest`);
              latestLab = labRes?.data || null;
            }
          } catch (_) {}
          return { ...ord, herbId, lab: latestLab };
        }));
        setOrdersWithLab(enriched);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">Herb Traceability</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/consumer/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/consumer/herb-selection">Browse Herbs</Nav.Link>
              <Nav.Link as={Link} to="/consumer/order-history">Order History</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4 dashboard-container">
        <div className="dashboard-particles">
          {[...Array(10)].map((_, i) => (
            <span 
              key={i} 
              className="particle" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            ></span>
          ))}
        </div>
        
        <Row>
          <Col>
            <h2 className="dashboard-title">Consumer Dashboard</h2>
            <p className="text-muted">Welcome, {user?.name || 'Consumer'}</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <Card className="mb-4 dashboard-card">
              <Card.Body>
                <Card.Title>Track Your Orders</Card.Title>
                <Card.Text>
                  View the status and details of your herb orders with complete traceability.
                </Card.Text>
                <Button 
                  variant="success" 
                  as={Link} 
                  to="/consumer/order-history"
                  className="action-btn"
                >
                  View All Orders
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 dashboard-card">
              <Card.Body>
                <Card.Title>Browse Herbs</Card.Title>
                <Card.Text>
                  Explore our selection of high-quality herbs with complete blockchain-verified traceability.
                </Card.Text>
                <Button 
                  variant="success" 
                  as={Link} 
                  to="/consumer/herb-selection"
                  className="action-btn"
                >
                  Browse Herbs
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 dashboard-card">
              <Card.Body>
                <Card.Title>Verify Lab Results</Card.Title>
                <Card.Text>
                  Scan QR codes to verify the authenticity and quality of lab test results for your herbs.
                </Card.Text>
                <Button 
                  variant="info" 
                  onClick={() => setShowQRVerification(!showQRVerification)}
                  className="action-btn"
                >
                  {showQRVerification ? 'Hide QR Scanner' : 'Verify QR Code'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* QR Verification Service */}
        {showQRVerification && (
          <Row className="mb-4">
            <Col>
              <QRVerificationService />
            </Col>
          </Row>
        )}

        <Row>
          <Col>
            <h4 className="dashboard-title">Recent Orders</h4>
            {loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner"></div>
                <p className="mt-3">Loading your orders...</p>
              </div>
            ) : (
              <Row>
                {ordersWithLab.length > 0 ? (
                  ordersWithLab.map((order) => (
                    <Col md={6} key={order._id} className="mb-4">
                      <Card className="dashboard-card">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="card-title mb-0">Order #{String(order._id).substring(0,8)}</h5>
                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <Card.Text>
                            <strong>Herb:</strong> {order.items?.[0]?.herb?.name || 'Herb'}
                            <br />
                            <strong>Quantity:</strong> {order.items?.[0]?.quantity || '-'}
                            <br />
                            <strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                            <br />
                            {order.lab ? (
                              <>
                                <strong>Current Lab Status:</strong> {order.lab.status || '—'}
                                <br />
                                <span className="text-muted small">
                                  Moisture: {order.lab?.testResults?.moistureContent ?? '—'}% • Ash: {order.lab?.testResults?.ashContent ?? '—'}% • Foreign Matter: {order.lab?.testResults?.foreignMatter ?? '—'}%
                                </span>
                              </>
                            ) : (
                              <span className="text-muted small">No lab results yet</span>
                            )}
                          </Card.Text>
                          <Button 
                            variant="outline-primary" 
                            as={Link} 
                            to={`/consumer/order-tracking/${order._id}`}
                            className="action-btn"
                          >
                            Track Order
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col>
                    <p className="text-center">You don't have any orders yet. Browse our herbs to place your first order!</p>
                  </Col>
                )}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ConsumerDashboard;