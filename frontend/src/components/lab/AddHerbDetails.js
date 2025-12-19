import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Navbar, Nav, Accordion } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const AddHerbDetails = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const herbId = queryParams.get('id');

  const [formData, setFormData] = useState({
    // Basic Herb Information
    name: '',
    scientificName: '',
    farmerId: '',
    farmerName: '',
    farmerLocation: '',
    
    // Sample Metadata
    labId: 'LAB-001-2024',
    batchNumber: '',
    sampleCollectionDate: new Date().toISOString().split('T')[0],
    collectedBy: 'Dr. Sarah Johnson',
    transferredBy: 'Lab Technician - Mike Chen',
    chainOfCustody: '',
    
    // Chemical Composition
    alkaloids: '',
    essentialOils: '',
    flavonoids: '',
    tannins: '',
    
    // Contaminants
    pesticides: 'Below Detection Limit',
    heavyMetals: 'Within Safe Limits',
    microbes: 'E. Coli: Negative, Salmonella: Negative',
    aflatoxins: 'Below 10 ppb (Safe)',
    
    // Physical Parameters
    moistureContent: '',
    ashContent: '',
    pH: '',
    density: '',
    
    // Quality Assessment
    qualityScore: 85,
    pharmacopeiaStatus: 'PASS - Meets USP Standards',
    
    // Certification
    certificationId: '',
    labSignature: 'LAB-SIG-LAB-001-2024',
    digitalSignature: '',
    blockchainHash: '',
    validityPeriod: '2 years from issue date',
    issuedBy: 'Certified Testing Laboratory - Delhi',
    
    // Additional Notes
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const fetchHerbDetails = async () => {
      if (herbId) {
        setLoading(true);
        try {
          const res = await api.get(`/api/herbs/${herbId}`);
          const herb = res.data;
          if (herb) {
            setFormData((prev) => ({
              ...prev,
              name: herb.name || '',
              scientificName: herb.scientificName || '',
              // We don't have farmer details in backend Herb; keep fields editable
            }));
            setIsEdit(true);
          }
        } catch (error) {
          console.error('Error fetching herb details:', error);
          setError('Failed to load herb details. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHerbDetails();
  }, [herbId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const buildLabResultPayload = () => {
    // Map form fields into backend LabResult schema
    return {
      herb: herbId,
      testDate: new Date(formData.sampleCollectionDate).toISOString(),
      // Optional farmer metadata captured on the form
      farmerName: formData.farmerName || undefined,
      farmerLocation: formData.farmerLocation || undefined,
      farmerId: formData.farmerId || undefined,
      testResults: {
        heavyMetals: {
          lead: parseFloat(formData.alkaloids) || 0, // Note: map properly if you have dedicated inputs for heavy metals
          mercury: parseFloat(formData.essentialOils) || 0,
          arsenic: parseFloat(formData.flavonoids) || 0,
          cadmium: parseFloat(formData.tannins) || 0
        },
        microbial: {
          totalAerobicMicrobialCount: parseInt(formData.moistureContent) || 0,
          totalYeastAndMold: parseInt(formData.ashContent) || 0,
          eColi: !String(formData.microbes).toLowerCase().includes('positive'),
          salmonella: false,
          staphylococcus: false
        },
        pesticides: [
          { name: 'General', level: formData.pesticides === 'Above Safe Limits' ? 1 : 0, epaLimit: 1 }
        ],
        activeConstituents: [
          { name: 'ConstituentA', percentage: parseFloat(formData.pH) || 0 }
        ],
        moistureContent: parseFloat(formData.moistureContent) || 0,
        ashContent: parseFloat(formData.ashContent) || 0,
        foreignMatter: parseFloat(formData.density) || 0
      },
      status: formData.pharmacopeiaStatus?.toLowerCase().includes('pass') ? 'passed' : 'inconclusive',
      notes: formData.notes || ''
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!herbId) {
        setError('No herb selected. Please navigate from the dashboard or include ?id=<herbId>');
        return;
      }
      const payload = buildLabResultPayload();
      const res = await api.post('/api/lab-results', payload);
      setSuccess('Lab results submitted successfully.');
      // Reset form after successful submission
      setFormData({
          // Basic Herb Information
          name: '',
          scientificName: '',
          farmerId: '',
          farmerName: '',
          farmerLocation: '',
          
          // Sample Metadata
          labId: 'LAB-001-2024',
          batchNumber: '',
          sampleCollectionDate: new Date().toISOString().split('T')[0],
          collectedBy: 'Dr. Sarah Johnson',
          transferredBy: 'Lab Technician - Mike Chen',
          chainOfCustody: '',
          
          // Chemical Composition
          alkaloids: '',
          essentialOils: '',
          flavonoids: '',
          tannins: '',
          
          // Contaminants
          pesticides: 'Below Detection Limit',
          heavyMetals: 'Within Safe Limits',
          microbes: 'E. Coli: Negative, Salmonella: Negative',
          aflatoxins: 'Below 10 ppb (Safe)',
          
          // Physical Parameters
          moistureContent: '',
          ashContent: '',
          pH: '',
          density: '',
          
          // Quality Assessment
          qualityScore: 85,
          pharmacopeiaStatus: 'PASS - Meets USP Standards',
          
          // Certification
          certificationId: '',
          labSignature: 'LAB-SIG-LAB-001-2024',
          digitalSignature: '',
          blockchainHash: '',
          validityPeriod: '2 years from issue date',
          issuedBy: 'Certified Testing Laboratory - Delhi',
          
          // Additional Notes
          notes: ''
      });
    } catch (error) {
      console.error('Error submitting herb details:', error);
      setError(error.message || 'Failed to submit herb details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <p className="text-center">Loading herb details...</p>
      </Container>
    );
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">Herb Traceability - Lab Portal</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/lab/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/lab/add-herb-details">Add Herb Details</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row>
          <Col>
            <h2 className="dashboard-title">
              {isEdit ? 'Update Lab Test Results' : 'Add Lab Test Results'}
            </h2>
            <p className="text-muted">Enter comprehensive laboratory testing and certification details</p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={8}>
            <Card>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Accordion defaultActiveKey="0">
                    {/* Basic Herb Information */}
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>🌿 Basic Herb Information</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Herb Name *</Form.Label>
                              <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isEdit}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Scientific Name *</Form.Label>
                              <Form.Control
                                type="text"
                                name="scientificName"
                                value={formData.scientificName}
                                onChange={handleChange}
                                required
                                disabled={isEdit}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Farmer Name *</Form.Label>
                              <Form.Control
                                type="text"
                                name="farmerName"
                                value={formData.farmerName}
                                onChange={handleChange}
                                required
                                disabled={isEdit}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Farmer Location *</Form.Label>
                              <Form.Control
                                type="text"
                                name="farmerLocation"
                                value={formData.farmerLocation}
                                onChange={handleChange}
                                required
                                disabled={isEdit}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Farmer ID</Form.Label>
                              <Form.Control
                                type="text"
                                name="farmerId"
                                value={formData.farmerId}
                                onChange={handleChange}
                                disabled={isEdit}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Sample Metadata */}
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>📋 Sample Metadata</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Lab ID</Form.Label>
                              <Form.Control
                                type="text"
                                name="labId"
                                value={formData.labId}
                                onChange={handleChange}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Batch/Lot Number *</Form.Label>
                              <Form.Control
                                type="text"
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                required
                                placeholder="BATCH-XXXX-YYYY"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Sample Collection Date *</Form.Label>
                              <Form.Control
                                type="date"
                                name="sampleCollectionDate"
                                value={formData.sampleCollectionDate}
                                onChange={handleChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Chain of Custody ID</Form.Label>
                              <Form.Control
                                type="text"
                                name="chainOfCustody"
                                value={formData.chainOfCustody}
                                onChange={handleChange}
                                placeholder="COC-XXXX-YYYY"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Collected By</Form.Label>
                              <Form.Control
                                type="text"
                                name="collectedBy"
                                value={formData.collectedBy}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Transferred By</Form.Label>
                              <Form.Control
                                type="text"
                                name="transferredBy"
                                value={formData.transferredBy}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Chemical Composition */}
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>🧪 Chemical Composition / Active Ingredients</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Alkaloids (%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="alkaloids"
                                value={formData.alkaloids}
                                onChange={handleChange}
                                placeholder="0.00"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Essential Oils (%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="essentialOils"
                                value={formData.essentialOils}
                                onChange={handleChange}
                                placeholder="0.00"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Flavonoids (%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="flavonoids"
                                value={formData.flavonoids}
                                onChange={handleChange}
                                placeholder="0.00"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Tannins (%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="tannins"
                                value={formData.tannins}
                                onChange={handleChange}
                                placeholder="0.00"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Contaminants */}
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>⚠️ Contaminants Analysis</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Pesticides</Form.Label>
                              <Form.Select
                                name="pesticides"
                                value={formData.pesticides}
                                onChange={handleChange}
                              >
                                <option value="Below Detection Limit">Below Detection Limit</option>
                                <option value="Within Safe Limits">Within Safe Limits</option>
                                <option value="Above Safe Limits">Above Safe Limits</option>
                                <option value="Not Tested">Not Tested</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Heavy Metals</Form.Label>
                              <Form.Select
                                name="heavyMetals"
                                value={formData.heavyMetals}
                                onChange={handleChange}
                              >
                                <option value="Within Safe Limits">Within Safe Limits</option>
                                <option value="Below Detection Limit">Below Detection Limit</option>
                                <option value="Above Safe Limits">Above Safe Limits</option>
                                <option value="Not Tested">Not Tested</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Microbes</Form.Label>
                              <Form.Control
                                type="text"
                                name="microbes"
                                value={formData.microbes}
                                onChange={handleChange}
                                placeholder="E. Coli: Negative, Salmonella: Negative"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Aflatoxins</Form.Label>
                              <Form.Control
                                type="text"
                                name="aflatoxins"
                                value={formData.aflatoxins}
                                onChange={handleChange}
                                placeholder="Below 10 ppb (Safe)"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Physical Parameters */}
                    <Accordion.Item eventKey="4">
                      <Accordion.Header>📊 Physical Parameters</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Moisture Content (%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                name="moistureContent"
                                value={formData.moistureContent}
                                onChange={handleChange}
                                placeholder="0.0"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Ash Content (%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                name="ashContent"
                                value={formData.ashContent}
                                onChange={handleChange}
                                placeholder="0.0"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>pH</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                name="pH"
                                value={formData.pH}
                                onChange={handleChange}
                                placeholder="0.0"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Density (g/cm³)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="density"
                                value={formData.density}
                                onChange={handleChange}
                                placeholder="0.00"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Quality Assessment */}
                    <Accordion.Item eventKey="5">
                      <Accordion.Header>🏆 Quality Assessment</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Quality Score (0-100) *</Form.Label>
                              <Form.Control
                                type="number"
                                name="qualityScore"
                                value={formData.qualityScore}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Pharmacopeia Status</Form.Label>
                              <Form.Select
                                name="pharmacopeiaStatus"
                                value={formData.pharmacopeiaStatus}
                                onChange={handleChange}
                              >
                                <option value="PASS - Meets USP Standards">PASS - Meets USP Standards</option>
                                <option value="PASS - Meets BP Standards">PASS - Meets BP Standards</option>
                                <option value="PASS - Meets IP Standards">PASS - Meets IP Standards</option>
                                <option value="FAIL - Below Standards">FAIL - Below Standards</option>
                                <option value="PENDING - Under Review">PENDING - Under Review</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Certification */}
                    <Accordion.Item eventKey="6">
                      <Accordion.Header>🔐 Certification Details</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Certificate ID *</Form.Label>
                              <Form.Control
                                type="text"
                                name="certificationId"
                                value={formData.certificationId}
                                onChange={handleChange}
                                required
                                placeholder="CERT-LAB-XXXX-YYYY"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Lab Signature</Form.Label>
                              <Form.Control
                                type="text"
                                name="labSignature"
                                value={formData.labSignature}
                                onChange={handleChange}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Validity Period</Form.Label>
                              <Form.Control
                                type="text"
                                name="validityPeriod"
                                value={formData.validityPeriod}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Issued By</Form.Label>
                              <Form.Control
                                type="text"
                                name="issuedBy"
                                value={formData.issuedBy}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Additional Notes */}
                    <Accordion.Item eventKey="7">
                      <Accordion.Header>📝 Additional Notes</Accordion.Header>
                      <Accordion.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Notes</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional observations, special conditions, or remarks..."
                          />
                        </Form.Group>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>

                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      variant="success" 
                      type="submit"
                      disabled={submitting}
                      size="lg"
                    >
                      {submitting ? 'Submitting...' : (isEdit ? 'Update Lab Test Results' : 'Submit Lab Test Results')}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      as={Link} 
                      to="/lab/dashboard"
                    >
                      Cancel
                    </Button>
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

export default AddHerbDetails;