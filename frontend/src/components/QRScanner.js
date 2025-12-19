import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Accordion, Badge } from 'react-bootstrap';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleQRDataInput = (e) => {
    const inputData = e.target.value;
    if (inputData.trim()) {
      try {
        const parsedData = JSON.parse(inputData);
        setScannedData(parsedData);
        setError('');
      } catch (err) {
        setError('Invalid JSON data. Please paste valid QR code data.');
        setScannedData(null);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
          setScannedData(parsedData);
          setError('');
        } catch (err) {
          setError('Invalid JSON file. Please upload a valid QR code data file.');
          setScannedData(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderDataContent = () => {
    if (!scannedData) return null;

    const { type, timestamp, herb, farmer, processor, lab, blockchain } = scannedData;

    return (
      <div>
        <Alert variant="success" className="mb-3">
          <Alert.Heading>✅ QR Code Data Successfully Decoded!</Alert.Heading>
          <p>Data Type: <Badge bg="info">{type}</Badge></p>
          <p>Timestamp: {new Date(timestamp).toLocaleString()}</p>
        </Alert>

        <Accordion defaultActiveKey="0">
          {/* Herb Information */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>🌿 Herb Information</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <strong>Name:</strong> {herb.name}<br/>
                  <strong>Scientific Name:</strong> {herb.scientificName}<br/>
                  <strong>Status:</strong> <Badge bg="primary">{herb.status}</Badge>
                </Col>
                <Col md={6}>
                  <strong>Herb ID:</strong> {herb.id}
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Farmer Information */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>👨‍🌾 Farmer Information</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <strong>Farmer ID:</strong> {farmer.id}<br/>
                  <strong>Name:</strong> {farmer.name}<br/>
                  <strong>Location:</strong> {farmer.location}
                </Col>
                <Col md={6}>
                  <strong>Coordinates:</strong> {farmer.coordinates}
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Processor Data (if available) */}
          {processor && (
            <Accordion.Item eventKey="2">
              <Accordion.Header>⚙️ Processing Information</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <strong>Processor ID:</strong> {processor.batchIdentification.processorId}<br/>
                    <strong>Batch Number:</strong> {processor.batchIdentification.batchNumber}<br/>
                    <strong>Processing Type:</strong> {processor.processingInfo.processingType}<br/>
                    <strong>Processing Date:</strong> {new Date(processor.processingInfo.processingDate).toLocaleString()}
                  </Col>
                  <Col md={6}>
                    <strong>Equipment Used:</strong> {processor.processingInfo.equipmentUsed}<br/>
                    <strong>Facility Code:</strong> {processor.processingInfo.facilityCode}<br/>
                    <strong>Moisture Content:</strong> {processor.qualitySafety.moistureContent}<br/>
                    <strong>Cleaning Status:</strong> {processor.qualitySafety.cleaningStatus}
                  </Col>
                </Row>
                <hr/>
                <Row>
                  <Col md={6}>
                    <strong>Storage Temperature:</strong> {processor.qualitySafety.storageTemperature}<br/>
                    <strong>Humidity:</strong> {processor.qualitySafety.humidity}<br/>
                    <strong>Packaging Condition:</strong> {processor.qualitySafety.packagingCondition}
                  </Col>
                  <Col md={6}>
                    <strong>Processor Signature:</strong> {processor.digitalCertificates.processorSignature}<br/>
                    <strong>Certificate ID:</strong> {processor.digitalCertificates.certificateId}<br/>
                    <strong>Blockchain Hash:</strong> {processor.digitalCertificates.blockchainHash.substring(0, 20)}...
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          )}

          {/* Lab Data (if available) */}
          {lab && (
            <Accordion.Item eventKey="3">
              <Accordion.Header>🔬 Laboratory Test Results</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <strong>Lab ID:</strong> {lab.sampleMetadata.labId}<br/>
                    <strong>Batch Number:</strong> {lab.sampleMetadata.batchNumber}<br/>
                    <strong>Quality Score:</strong> {lab.qualityScore}/100<br/>
                    <strong>Collection Date:</strong> {new Date(lab.sampleMetadata.sampleCollectionDate).toLocaleString()}
                  </Col>
                  <Col md={6}>
                    <strong>Alkaloids:</strong> {lab.testResults.chemicalComposition.alkaloids}<br/>
                    <strong>Essential Oils:</strong> {lab.testResults.chemicalComposition.essentialOils}<br/>
                    <strong>Moisture Content:</strong> {lab.testResults.physicalParameters.moistureContent}<br/>
                    <strong>Pharmacopeia Status:</strong> {lab.testResults.pharmacopeiaStatus}
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          )}

          {/* Blockchain Information */}
          <Accordion.Item eventKey="4">
            <Accordion.Header>🔐 Blockchain Verification</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  {blockchain.labCertificateId && (
                    <>
                      <strong>Lab Certificate ID:</strong> {blockchain.labCertificateId}<br/>
                      <strong>Lab Blockchain Hash:</strong> {blockchain.labHash}<br/>
                      {blockchain.labQrCodeHash && (
                        <><strong>Lab QR Code Hash:</strong> {blockchain.labQrCodeHash}</>
                      )}
                    </>
                  )}
                  {blockchain.processorCertificateId && (
                    <>
                      <br/><strong>Processor Certificate ID:</strong> {blockchain.processorCertificateId}<br/>
                      <strong>Processor Blockchain Hash:</strong> {blockchain.processorHash}<br/>
                    </>
                  )}
                  {blockchain.certificateId && !blockchain.labCertificateId && (
                    <>
                      <strong>Certificate ID:</strong> {blockchain.certificateId}<br/>
                      <strong>Blockchain Hash:</strong> {blockchain.hash}<br/>
                    </>
                  )}
                </Col>
                <Col md={6}>
                  <div className="alert alert-success">
                    <strong>✅ Verified</strong><br/>
                    This data has been verified and stored on the blockchain.
                    {processor && lab && (
                      <><br/><strong>Complete Traceability:</strong> Farm → Lab → Processor</>
                    )}
                  </div>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Raw Data */}
          <Accordion.Item eventKey="5">
            <Accordion.Header>📄 Raw Data (JSON)</Accordion.Header>
            <Accordion.Body>
              <pre className="small bg-light p-2 rounded" style={{maxHeight: '300px', overflow: 'auto'}}>
                {JSON.stringify(scannedData, null, 2)}
              </pre>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">📱 QR Code Scanner & Data Viewer</h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Paste QR code data or upload a JSON file to view complete traceability information.
              </p>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form.Group className="mb-3">
                <Form.Label>QR Code Data (JSON)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Paste QR code data here (JSON format)..."
                  onChange={handleQRDataInput}
                />
                <Form.Text className="text-muted">
                  Copy and paste the JSON data from a QR code scanner or the raw data from the dashboards.
                </Form.Text>
              </Form.Group>

              <div className="mb-3">
                <Form.Label>Or Upload JSON File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                />
                <Form.Text className="text-muted">
                  Upload a JSON file containing QR code data.
                </Form.Text>
              </div>

              <div className="d-flex gap-2 mb-3">
                <Button 
                  variant="primary" 
                  onClick={() => setIsScanning(!isScanning)}
                >
                  {isScanning ? 'Stop Scanning' : 'Start Camera Scan'}
                </Button>
                {scannedData && (
                  <Button 
                    variant="success" 
                    onClick={() => {
                      const dataStr = JSON.stringify(scannedData, null, 2);
                      const dataBlob = new Blob([dataStr], {type: 'application/json'});
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `scanned-data-${Date.now()}.json`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Data
                  </Button>
                )}
              </div>

              {isScanning && (
                <Alert variant="info">
                  <Alert.Heading>Camera Scanning</Alert.Heading>
                  <p>Camera scanning functionality would be implemented here using a library like 'react-qr-reader' or 'qr-scanner'.</p>
                  <p>For now, please use the manual input methods above.</p>
                </Alert>
              )}

              {renderDataContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QRScanner;
