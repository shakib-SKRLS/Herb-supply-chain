import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Navbar, Nav, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const HerbSelection = ({ user }) => {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHerbs = async () => {
      try {
        // Use all=1 to include all herbs regardless of availability filter
        const res = await api.get(`/api/herbs?all=1&t=${Date.now()}`);
        const all = (res && res.data) ? res.data : [];
        // Backend already filters to available items; no client-side filter needed
        setHerbs(all);
      } catch (error) {
        console.error('Error fetching herbs:', error);
        setHerbs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHerbs();
  }, []);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setFarmersLoading(true);
        const res = await api.get('/api/farmers');
        setFarmers(res?.data || []);
      } catch (e) {
        setFarmers([]);
      } finally {
        setFarmersLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  const handleLogout = () => {
    navigate('/');
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

      <Container className="mt-4">
        <Row>
          <Col>
            <h2 className="dashboard-title">Browse by Farmers</h2>
            <p className="text-muted">Discover farmers and the herbs they harvest</p>
          </Col>
        </Row>

        {/* Farmers and their herbs */}
        <Row className="mb-4">
          <Col>
            <h4 className="dashboard-title">Farmers</h4>
          </Col>
        </Row>
        <Row>
          {farmersLoading ? (
            <Col><div className="text-muted">Loading farmers…</div></Col>
          ) : (farmers && farmers.length > 0 ? (
            farmers.map((f) => {
              const farmerHerbs = (herbs || []).filter(h => String(h?.farmer?._id || '') === String(f._id));
              return (
                <Col md={6} lg={4} key={f._id} className="mb-4">
                  <Card className="h-100" as={Link} to={`/consumer/farmer/${f._id}`} style={{ textDecoration: 'none' }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Card.Title className="mb-1">{f.name}</Card.Title>
                          <div className="text-muted small">{[f.city, f.state, f.country].filter(Boolean).join(', ') || '—'}</div>
                        </div>
                        {Array.isArray(f.certifications) && f.certifications.length > 0 && (
                          <Badge bg="info">Certified</Badge>
                        )}
                      </div>
                      {f.farmName && <div className="mt-1"><strong>Farm:</strong> {f.farmName}</div>}
                      <div className="mt-1"><strong>Phone:</strong> {f.phone || '—'}</div>
                      {Array.isArray(f.location?.coordinates) && (
                        <div className="mt-1 small">Lat: {f.location.coordinates[1]}, Lng: {f.location.coordinates[0]}</div>
                      )}
                      <hr />
                      <div>
                        <h6 className="mb-2">Herbs harvested</h6>
                        {farmerHerbs.length > 0 ? (
                          <ul className="mb-0">
                            {farmerHerbs.map(h => (
                              <li key={h._id}>
                                <strong>{h.name}</strong> <span className="text-muted">({h.scientificName})</span>
                                {typeof h.price === 'number' && (
                                  <> • Price: ₹{h.price}</>
                                )}
                                {h.status && (
                                  <> • Status: {h.status}</>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-muted">No herbs listed yet.</div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col><div className="text-muted">No farmers added yet.</div></Col>
          ))}
        </Row>

        {/* Removed individual herb listing; showing only farmers and their herbs as requested */}
        {loading && (
          <p className="text-center">Loading available herbs...</p>
        )}
      </Container>
    </div>
  );
};

export default HerbSelection;