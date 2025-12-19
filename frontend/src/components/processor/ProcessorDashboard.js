import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Navbar, Nav, Modal, Accordion } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode.react';
import api from '../../utils/api';

const ProcessorDashboard = ({ user }) => {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();

  const fetchHerbs = async () => {
    setLoading(true);
    try {
      // Use ?all=1 to include pending and other statuses so newly created herbs appear
      const res = await api.get('/api/herbs?all=1');
      const list = (res && res.data) ? res.data : [];
      // Optional: show current processor's herbs first
      const sorted = list.sort((a, b) => {
        const aMine = String(a?.supplier?._id || '') === String(user?._id || '');
        const bMine = String(b?.supplier?._id || '') === String(user?._id || '');
        if (aMine !== bMine) return aMine ? -1 : 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setHerbs(sorted);
    } catch (error) {
      console.error('Error fetching herbs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHerbs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when navigating back with a refresh flag from CreateHerb
  useEffect(() => {
    if (location?.state?.refresh) {
      fetchHerbs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.refresh]);

  // Prefer showing only processor-created herbs; hide lab-created entries
  const visibleHerbs = herbs.filter(h => (h?.supplier?.role || '').toLowerCase() !== 'lab');

  const handleLogout = () => {
    navigate('/');
  };

  const handleViewDetails = (herb) => {
    setSelectedHerb(herb);
    setShowDetailsModal(true);
  };

  const handleGenerateQR = (herb) => {
    const p = herb.processor || {};
    const processorData = {
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
    };

    const qrDataObject = {
      type: 'PROCESSOR_DATA',
      timestamp: new Date().toISOString(),
      herb: {
        id: herb._id,
        name: herb.name,
        scientificName: herb.scientificName,
        status: herb.status
      },
      farmer: {
        id: p.farmerId || 'UNKNOWN',
        name: p.farmerName || herb.supplier?.name || 'Unknown Farmer',
        location: p.farmerLocation || 'Unknown Location'
      },
      processor: processorData,
      blockchain: {
        hash: processorData.digitalCertificates.blockchainHash,
        certificateId: processorData.digitalCertificates.certificateId,
        nonRepudiationRecord: processorData.digitalCertificates.nonRepudiationRecord
      }
    };

    setQrData(qrDataObject);
    setShowQRModal(true);
  };

  const generateProcessorData = (herb) => {
    const processorId = 'PROC-001-2024';
    const batchNumber = `BATCH-${herb.id}-${Date.now()}`;
    const processingDate = new Date().toISOString();
    const blockchainHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    return {
      batchIdentification: {
        processorId: processorId,
        batchNumber: batchNumber,
        farmerId: herb.farmer?.id || 'FARM-001',
        harvestId: herb.harvestId || `HARV-${herb.id}`,
        digitalSignature: `SIG-${processorId}-${Date.now()}`
      },
      processingInfo: {
        processingDate: processingDate,
        processingType: ['Drying', 'Grinding', 'Extraction'][Math.floor(Math.random() * 3)],
        equipmentUsed: ['Drying Chamber-001', 'Grinder-002', 'Extractor-003'][Math.floor(Math.random() * 3)],
        processingLocation: 'GPS: 28.6139°N, 77.2090°E (Delhi Facility)',
        facilityCode: 'FAC-DEL-001'
      },
      qualitySafety: {
        moistureContent: `${(Math.random() * 5 + 8).toFixed(1)}%`,
        cleaningStatus: 'Completed - Sanitized',
        storageTemperature: `${(Math.random() * 5 + 18).toFixed(1)}°C`,
        humidity: `${(Math.random() * 10 + 45).toFixed(1)}%`,
        packagingCondition: 'Vacuum sealed - Food grade'
      },
      digitalCertificates: {
        processorSignature: `PROC-SIG-${processorId}`,
        certificateId: `CERT-${batchNumber}`,
        blockchainHash: blockchainHash,
        nonRepudiationRecord: `NRR-${blockchainHash.substring(0, 16)}`
      }
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'tested':
        return <Badge bg="warning">Ready for Processing</Badge>;
      case 'processed':
        return <Badge bg="success">Processed</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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
              <Nav.Link as={Link} to="/processor/process-herb">Process Herb</Nav.Link>
              <Nav.Link as={Link} to="/processor/create-herb">Create Herb</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row className="align-items-center">
          <Col>
            <h2 className="dashboard-title">Processor Dashboard</h2>
            <p className="text-muted">Welcome, {user?.name || 'Processor User'}</p>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" size="sm" onClick={fetchHerbs} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Inventory'}
            </Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Herbs Ready for Processing</Card.Title>
                <Card.Text className="display-4 text-warning">
                  {visibleHerbs.filter(herb => herb.status === 'approved').length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Herbs Processed</Card.Title>
                <Card.Text className="display-4 text-success">
                  {visibleHerbs.filter(herb => herb.status === 'processed' || herb.status === 'shipped').length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Actions</Card.Title>
                <div className="d-grid">
                  <Button 
                    variant="success" 
                    as={Link} 
                    to="/processor/process-herb"
                  >
                    Process New Herb
                  </Button>
                  <Button 
                    variant="outline-success" 
                    as={Link} 
                    to="/processor/create-herb"
                    className="mt-2"
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
            <Card>
              <Card.Header>
                <h5 className="mb-0">Herb Inventory</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <p className="text-center">Loading herbs data...</p>
                ) : (
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Scientific Name</th>
                        <th>Quality Score</th>
                        <th>Farmer Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleHerbs.length > 0 ? (
                        visibleHerbs.map((herb) => (
                          <tr key={herb._id}>
                            <td>{herb._id}</td>
                            <td>{herb.name}</td>
                            <td>{herb.scientificName}</td>
                            <td>{herb.processor?.qualityScore || 'N/A'}</td>
                            <td>{herb.processor?.farmerName || herb.processor?.farmerId || herb.supplier?.name || 'N/A'}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  as={Link}
                                  to={`/processor/process-herb?id=${herb._id}`}
                                >
                                  {herb.processor ? 'Process More' : 'Process Herb'}
                                </Button>
                                {herb.processor && (
                                  <>
                                    <Button 
                                      variant="outline-info" 
                                      size="sm"
                                      onClick={() => handleViewDetails(herb)}
                                    >
                                      View Details
                                    </Button>
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      onClick={() => handleGenerateQR(herb)}
                                    >
                                      Generate QR
                                    </Button>
                                  </>
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

        {/* Processing Details Modal */}
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>🌿 Processing Details - {selectedHerb?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedHerb && (
              <div>
                {(() => {
                  const p = selectedHerb.processor;
                  if (!p) {
                    return <div className="alert alert-warning">No processing details found for this herb yet.</div>;
                  }
                  return (
                    <Accordion defaultActiveKey="0">
                      {/* Batch Identification */}
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>📋 Batch Identification</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Processor ID:</strong> {p.processorId || 'N/A'}<br/>
                              <strong>Batch/Lot Number:</strong> {p.batchNumber || 'N/A'}<br/>
                              <strong>Farmer:</strong> {p.farmerName || p.farmerId || selectedHerb.supplier?.name || 'N/A'}<br/>
                              <strong>Harvest ID:</strong> {p.harvestId || 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>Digital Signature:</strong> {p.digitalSignature || 'N/A'}
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Processing Information */}
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>⚙️ Processing Information</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Processing Date:</strong> {p.processingDate ? new Date(p.processingDate).toLocaleDateString() : 'N/A'}<br/>
                              <strong>Processing Type:</strong> {p.processingType || 'N/A'}<br/>
                              <strong>Equipment Used:</strong> {p.equipmentUsed || 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>Processing Location:</strong> {p.processingLocation || 'N/A'}<br/>
                              <strong>Facility Code:</strong> {p.facilityCode || 'N/A'}
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Quality & Safety Records */}
                      <Accordion.Item eventKey="2">
                        <Accordion.Header>🔬 Quality & Safety Records</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Moisture Content:</strong> {p.moistureContent ?? 'N/A'}<br/>
                              <strong>Cleaning/Washing Status:</strong> {p.cleaningStatus || 'N/A'}<br/>
                              <strong>Storage Temperature:</strong> {p.storageTemperature ?? 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>Humidity:</strong> {p.humidity ?? 'N/A'}<br/>
                              <strong>Packaging Condition:</strong> {p.packagingCondition || 'N/A'}
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Digital Certificates */}
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>🔐 Digital Certificates</Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <strong>Processor Signature:</strong> {p.processorSignature || 'N/A'}<br/>
                              <strong>Certificate ID:</strong> {p.certificateId || 'N/A'}<br/>
                              <strong>Blockchain Hash:</strong> {p.blockchainHash || 'N/A'}<br/>
                              <strong>Non-Repudiation Record:</strong> {p.nonRepudiationRecord || 'N/A'}
                            </Col>
                            <Col md={6}>
                              <strong>Notes:</strong> {p.notes || '—'}
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
            <Modal.Title>📱 QR Code - Processing Data</Modal.Title>
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
                      <p className="mt-2 small text-muted">Scan to view complete processing data</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6>QR Code Contains:</h6>
                    <ul className="small">
                      <li><strong>Herb Info:</strong> {qrData.herb.name} ({qrData.herb.scientificName})</li>
                      <li><strong>Farmer:</strong> {qrData.farmer.name} - {qrData.farmer.location}</li>
                      <li><strong>Processor:</strong> {qrData.processor.batchIdentification.processorId}</li>
                      <li><strong>Batch:</strong> {qrData.processor.batchIdentification.batchNumber}</li>
                      <li><strong>Processing Type:</strong> {qrData.processor.processingInfo.processingType}</li>
                      <li><strong>Certificate:</strong> {qrData.blockchain.certificateId}</li>
                      <li><strong>Blockchain Hash:</strong> {qrData.blockchain.hash.substring(0, 20)}...</li>
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
                link.download = `processor-data-${qrData.herb.id}.json`;
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

export default ProcessorDashboard;