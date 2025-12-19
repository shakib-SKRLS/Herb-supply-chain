import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const CreateHerb = ({ user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    description: '',
    benefitsText: '', // comma separated, will split into array
    growingConditions: '',
    harvestTime: '',
    image: '',
    isOrganic: false,
    price: '',
    quantity: '',
    batchNumber: '',
    harvestDate: '',
    expiryDate: '',
    // Optional linking to an existing consumer order for tracking
    orderId: '',
    // Link to existing Farmer document
    farmerId: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderSuggestions, setOrderSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [autoFillInfo, setAutoFillInfo] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [farmersError, setFarmersError] = useState('');

  const prefetchRecentOrders = async () => {
    try {
      setSuggestionsLoading(true);
      setSuggestionsError('');
      const res = await api.get('/api/orders/search'); // no query returns recent orders
      setOrderSuggestions(res?.data || []);
    } catch (err) {
      setOrderSuggestions([]);
      setSuggestionsError(err.message || 'Failed to fetch recent orders');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Debounced order search when typing order number/ID
  useEffect(() => {
    const q = (formData.orderId || '').trim();
    if (!q || q.length < 3) {
      setOrderSuggestions([]);
      setSuggestionsError('');
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        setSuggestionsError('');
        const res = await api.get(`/api/orders/search?q=${encodeURIComponent(q)}`);
        if (!cancelled) setOrderSuggestions(res?.data || []);
      } catch (err) {
        if (!cancelled) {
          setOrderSuggestions([]);
          setSuggestionsError(err.message || 'Failed to search orders');
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [formData.orderId]);

  // Fetch farmers for selection
  useEffect(() => {
    const loadFarmers = async () => {
      try {
        setFarmersLoading(true);
        setFarmersError('');
        const res = await api.get('/api/farmers');
        setFarmers(res?.data || []);
      } catch (e) {
        setFarmers([]);
        setFarmersError(e.message || 'Failed to load farmers');
      } finally {
        setFarmersLoading(false);
      }
    };
    loadFarmers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Build payload expected by backend Herb model
      const payload = {
        name: formData.name,
        scientificName: formData.scientificName,
        description: formData.description,
        benefits: formData.benefitsText
          .split(',')
          .map(b => b.trim())
          .filter(Boolean),
        growingConditions: formData.growingConditions,
        harvestTime: formData.harvestTime,
        image: formData.image || undefined,
        isOrganic: !!formData.isOrganic,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        batchNumber: formData.batchNumber,
        harvestDate: new Date(formData.harvestDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
      };

      if (formData.farmerId) {
        payload.farmer = formData.farmerId;
      }

      // If processor provided an Order ID, send it in the processor subdocument
      if (formData.orderId && formData.orderId.trim()) {
        payload.processor = { orderId: formData.orderId.trim() };
      }

      const createRes = await api.post('/api/herbs', payload);
      const createdHerb = createRes?.data;
      setSuccess('Herb created successfully. Redirecting to dashboard...');
      const role = (user && user.role) || 'processor';
      const dest = role === 'processor' ? '/processor/dashboard' : '/lab/dashboard';
      setTimeout(() => navigate(dest, { state: { refresh: Date.now(), newHerbId: createdHerb?._id || null } }), 800);
    } catch (err) {
      setError(err.message || 'Failed to create herb.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => navigate('/');

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">Herb Traceability - Processor Portal</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/processor/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/processor/create-herb">Create Herb</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <Card>
              <Card.Body>
                <h3 className="mb-3">Create New Herb</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name *</Form.Label>
                        <Form.Control name="name" value={formData.name} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Scientific Name *</Form.Label>
                        <Form.Control name="scientificName" value={formData.scientificName} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Farmer selection */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Farmer (optional)</Form.Label>
                        <Form.Select
                          name="farmerId"
                          value={formData.farmerId}
                          onChange={handleChange}
                        >
                          <option value="">-- Select Farmer --</option>
                          {farmers.map((f) => (
                            <option key={f._id} value={f._id}>
                              {f.name} {f.city ? `- ${f.city}` : ''}
                            </option>
                          ))}
                        </Form.Select>
                        {farmersLoading && <div className="small text-muted mt-1">Loading farmers…</div>}
                        {farmersError && <div className="small text-danger mt-1">{farmersError}</div>}
                        <Form.Text className="text-muted">
                          Link this herb to a farmer added in Admin &gt; Farmers for better traceability.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Benefits (comma-separated) *</Form.Label>
                        <Form.Control name="benefitsText" value={formData.benefitsText} onChange={handleChange} placeholder="e.g. Anti-inflammatory, Antioxidant" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Growing Conditions *</Form.Label>
                        <Form.Control name="growingConditions" value={formData.growingConditions} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Harvest Time *</Form.Label>
                        <Form.Control name="harvestTime" value={formData.harvestTime} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control name="image" value={formData.image} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price (number) *</Form.Label>
                        <Form.Control type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quantity *</Form.Label>
                        <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Organic</Form.Label>
                        <Form.Check type="checkbox" name="isOrganic" checked={formData.isOrganic} onChange={handleChange} label="Is Organic?" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Batch Number *</Form.Label>
                        <Form.Control name="batchNumber" value={formData.batchNumber} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Harvest Date *</Form.Label>
                        <Form.Control type="date" name="harvestDate" value={formData.harvestDate} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry Date *</Form.Label>
                        <Form.Control type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Order ID or Order Number (optional)</Form.Label>
                        <Form.Control
                          name="orderId"
                          placeholder="Enter MongoDB Order ID (ObjectId) or Order Number (e.g., ORD-169...-12345)"
                          value={formData.orderId}
                          onChange={handleChange}
                          onFocus={() => {
                            if (!formData.orderId && orderSuggestions.length === 0) {
                              prefetchRecentOrders();
                            }
                          }}
                        />
                        <Form.Text className="text-muted">
                          You can paste the Order ID or the human-readable Order Number. We'll link it for consumer tracking.
                        </Form.Text>
                        {suggestionsLoading && (
                          <div className="mt-2 small text-muted">Searching orders...</div>
                        )}
                        {suggestionsError && (
                          <div className="mt-2 small text-danger">{suggestionsError}</div>
                        )}
                        {orderSuggestions && orderSuggestions.length > 0 && (
                          <div className="mt-2 border rounded" style={{ maxHeight: 180, overflowY: 'auto' }}>
                            {orderSuggestions.map((o) => (
                              <div
                                key={o._id}
                                className="px-2 py-1 suggestion-item"
                                style={{ cursor: 'pointer' }}
                                onClick={async () => {
                                  // Fill the text field with the selected orderNumber
                                  setFormData(prev => ({ ...prev, orderId: o.orderNumber }));
                                  setOrderSuggestions([]);
                                  setSuggestionsError('');
                                  setAutoFillInfo('');
                                  try {
                                    // Fetch full order details
                                    const orderRes = await api.get(`/api/orders/${o._id}`);
                                    const order = orderRes?.data;
                                    const firstItem = order?.items?.[0];
                                    const herbId = (firstItem?.herb && (firstItem.herb._id || firstItem.herb)) || null;
                                    // Prefill quantity from order item
                                    if (firstItem?.quantity) {
                                      setFormData(prev => ({ ...prev, quantity: String(firstItem.quantity) }));
                                    }
                                    if (herbId) {
                                      // Fetch herb to pre-populate fields
                                      const herbRes = await api.get(`/api/herbs/${herbId}`);
                                      const h = herbRes?.data;
                                      if (h) {
                                        setFormData(prev => ({
                                          ...prev,
                                          name: h.name || prev.name,
                                          scientificName: h.scientificName || prev.scientificName,
                                          description: h.description || prev.description,
                                          benefitsText: Array.isArray(h.benefits) ? h.benefits.join(', ') : prev.benefitsText,
                                          growingConditions: h.growingConditions || prev.growingConditions,
                                          harvestTime: h.harvestTime || prev.harvestTime,
                                          image: h.image || prev.image,
                                          isOrganic: !!h.isOrganic,
                                          price: (h.price != null ? String(h.price) : prev.price),
                                          batchNumber: h.batchNumber || prev.batchNumber,
                                          harvestDate: h.harvestDate ? new Date(h.harvestDate).toISOString().substring(0,10) : prev.harvestDate,
                                          expiryDate: h.expiryDate ? new Date(h.expiryDate).toISOString().substring(0,10) : prev.expiryDate,
                                        }));
                                        setAutoFillInfo(`Auto-filled from order ${order.orderNumber} and herb ${h.name}. Please review and adjust if needed.`);
                                      }
                                    } else {
                                      setAutoFillInfo(`Linked to order ${order.orderNumber}. Quantity pre-filled from the order.`);
                                    }
                                  } catch (e) {
                                    setSuggestionsError(e.message || 'Failed to auto-fill from order');
                                  }
                                }}
                              >
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>{o.orderNumber}</strong>
                                    <div className="small text-muted">ID: {String(o._id).substring(0,8)} • {o.status}</div>
                                  </div>
                                  <div className="small text-muted">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(!suggestionsLoading && orderSuggestions && orderSuggestions.length === 0 && (formData.orderId || '').trim().length >= 3) && (
                          <div className="mt-2 small text-muted">No matching orders found.</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {autoFillInfo && (
                    <Row>
                      <Col>
                        <Alert variant="info">{autoFillInfo}</Alert>
                      </Col>
                    </Row>
                  )}

                  <div className="d-grid gap-2">
                    <Button type="submit" variant="success" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Herb'}
                    </Button>
                    <Button as={Link} to="/processor/dashboard" variant="outline-secondary">Cancel</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateHerb;
