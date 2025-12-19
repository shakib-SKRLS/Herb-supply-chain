import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Navbar, Nav, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const FarmerManager = ({ user }) => {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', country: '', postalCode: '',
    farmName: '', acreage: '', certifications: '', notes: '', lat: '', lng: ''
  });
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const navigate = useNavigate();

  // Add-Herb modal state
  const [showHerbModal, setShowHerbModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [herbForm, setHerbForm] = useState({
    name: '',
    scientificName: '',
    description: '',
    benefitsText: '',
    growingConditions: '',
    harvestTime: '',
    price: '',
    quantity: '',
    batchNumber: '',
    harvestDate: '',
    expiryDate: ''
  });
  const [herbSubmitting, setHerbSubmitting] = useState(false);
  const [herbError, setHerbError] = useState('');
  const [herbSuccess, setHerbSuccess] = useState('');
  const [selectedFarmerIdQuick, setSelectedFarmerIdQuick] = useState('');

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/farmers');
      setFarmers(res?.data || []);
    } catch (e) {
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setGeoError('');
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({ ...prev, lat: String(latitude), lng: String(longitude) }));
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(err.message || 'Failed to obtain location. Please allow location access.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => { fetchFarmers(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        postalCode: form.postalCode || undefined,
        location: { type: 'Point', coordinates: [parseFloat(form.lng) || 0, parseFloat(form.lat) || 0] },
        farmName: form.farmName || undefined,
        acreage: form.acreage ? parseFloat(form.acreage) : undefined,
        certifications: form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
        notes: form.notes || undefined,
      };
      await api.post('/api/farmers', payload);
      setSuccess('Farmer added successfully');
      setForm({ name: '', phone: '', email: '', address: '', city: '', state: '', country: '', postalCode: '', farmName: '', acreage: '', certifications: '', notes: '', lat: '', lng: '' });
      fetchFarmers();
    } catch (err) {
      setError(err.message || 'Failed to add farmer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => navigate('/');

  const openHerbModal = (farmer) => {
    setSelectedFarmer(farmer);
    setHerbForm({
      name: '', scientificName: '', description: '', benefitsText: '', growingConditions: '', harvestTime: '',
      price: '', quantity: '', batchNumber: '', harvestDate: '', expiryDate: ''
    });
    setHerbError('');
    setHerbSuccess('');
    setShowHerbModal(true);
  };

  const handleHerbChange = (e) => {
    const { name, value } = e.target;
    setHerbForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateHerb = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    setHerbSubmitting(true);
    setHerbError('');
    setHerbSuccess('');
    try {
      const payload = {
        name: herbForm.name,
        scientificName: herbForm.scientificName,
        description: herbForm.description,
        benefits: herbForm.benefitsText.split(',').map(s => s.trim()).filter(Boolean),
        growingConditions: herbForm.growingConditions,
        harvestTime: herbForm.harvestTime,
        price: parseFloat(herbForm.price),
        quantity: parseInt(herbForm.quantity, 10),
        batchNumber: herbForm.batchNumber,
        harvestDate: new Date(herbForm.harvestDate).toISOString(),
        expiryDate: new Date(herbForm.expiryDate).toISOString(),
        farmer: selectedFarmer._id,
      };
      await api.post('/api/herbs', payload);
      setHerbSuccess('Herb created and linked to farmer.');
      // optional: refresh farmers list or leave as is
    } catch (err) {
      setHerbError(err.message || 'Failed to create herb');
    } finally {
      setHerbSubmitting(false);
    }
  };

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
          <Col>
            <h2 className="dashboard-title">Farmer Manager</h2>
            <p className="text-muted">Add farmers with geolocation and view all registered farmers</p>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card>
              <Card.Body>
                <h5>Add New Farmer</h5>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control name="name" value={form.name} onChange={handleChange} required />
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-2">
                    <Form.Label>Address</Form.Label>
                    <Form.Control name="address" value={form.address} onChange={handleChange} />
                  </Form.Group>
                  <Row>
                    <Col><Form.Group className="mb-2"><Form.Label>City</Form.Label><Form.Control name="city" value={form.city} onChange={handleChange} /></Form.Group></Col>
                    <Col><Form.Group className="mb-2"><Form.Label>State</Form.Label><Form.Control name="state" value={form.state} onChange={handleChange} /></Form.Group></Col>
                  </Row>
                  <Row>
                    <Col><Form.Group className="mb-2"><Form.Label>Country</Form.Label><Form.Control name="country" value={form.country} onChange={handleChange} /></Form.Group></Col>
                    <Col><Form.Group className="mb-2"><Form.Label>Postal Code</Form.Label><Form.Control name="postalCode" value={form.postalCode} onChange={handleChange} /></Form.Group></Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control name="lat" value={form.lat} onChange={handleChange} placeholder="e.g., 28.6139" />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control name="lng" value={form.lng} onChange={handleChange} placeholder="e.g., 77.2090" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <Button variant="outline-primary" size="sm" onClick={handleUseCurrentLocation} disabled={geoLoading}>
                      {geoLoading ? 'Detecting…' : 'Use Current Location'}
                    </Button>
                    {geoError && <span className="text-danger small">{geoError}</span>}
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Label>Farm Name</Form.Label>
                    <Form.Control name="farmName" value={form.farmName} onChange={handleChange} />
                  </Form.Group>
                  <Row>
                    <Col><Form.Group className="mb-2"><Form.Label>Acreage</Form.Label><Form.Control type="number" step="0.1" name="acreage" value={form.acreage} onChange={handleChange} /></Form.Group></Col>
                    <Col><Form.Group className="mb-2"><Form.Label>Certifications (comma separated)</Form.Label><Form.Control name="certifications" value={form.certifications} onChange={handleChange} placeholder="e.g., Organic, FairTrade" /></Form.Group></Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={handleChange} />
                  </Form.Group>
                  <div className="d-grid">
                    <Button type="submit" variant="success" disabled={submitting}>{submitting ? 'Adding...' : 'Add Farmer'}</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <Card.Body>
                <h5>Registered Farmers</h5>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Name</th><th>Phone</th><th>City</th><th>Country</th><th>Location</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(farmers || []).map(f => (
                        <tr key={f._id}>
                          <td>{f.name}</td>
                          <td>{f.phone || '-'}</td>
                          <td>{f.city || '-'}</td>
                          <td>{f.country || '-'}</td>
                          <td>{Array.isArray(f.location?.coordinates) ? `${f.location.coordinates[1]}, ${f.location.coordinates[0]}` : '-'}</td>
                          <td>
                            <Button size="sm" variant="outline-success" onClick={() => openHerbModal(f)}>Add Herb</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Add Herb Section */}
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Body>
                <h5>Add Herb For Farmer</h5>
                <Form onSubmit={handleCreateHerb}>
                  <Row className="align-items-end">
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Farmer</Form.Label>
                        <Form.Select
                          value={selectedFarmerIdQuick}
                          onChange={(e) => {
                            setSelectedFarmerIdQuick(e.target.value);
                            const f = (farmers || []).find(x => x._id === e.target.value);
                            setSelectedFarmer(f || null);
                          }}
                          required
                        >
                          <option value="">-- Select Farmer --</option>
                          {(farmers || []).map(f => (
                            <option key={f._id} value={f._id}>{f.name} {f.city ? `- ${f.city}` : ''}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={8}>
                      {herbError && <Alert variant="danger" className="mb-2">{herbError}</Alert>}
                      {herbSuccess && <Alert variant="success" className="mb-2">{herbSuccess}</Alert>}
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name *</Form.Label>
                        <Form.Control name="name" value={herbForm.name} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Scientific Name *</Form.Label>
                        <Form.Control name="scientificName" value={herbForm.scientificName} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price *</Form.Label>
                        <Form.Control type="number" step="0.01" name="price" value={herbForm.price} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control as="textarea" rows={2} name="description" value={herbForm.description} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Benefits (comma-separated) *</Form.Label>
                        <Form.Control name="benefitsText" value={herbForm.benefitsText} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Growing Conditions *</Form.Label>
                        <Form.Control name="growingConditions" value={herbForm.growingConditions} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Harvest Time *</Form.Label>
                        <Form.Control name="harvestTime" value={herbForm.harvestTime} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quantity *</Form.Label>
                        <Form.Control type="number" name="quantity" value={herbForm.quantity} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Batch *</Form.Label>
                        <Form.Control name="batchNumber" value={herbForm.batchNumber} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Harvest Date *</Form.Label>
                        <Form.Control type="date" name="harvestDate" value={herbForm.harvestDate} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry Date *</Form.Label>
                        <Form.Control type="date" name="expiryDate" value={herbForm.expiryDate} onChange={handleHerbChange} required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid">
                    <Button type="submit" variant="success" disabled={herbSubmitting || !selectedFarmerIdQuick}>
                      {herbSubmitting ? 'Creating…' : 'Add Herb to Farmer'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Add Herb Modal */}
        <Modal show={showHerbModal} onHide={() => setShowHerbModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add Herb for {selectedFarmer?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {herbError && <Alert variant="danger">{herbError}</Alert>}
            {herbSuccess && <Alert variant="success">{herbSuccess}</Alert>}
            <Form onSubmit={handleCreateHerb}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control name="name" value={herbForm.name} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Scientific Name *</Form.Label>
                    <Form.Control name="scientificName" value={herbForm.scientificName} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={herbForm.description} onChange={handleHerbChange} required />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Benefits (comma-separated) *</Form.Label>
                    <Form.Control name="benefitsText" value={herbForm.benefitsText} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Growing Conditions *</Form.Label>
                    <Form.Control name="growingConditions" value={herbForm.growingConditions} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Harvest Time *</Form.Label>
                    <Form.Control name="harvestTime" value={herbForm.harvestTime} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price *</Form.Label>
                    <Form.Control type="number" step="0.01" name="price" value={herbForm.price} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity *</Form.Label>
                    <Form.Control type="number" name="quantity" value={herbForm.quantity} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Batch Number *</Form.Label>
                    <Form.Control name="batchNumber" value={herbForm.batchNumber} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Harvest Date *</Form.Label>
                    <Form.Control type="date" name="harvestDate" value={herbForm.harvestDate} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Date *</Form.Label>
                    <Form.Control type="date" name="expiryDate" value={herbForm.expiryDate} onChange={handleHerbChange} required />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid gap-2">
                <Button type="submit" variant="success" disabled={herbSubmitting}>
                  {herbSubmitting ? 'Creating…' : 'Create Herb'}
                </Button>
                <Button variant="outline-secondary" onClick={() => setShowHerbModal(false)}>Close</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default FarmerManager;
