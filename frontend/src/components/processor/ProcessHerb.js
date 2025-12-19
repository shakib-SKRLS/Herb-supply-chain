import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Navbar, Nav, Accordion } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const ProcessHerb = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const herbId = queryParams.get('id');

  const [formData, setFormData] = useState({
    // Batch Identification
    processorId: 'PROC-001-2024',
    batchNumber: '',
    farmerId: '',
    harvestId: '',
    digitalSignature: '',
    
    // Processing Information
    processingDate: new Date().toISOString().split('T')[0],
    processingType: '',
    equipmentUsed: '',
    processingLocation: 'GPS: 28.6139°N, 77.2090°E (Delhi Facility)',
    facilityCode: 'FAC-DEL-001',
    
    // Quality & Safety Records
    moistureContent: '',
    cleaningStatus: 'Completed - Sanitized',
    storageTemperature: '',
    humidity: '',
    packagingCondition: 'Vacuum sealed - Food grade',
    
    // Digital Certificates
    processorSignature: 'PROC-SIG-PROC-001-2024',
    certificateId: '',
    blockchainHash: '',
    nonRepudiationRecord: '',
    
    // Additional Information
    expiryDate: '',
    processingMethod: '',
    packagingType: '',
    notes: ''
  });
  
  const [herbDetails, setHerbDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [availableHerbs, setAvailableHerbs] = useState([]);
  const [pickHerbId, setPickHerbId] = useState('');

  useEffect(() => {
    const fetchHerbDetails = async () => {
      if (herbId) {
        setLoading(true);
        try {
          const res = await api.get(`/api/herbs/${herbId}`);
          const herb = res.data;
          if (herb) {
            setHerbDetails(herb);
            if (herb.processor) {
              setFormData({
                processorId: herb.processor.processorId || 'PROC-001-2024',
                batchNumber: herb.processor.batchNumber || '',
                farmerId: herb.processor.farmerId || '',
                harvestId: herb.processor.harvestId || '',
                digitalSignature: herb.processor.digitalSignature || '',
                processingDate: herb.processor.processingDate ? herb.processor.processingDate.split('T')[0] : new Date().toISOString().split('T')[0],
                processingType: herb.processor.processingType || '',
                equipmentUsed: herb.processor.equipmentUsed || '',
                processingLocation: herb.processor.processingLocation || 'GPS: 28.6139°N, 77.2090°E (Delhi Facility)',
                facilityCode: herb.processor.facilityCode || 'FAC-DEL-001',
                moistureContent: herb.processor.moistureContent || '',
                cleaningStatus: herb.processor.cleaningStatus || 'Completed - Sanitized',
                storageTemperature: herb.processor.storageTemperature || '',
                humidity: herb.processor.humidity || '',
                packagingCondition: herb.processor.packagingCondition || 'Vacuum sealed - Food grade',
                processorSignature: herb.processor.processorSignature || 'PROC-SIG-PROC-001-2024',
                certificateId: herb.processor.certificateId || '',
                blockchainHash: herb.processor.blockchainHash || '',
                nonRepudiationRecord: herb.processor.nonRepudiationRecord || '',
                expiryDate: herb.processor.expiryDate ? herb.processor.expiryDate.split('T')[0] : '',
                processingMethod: herb.processor.processingMethod || '',
                packagingType: herb.processor.packagingType || '',
                notes: herb.processor.notes || ''
              });
              setIsEdit(true);
            } else {
              setFormData(prev => ({
                ...prev,
                batchNumber: `BATCH-${herb._id}-${Date.now()}`,
                farmerId: '',
                harvestId: `HARV-${herb._id}`,
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching herb details:', error);
          setError('Failed to load herb details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // No herbId: provide a picker for the processor to choose a herb to process
        (async () => {
          setLoading(true);
          try {
            const res = await api.get('/api/herbs?all=1');
            const list = (res && res.data) ? res.data : [];
            // Prefer current processor's herbs
            const mineFirst = list
              .filter(h => (h?.supplier?._id && user?._id) ? String(h.supplier._id) === String(user._id) : true)
              .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setAvailableHerbs(mineFirst);
          } catch (e) {
            console.error('Failed to fetch herbs list:', e);
          } finally {
            setLoading(false);
          }
        })();
      }
    };

    fetchHerbDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [herbId, user?._id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const generateProcessorData = () => {
    const blockchainHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const certificateId = formData.certificateId || `CERT-${formData.batchNumber}`;
    const digitalSignature = formData.digitalSignature || `SIG-${formData.processorId}-${Date.now()}`;
    const nonRepudiationRecord = formData.nonRepudiationRecord || `NRR-${blockchainHash.substring(0, 16)}`;
    
    return {
      id: formData.processorId,
      name: user?.name || 'Herbal Extracts Ltd.',
      
      // Batch Identification
      processorId: formData.processorId,
      batchNumber: formData.batchNumber,
      farmerId: formData.farmerId,
      harvestId: formData.harvestId,
      digitalSignature: digitalSignature,
      
      // Processing Information
      processingDate: formData.processingDate,
      processingType: formData.processingType,
      equipmentUsed: formData.equipmentUsed,
      processingLocation: formData.processingLocation,
      facilityCode: formData.facilityCode,
      
      // Quality & Safety Records
      moistureContent: formData.moistureContent,
      cleaningStatus: formData.cleaningStatus,
      storageTemperature: formData.storageTemperature,
      humidity: formData.humidity,
      packagingCondition: formData.packagingCondition,
      
      // Digital Certificates
      processorSignature: formData.processorSignature,
      certificateId: certificateId,
      blockchainHash: blockchainHash,
      nonRepudiationRecord: nonRepudiationRecord,
      
      // Additional Information
      expiryDate: formData.expiryDate,
      processingMethod: formData.processingMethod,
      packagingType: formData.packagingType,
      notes: formData.notes
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const processorData = generateProcessorData();
      await api.put(`/api/herbs/${herbId}/processor`, { processor: processorData, status: 'processed' });
      setSuccess('Herb processing details saved successfully!');
    } catch (error) {
      console.error('Error submitting processing details:', error);
      setError(error.message || 'Failed to submit processing details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShipHerb = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.put(`/api/herbs/${herbId}/processor`, { status: 'shipped' });
      setSuccess('Herb marked as shipped successfully!');
    } catch (error) {
      console.error('Error shipping herb:', error);
      setError(error.message || 'Failed to ship herb. Please try again.');
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
          <Navbar.Brand href="#">Herb Traceability - Processor Portal</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/processor/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/processor/process-herb">Process Herb</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row>
          <Col>
            <h2 className="dashboard-title">
              {isEdit ? 'Update Processing Details' : 'Process Herb'}
            </h2>
            <p className="text-muted">Enter comprehensive processing, quality, and certification details</p>
          </Col>
        </Row>
        {!herbId && (
          <Row className="mb-4">
            <Col md={8} lg={6}>
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Select a Herb to Process</h5>
                  <Form>
                    <Form.Group>
                      <Form.Label>Herb</Form.Label>
                      <Form.Select value={pickHerbId} onChange={(e) => setPickHerbId(e.target.value)}>
                        <option value="">-- Choose Herb --</option>
                        {availableHerbs.map(h => (
                          <option key={h._id} value={h._id}>
                            {h.name} {h.batchNumber ? `• ${h.batchNumber}` : ''} {h.status ? `• ${h.status}` : ''}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <div className="d-grid gap-2 mt-3">
                      <Button
                        variant="primary"
                        disabled={!pickHerbId}
                        onClick={() => navigate(`/processor/process-herb?id=${pickHerbId}`)}
                      >
                        Continue
                      </Button>
                      <Button variant="outline-secondary" as={Link} to="/processor/dashboard">Back to Dashboard</Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {herbDetails && (
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5>Herb Information</h5>
                      <p><strong>Name:</strong> {herbDetails.name}</p>
                      <p><strong>Scientific Name:</strong> {herbDetails.scientificName}</p>
                      <p><strong>Farmer:</strong> {herbDetails.farmer?.name || '—'}</p>
                      <p>
                        <strong>Location:</strong>{' '}
                        {Array.isArray(herbDetails.farmer?.location?.coordinates)
                          ? `${herbDetails.farmer.location.coordinates[1]}, ${herbDetails.farmer.location.coordinates[0]}`
                          : ([herbDetails.farmer?.city, herbDetails.farmer?.state, herbDetails.farmer?.country]
                              .filter(Boolean)
                              .join(', ') || '—')}
                      </p>
                    </Col>
                    <Col md={6}>
                      <h5>Lab Test Results</h5>
                      <p><strong>Lab:</strong> {herbDetails.lab?.name}</p>
                      <p><strong>Test Date:</strong> {herbDetails.lab?.testDate}</p>
                      <p><strong>Quality Score:</strong> {herbDetails.lab?.qualityScore}/100</p>
                      <p><strong>Certification ID:</strong> {herbDetails.lab?.certificationId}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row className="justify-content-center">
          <Col md={8}>
            <Card>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Accordion defaultActiveKey="0">
                    {/* Batch Identification */}
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>📋 Batch Identification</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Processor ID</Form.Label>
                              <Form.Control
                                type="text"
                                name="processorId"
                                value={formData.processorId}
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
                              <Form.Label>Farmer ID</Form.Label>
                              <Form.Control
                                type="text"
                                name="farmerId"
                                value={formData.farmerId}
                                onChange={handleChange}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Harvest ID</Form.Label>
                              <Form.Control
                                type="text"
                                name="harvestId"
                                value={formData.harvestId}
                                onChange={handleChange}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>Digital Signature</Form.Label>
                          <Form.Control
                            type="text"
                            name="digitalSignature"
                            value={formData.digitalSignature}
                            onChange={handleChange}
                            placeholder="Auto-generated"
                          />
                        </Form.Group>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Processing Information */}
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>⚙️ Processing Information</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Processing Date/Time *</Form.Label>
                              <Form.Control
                                type="date"
                                name="processingDate"
                                value={formData.processingDate}
                                onChange={handleChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Processing Type *</Form.Label>
                              <Form.Select
                                name="processingType"
                                value={formData.processingType}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select Processing Type</option>
                                <option value="Drying">Drying</option>
                                <option value="Grinding">Grinding</option>
                                <option value="Extraction">Extraction</option>
                                <option value="Distillation">Distillation</option>
                                <option value="Fermentation">Fermentation</option>
                                <option value="Powdering">Powdering</option>
                                <option value="Capsulation">Capsulation</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Equipment Used</Form.Label>
                              <Form.Control
                                type="text"
                                name="equipmentUsed"
                                value={formData.equipmentUsed}
                                onChange={handleChange}
                                placeholder="e.g., Drying Chamber-001, Grinder-002"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Facility Code</Form.Label>
                              <Form.Control
                                type="text"
                                name="facilityCode"
                                value={formData.facilityCode}
                                onChange={handleChange}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>Processing Location</Form.Label>
                          <Form.Control
                            type="text"
                            name="processingLocation"
                            value={formData.processingLocation}
                            onChange={handleChange}
                            disabled
                          />
                        </Form.Group>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Quality & Safety Records */}
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>🔬 Quality & Safety Records</Accordion.Header>
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
                              <Form.Label>Cleaning/Washing Status</Form.Label>
                              <Form.Select
                                name="cleaningStatus"
                                value={formData.cleaningStatus}
                                onChange={handleChange}
                              >
                                <option value="Completed - Sanitized">Completed - Sanitized</option>
                                <option value="Completed - Standard Wash">Completed - Standard Wash</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Not Required">Not Required</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Storage Temperature (°C)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                name="storageTemperature"
                                value={formData.storageTemperature}
                                onChange={handleChange}
                                placeholder="0.0"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Humidity (%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                name="humidity"
                                value={formData.humidity}
                                onChange={handleChange}
                                placeholder="0.0"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>Packaging Condition</Form.Label>
                          <Form.Select
                            name="packagingCondition"
                            value={formData.packagingCondition}
                            onChange={handleChange}
                          >
                            <option value="Vacuum sealed - Food grade">Vacuum sealed - Food grade</option>
                            <option value="Airtight container - Food grade">Airtight container - Food grade</option>
                            <option value="Standard packaging">Standard packaging</option>
                            <option value="Special handling required">Special handling required</option>
                          </Form.Select>
                        </Form.Group>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Digital Certificates */}
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>🔐 Digital Certificates</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Processor Signature</Form.Label>
                              <Form.Control
                                type="text"
                                name="processorSignature"
                                value={formData.processorSignature}
                                onChange={handleChange}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Certificate ID *</Form.Label>
                              <Form.Control
                                type="text"
                                name="certificateId"
                                value={formData.certificateId}
                                onChange={handleChange}
                                required
                                placeholder="CERT-XXXX-YYYY"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Blockchain Hash</Form.Label>
                              <Form.Control
                                type="text"
                                name="blockchainHash"
                                value={formData.blockchainHash}
                                onChange={handleChange}
                                placeholder="Auto-generated"
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Non-Repudiation Record</Form.Label>
                              <Form.Control
                                type="text"
                                name="nonRepudiationRecord"
                                value={formData.nonRepudiationRecord}
                                onChange={handleChange}
                                placeholder="Auto-generated"
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Additional Information */}
                    <Accordion.Item eventKey="4">
                      <Accordion.Header>📦 Additional Information</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Expiry Date *</Form.Label>
                              <Form.Control
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Processing Method</Form.Label>
                              <Form.Select
                                name="processingMethod"
                                value={formData.processingMethod}
                                onChange={handleChange}
                              >
                                <option value="">Select Method</option>
                                <option value="Traditional">Traditional</option>
                                <option value="Modern">Modern</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Custom">Custom</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>Packaging Type *</Form.Label>
                          <Form.Select
                            name="packagingType"
                            value={formData.packagingType}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Packaging</option>
                            <option value="Glass Bottle">Glass Bottle</option>
                            <option value="Vacuum Sealed Pouch">Vacuum Sealed Pouch</option>
                            <option value="Cardboard Box">Cardboard Box</option>
                            <option value="Bulk Container">Bulk Container</option>
                            <option value="Capsule Bottle">Capsule Bottle</option>
                            <option value="Sachet">Sachet</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Notes</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional processing notes, special conditions, or remarks..."
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
                      {submitting ? 'Submitting...' : (isEdit ? 'Update Processing Details' : 'Process Herb')}
                    </Button>
                    
                    {isEdit && herbDetails?.status === 'processed' && (
                      <Button 
                        variant="primary" 
                        onClick={handleShipHerb}
                        disabled={submitting}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline-secondary" 
                      as={Link} 
                      to="/processor/dashboard"
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

export default ProcessHerb;