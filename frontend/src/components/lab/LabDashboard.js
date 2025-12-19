import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Navbar, Nav, Modal, Accordion } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode.react';
import api from '../../utils/api';
import '../../styles/Dashboard.css';

const LabDashboard = ({ user }) => {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchHerbs = async () => {
    setLoading(true);
    try {
      // Fetch all herbs so newly added/updated ones appear immediately
      const res = await api.get('/api/herbs?all=1');
      setHerbs((res && res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching herbs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHerbs();
  }, []);

  // Refetch when returning from AddHerbDetails with a refresh flag
  useEffect(() => {
    if (location?.state?.refresh) {
      fetchHerbs();
    }
  }, [location?.state?.refresh]);

  const handleLogout = () => {
    // In a real app, you would clear authentication state
    navigate('/');
  };

  const handleViewDetails = (herb) => {
    setSelectedHerb(herb);
    setShowDetailsModal(true);
  };

  const handleGenerateQR = (herb) => {
    const labResult = Array.isArray(herb.labResults) && herb.labResults.length > 0 ? herb.labResults[0] : null;
    const p = herb.processor || {};

    const processorData = herb.processor ? {
      batchIdentification: {
        processorId: p.processorId || 'PROC-UNKNOWN',
        batchNumber: p.batchNumber || herb.batchNumber || `BATCH-${herb._id}`,
        farmerId: p.farmerId || 'UNKNOWN',
        harvestId: p.harvestId || 'UNKNOWN',
        digitalSignature: p.digitalSignature || 'N/A'
      },
      processingInfo: {
        processingDate: p.processingDate || null,
        processingType: p.processingType || 'N/A',
        equipmentUsed: p.equipmentUsed || 'N/A',
        processingLocation: p.processingLocation || 'N/A',
        facilityCode: p.facilityCode || 'N/A'
      },
      qualitySafety: {
        moistureContent: p.moistureContent ?? null,
        cleaningStatus: p.cleaningStatus || 'N/A',
        storageTemperature: p.storageTemperature ?? null,
        humidity: p.humidity ?? null,
        packagingCondition: p.packagingCondition || 'N/A'
      },
      digitalCertificates: {
        processorSignature: p.processorSignature || 'N/A',
        certificateId: p.certificateId || 'N/A',
        blockchainHash: p.blockchainHash || 'N/A',
        nonRepudiationRecord: p.nonRepudiationRecord || 'N/A'
      }
    } : null;

    const labData = labResult ? {
      metadata: {
        testDate: labResult.testDate,
        status: labResult.status,
        testedBy: labResult.testedBy,
        certificateUrl: labResult.certificateUrl || null
      },
      testResults: labResult.testResults || {}
    } : null;

    const qrDataObject = {
      type: 'TRACEABILITY_DATA_V1',
      timestamp: new Date().toISOString(),
      herb: {
        id: herb._id,
        name: herb.name,
        scientificName: herb.scientificName,
        status: herb.status,
        batchNumber: herb.batchNumber
      },
      farmer: {
        id: p.farmerId || 'UNKNOWN',
        name: p.farmerName || herb.supplier?.name || 'Unknown Farmer',
        location: p.farmerLocation || 'Unknown'
      },
      processor: processorData,
      lab: labData
    };

    setQrData(qrDataObject);
    setShowQRModal(true);
  };

  const generateLabData = (herb) => {
    const labId = 'LAB-001-2024';
    const sampleCollectionDate = new Date().toISOString();
    const blockchainHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const certificateId = `CERT-LAB-${herb.id}-${Date.now()}`;
    
    return {
      sampleMetadata: {
        labId: labId,
        batchNumber: `BATCH-${herb.id}`,
        sampleCollectionDate: sampleCollectionDate,
        collectedBy: 'Dr. Sarah Johnson',
        transferredBy: 'Lab Technician - Mike Chen',
        chainOfCustody: `COC-${herb.id}-${Date.now()}`
      },
      testResults: {
        chemicalComposition: {
          alkaloids: `${(Math.random() * 2 + 0.5).toFixed(2)}%`,
          essentialOils: `${(Math.random() * 5 + 1).toFixed(2)}%`,
          flavonoids: `${(Math.random() * 3 + 0.8).toFixed(2)}%`,
          tannins: `${(Math.random() * 4 + 2).toFixed(2)}%`
        },
        contaminants: {
          pesticides: 'Below Detection Limit',
          heavyMetals: 'Within Safe Limits',
          microbes: 'E. Coli: Negative, Salmonella: Negative',
          aflatoxins: 'Below 10 ppb (Safe)'
        },
        physicalParameters: {
          moistureContent: `${(Math.random() * 5 + 8).toFixed(1)}%`,
          ashContent: `${(Math.random() * 3 + 5).toFixed(1)}%`,
          pH: (Math.random() * 2 + 6).toFixed(1),
          density: `${(Math.random() * 0.5 + 0.8).toFixed(2)} g/cm³`
        },
        pharmacopeiaStatus: 'PASS - Meets USP Standards'
      },
      certification: {
        certificateId: certificateId,
        labSignature: `LAB-SIG-${labId}`,
        digitalSignature: `DIG-SIG-${certificateId}`,
        blockchainHash: blockchainHash,
        qrCodeHash: `QR-${blockchainHash.substring(0, 16)}`,
        validityPeriod: '2 years from issue date',
        issuedBy: 'Certified Testing Laboratory - Delhi'
      }
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'processed':
        return <Badge bg="info">Processed</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const canGenerateProcessorQR = (herb) => !!herb.processor;
  const canGenerateCompleteQR = (herb) => Array.isArray(herb.labResults) && herb.labResults.length > 0;

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
            <h2 className="dashboard-title">Laboratory Dashboard</h2>
            <p className="text-muted">Welcome, {user?.name || 'Lab User'}</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <Card className="mb-4 dashboard-card">
              <Card.Body>
                <Card.Title>Herbs Pending Test</Card.Title>
                <Card.Text className="display-4 text-warning stats-counter">
                  {herbs.filter(h => !Array.isArray(h.labResults) || h.labResults.length === 0).length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 dashboard-card">
              <Card.Body>
                <Card.Title>Herbs Tested</Card.Title>
                <Card.Text className="display-4 text-success stats-counter">
                  {herbs.filter(h => Array.isArray(h.labResults) && h.labResults.length > 0).length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 dashboard-card">
              <Card.Body>
                <Card.Title>Actions</Card.Title>
                <div className="d-grid">
                  <Button 
                    variant="success" 
                    as={Link} 
                    to="/lab/add-herb-details"
                    className="action-btn pulse-animation"
                  >
                    Add New Herb Details
                  </Button>
                  <Button 
                    variant="outline-success" 
                    as={Link} 
                    to="/lab/create-herb"
                    className="action-btn mt-2"
                  >
                    Create New Herb
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="dashboard-card">
              <Card.Header>
                <h5 className="mb-0">Herb Inventory</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner"></div>
                    <p className="mt-3">Loading herbs data...</p>
                  </div>
                ) : (
                  <Table responsive striped hover className="animated-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Scientific Name</th>
                        <th>Supplier</th>
                        <th>Farmer Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {herbs.length > 0 ? (
                        herbs.map((herb) => (
                          <tr key={herb._id}>
                            <td>{herb._id}</td>
                            <td>{herb.name}</td>
                            <td>{herb.scientificName}</td>
                            <td>{herb.supplier?.name || 'N/A'}</td>
                            <td>{herb.processor?.farmerName || herb.processor?.farmerId || herb.supplier?.name || 'N/A'}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  as={Link}
                                  to={`/lab/add-herb-details?id=${herb._id}`}
                                  className="action-btn"
                                >
                                  {(Array.isArray(herb.labResults) && herb.labResults.length > 0) ? 'Update Results' : 'Add Test Results'}
                                </Button>
                                {Array.isArray(herb.labResults) && herb.labResults.length > 0 && (
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => handleViewDetails(herb)}
                                    className="action-btn"
                                  >
                                    View Lab Details
                                  </Button>
                                )}
                                {canGenerateProcessorQR(herb) && !canGenerateCompleteQR(herb) && (
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => handleGenerateQR(herb)}
                                    className="action-btn"
                                  >
                                    Generate QR (Processor)
                                  </Button>
                                )}
                                {canGenerateCompleteQR(herb) && (
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => handleGenerateQR(herb)}
                                    className="action-btn"
                                  >
                                    Generate QR (Complete)
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No herbs found in the system.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Lab Testing Details Modal */}
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>🔬 Lab Testing Details - {selectedHerb?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedHerb && (
              <div>
                {(() => {
                  const lr = Array.isArray(selectedHerb.labResults) && selectedHerb.labResults.length > 0 ? selectedHerb.labResults[0] : null;
                  if (!lr) {
                    return (
                      <div className="alert alert-warning">No lab results found for this herb yet.</div>
                    );
                  }
                  const tr = lr.testResults || {};
                  return (
                    <Accordion defaultActiveKey="0">
                      {/* Test Metadata */}
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>📋 Test Metadata</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Test Date:</strong> {lr.testDate ? new Date(lr.testDate).toLocaleString() : 'N/A'}<br/>
                              <strong>Status:</strong> {lr.status || 'N/A'}<br/>
                              <strong>Certificate:</strong> {lr.certificateUrl || 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>Tested By (User ID):</strong> {lr.testedBy || 'N/A'}<br/>
                              <strong>Notes:</strong> {lr.notes || '—'}
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Heavy Metals */}
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>🧪 Heavy Metals</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Lead (ppm):</strong> {tr?.heavyMetals?.lead ?? 'N/A'}<br/>
                              <strong>Mercury (ppm):</strong> {tr?.heavyMetals?.mercury ?? 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>Arsenic (ppm):</strong> {tr?.heavyMetals?.arsenic ?? 'N/A'}<br/>
                              <strong>Cadmium (ppm):</strong> {tr?.heavyMetals?.cadmium ?? 'N/A'}
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Microbial */}
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>🧫 Microbial</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Total Aerobic Microbial Count (CFU/g):</strong> {tr?.microbial?.totalAerobicMicrobialCount ?? 'N/A'}<br/>
                              <strong>Total Yeast And Mold (CFU/g):</strong> {tr?.microbial?.totalYeastAndMold ?? 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>E. Coli:</strong> {tr?.microbial?.eColi === false ? 'Negative' : tr?.microbial?.eColi === true ? 'Positive' : 'N/A'}<br/>
                              <strong>Salmonella:</strong> {tr?.microbial?.salmonella === false ? 'Negative' : tr?.microbial?.salmonella === true ? 'Positive' : 'N/A'}<br/>
                              <strong>Staphylococcus:</strong> {tr?.microbial?.staphylococcus === false ? 'Negative' : tr?.microbial?.staphylococcus === true ? 'Positive' : 'N/A'}
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Pesticides */}
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>🚫 Pesticides</Accordion.Header>
                        <Accordion.Body>
                          {Array.isArray(tr?.pesticides) && tr.pesticides.length > 0 ? (
                            <Table striped size="sm">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Level (ppm)</th>
                                  <th>EPA Limit (ppm)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tr.pesticides.map((p, idx) => (
                                  <tr key={idx}>
                                    <td>{p.name}</td>
                                    <td>{p.level}</td>
                                    <td>{p.epaLimit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <div className="text-muted">No pesticide data.</div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Active Constituents */}
                      <Accordion.Item eventKey="4">
                        <Accordion.Header>🧷 Active Constituents</Accordion.Header>
                        <Accordion.Body>
                          {Array.isArray(tr?.activeConstituents) && tr.activeConstituents.length > 0 ? (
                            <Table striped size="sm">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Percentage (%)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tr.activeConstituents.map((a, idx) => (
                                  <tr key={idx}>
                                    <td>{a.name}</td>
                                    <td>{a.percentage}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <div className="text-muted">No active constituent data.</div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Physical Parameters */}
                      <Accordion.Item eventKey="5">
                        <Accordion.Header>📊 Physical Parameters</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Moisture Content (%):</strong> {tr?.moistureContent ?? 'N/A'}<br/>
                              <strong>Ash Content (%):</strong> {tr?.ashContent ?? 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>Foreign Matter (%):</strong> {tr?.foreignMatter ?? 'N/A'}
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  );
                })()}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* QR Code Modal */}
        <Modal show={showQRModal} onHide={() => setShowQRModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>📱 QR Code - Lab Test Data</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {qrData && (
              <div>
                <Row>
                  <Col md={6}>
                    <div className="text-center">
                      <QRCode 
                        value={JSON.stringify(qrData)}
                        size={200}
                        level="M"
                      />
                      <p className="mt-2 small text-muted">Scan to view complete lab test data</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6>QR Code Contains:</h6>
                    <ul className="small">
                      <li><strong>Herb:</strong> {qrData.herb?.name} ({qrData.herb?.scientificName})</li>
                      <li><strong>Farmer:</strong> {qrData.farmer?.name} {qrData.farmer?.location ? `- ${qrData.farmer.location}` : ''}</li>
                      {qrData.processor && (
                        <>
                          <li><strong>Processor ID:</strong> {qrData.processor.batchIdentification?.processorId}</li>
                          <li><strong>Processing Type:</strong> {qrData.processor.processingInfo?.processingType}</li>
                          <li><strong>Processor Certificate:</strong> {qrData.processor.digitalCertificates?.certificateId}</li>
                        </>
                      )}
                      {qrData.lab && (
                        <>
                          <li><strong>Lab Test Date:</strong> {qrData.lab.metadata?.testDate ? new Date(qrData.lab.metadata.testDate).toLocaleString() : 'N/A'}</li>
                          <li><strong>Lab Status:</strong> {qrData.lab.metadata?.status}</li>
                        </>
                      )}
                    </ul>
                  </Col>
                </Row>
                <hr/>
                <div className="mt-3">
                  <h6>Raw QR Data (JSON):</h6>
                  <pre className="small bg-light p-2 rounded" style={{maxHeight: '200px', overflow: 'auto'}}>
                    {JSON.stringify(qrData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowQRModal(false)}>
              Close
            </Button>
            <Button 
              variant="success" 
              onClick={() => {
                const dataStr = JSON.stringify(qrData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `lab-data-${qrData.herb.id}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download Data
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default LabDashboard;