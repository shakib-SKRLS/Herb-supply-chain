import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Navbar, Nav, Badge } from 'react-bootstrap';
import api from '../../utils/api';

const FarmerDetail = ({ user }) => {
  const { farmerId } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Selection state
  const [selectedHerbId, setSelectedHerbId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [fRes, hRes] = await Promise.all([
        api.get(`/api/farmers/${farmerId}`),
        api.get(`/api/herbs?all=1&farmer=${encodeURIComponent(farmerId)}`),
      ]);
      setFarmer(fRes?.data || null);
      setHerbs(hRes?.data || []);
      // Preselect first available herb
      const first = (hRes?.data || [])[0];
      if (first) setSelectedHerbId(first._id);
    } catch (e) {
      setError(e.message || 'Failed to load farmer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  const handleLogout = () => navigate('/');

  const selectedHerb = useMemo(() => herbs.find(h => h._id === selectedHerbId), [herbs, selectedHerbId]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedHerbId) {
      setError('Please select a herb to order.');
      return;
    }
    const qty = Math.max(1, parseInt(quantity || 1, 10));
    setOrderSubmitting(true);
    setError('');
    try {
      const payload = {
        items: [{ herb: selectedHerbId, quantity: qty }],
        shippingAddress: {
          address: '12, Green Park',
          city: 'New Delhi',
          postalCode: '110016',
          country: 'IN',
        },
        paymentMethod: 'cod',
        taxPrice: 0,
        shippingPrice: 10,
      };
      const res = await api.post('/api/orders', payload);
      const order = res?.data;
      // Navigate to tracking page
      navigate(`/consumer/order-tracking/${order._id}`);
    } catch (e) {
      setError(e.message || 'Failed to place order');
    } finally {
      setOrderSubmitting(false);
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
              <Nav.Link as={Link} to="/consumer/herb-selection">Browse</Nav.Link>
              <Nav.Link as={Link} to="/consumer/order-history">Order History</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}

        {loading ? (
          <div className="text-center py-5">Loading farmer details…</div>
        ) : !farmer ? (
          <div className="text-center py-5">Farmer not found.</div>
        ) : (
          <>
            <Row className="mb-3">
              <Col>
                <h2 className="dashboard-title">{farmer.name}</h2>
                <p className="text-muted mb-1">{[farmer.city, farmer.state, farmer.country].filter(Boolean).join(', ') || '—'}</p>
                {farmer.farmName && <p className="mb-1"><strong>Farm:</strong> {farmer.farmName}</p>}
                <p className="mb-1"><strong>Phone:</strong> {farmer.phone || '—'}</p>
                {Array.isArray(farmer.certifications) && farmer.certifications.length > 0 && (
                  <p className="mb-0"><Badge bg="info">Certified</Badge> <span className="small text-muted">{farmer.certifications.join(', ')}</span></p>
                )}
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Herbs harvested</h5>
                      <small className="text-muted">Select a herb and quantity, then place order</small>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {herbs.length === 0 ? (
                      <div className="text-muted">This farmer has no listed herbs yet.</div>
                    ) : (
                      <Form onSubmit={handlePlaceOrder}>
                        <Table responsive hover className="align-middle">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Herb</th>
                              <th>Scientific Name</th>
                              <th>Price</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {herbs.map(h => (
                              <tr key={h._id}>
                                <td>
                                  <Form.Check
                                    type="radio"
                                    name="selectedHerb"
                                    value={h._id}
                                    checked={selectedHerbId === h._id}
                                    onChange={(e) => setSelectedHerbId(e.target.value)}
                                    aria-label={`Select ${h.name}`}
                                  />
                                </td>
                                <td><strong>{h.name}</strong></td>
                                <td className="text-muted">{h.scientificName}</td>
                                <td>₹{typeof h.price === 'number' ? h.price : '-'}</td>
                                <td>{h.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <Row className="mt-3">
                          <Col md={4} lg={3}>
                            <Form.Group>
                              <Form.Label>Quantity</Form.Label>
                              <Form.Control
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-grid gap-2 mt-3">
                          <Button type="submit" variant="success" disabled={orderSubmitting || !selectedHerbId}>
                            {orderSubmitting ? 'Placing order…' : 'Place Order'}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default FarmerDetail;
