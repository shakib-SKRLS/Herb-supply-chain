import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Accordion, Badge, Modal } from 'react-bootstrap';
import QrScanner from 'qr-scanner';

const QRVerificationService = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const handleQRDataInput = (e) => {
    const inputData = e.target.value;
    if (inputData.trim()) {
      try {
        const parsedData = JSON.parse(inputData);
        setScannedData(parsedData);
        setError('');
        verifyQRData(parsedData);
      } catch (err) {
        setError('Invalid JSON data. Please paste valid QR code data.');
        setScannedData(null);
        setVerificationStatus(null);
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
          verifyQRData(parsedData);
        } catch (err) {
          setError('Invalid JSON file. Please upload a valid QR code data file.');
          setScannedData(null);
          setVerificationStatus(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const verifyQRData = (data) => {
    // Simulate verification process
    const hasRequiredFields = data.lab && data.herb && data.blockchain;
    const hasValidSignature = data.lab?.certification?.digitalSignature || data.lab?.certification?.labSignature;
    const hasBlockchainHash = data.blockchain?.labHash || data.blockchain?.hash;
    
    if (hasRequiredFields && hasValidSignature && hasBlockchainHash) {
      setVerificationStatus({
        isValid: true,
        message: 'QR Code verification successful! This lab result is authentic and verified.',
        details: {
          hasLabData: !!data.lab,
          hasHerbData: !!data.herb,
          hasBlockchainVerification: !!hasBlockchainHash,
          hasDigitalSignature: !!hasValidSignature
        }
      });
    } else {
      setVerificationStatus({
        isValid: false,
        message: 'QR Code verification failed. This lab result may not be authentic.',
        details: {
          hasLabData: !!data.lab,
          hasHerbData: !!data.herb,
          hasBlockchainVerification: !!hasBlockchainHash,
          hasDigitalSignature: !!hasValidSignature
        }
      });
    }
  };

  const startCameraScanning = async () => {
    try {
      setCameraError('');
      setIsScanning(true);
      
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            try {
              const parsedData = JSON.parse(result.data);
              setScannedData(parsedData);
              setError('');
              verifyQRData(parsedData);
              stopCameraScanning();
            } catch (err) {
              setError('Invalid QR code data. Please scan a valid lab result QR code.');
              setScannedData(null);
              setVerificationStatus(null);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        await qrScannerRef.current.start();
      }
    } catch (err) {
      setCameraError('Camera access denied or not available. Please use manual input instead.');
      setIsScanning(false);
    }
  };

  const stopCameraScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleScanning = () => {
    if (isScanning) {
      stopCameraScanning();
    } else {
      startCameraScanning();
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const renderLabDataContent = () => {
    if (!scannedData || !scannedData.lab) return null;

    const { lab, herb, farmer, blockchain } = scannedData;

    return (
      <div>
        <Alert variant={verificationStatus?.isValid ? "success" : "danger"} className="mb-3">
          <Alert.Heading>
            {verificationStatus?.isValid ? "✅ Lab Result Verified" : "❌ Verification Failed"}
          </Alert.Heading>
          <p>{verificationStatus?.message}</p>
          {verificationStatus?.details && (
            <div className="mt-2">
              <small>
                <strong>Verification Details:</strong><br/>
                Lab Data: {verificationStatus.details.hasLabData ? "✅" : "❌"} | 
                Herb Data: {verificationStatus.details.hasHerbData ? "✅" : "❌"} | 
                Blockchain: {verificationStatus.details.hasBlockchainVerification ? "✅" : "❌"} | 
                Digital Signature: {verificationStatus.details.hasDigitalSignature ? "✅" : "❌"}
              </small>
            </div>
          )}
        </Alert>

        <Accordion defaultActiveKey="0">
          {/* Herb Information */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>🌿 Herb Information</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <strong>Name:</strong> {herb?.name || 'N/A'}<br/>
                  <strong>Scientific Name:</strong> {herb?.scientificName || 'N/A'}<br/>
                  <strong>Status:</strong> <Badge bg="primary">{herb?.status || 'N/A'}</Badge>
                </Col>
                <Col md={6}>
                  <strong>Herb ID:</strong> {herb?.id || 'N/A'}
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Farmer Information */}
          {farmer && (
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
          )}

          {/* Lab Test Results */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>🔬 Laboratory Test Results</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <strong>Lab ID:</strong> {lab.sampleMetadata?.labId || lab.labId || 'N/A'}<br/>
                  <strong>Batch Number:</strong> {lab.sampleMetadata?.batchNumber || lab.batchNumber || 'N/A'}<br/>
                  <strong>Quality Score:</strong> {lab.qualityScore || 'N/A'}/100<br/>
                  <strong>Collection Date:</strong> {lab.sampleMetadata?.sampleCollectionDate ? 
                    new Date(lab.sampleMetadata.sampleCollectionDate).toLocaleString() : 
                    (lab.testDate ? new Date(lab.testDate).toLocaleString() : 'N/A')}
                </Col>
                <Col md={6}>
                  <strong>Certification ID:</strong> {lab.certification?.certificateId || lab.certificationId || 'N/A'}<br/>
                  <strong>Validity Period:</strong> {lab.certification?.validityPeriod || lab.validityPeriod || 'N/A'}<br/>
                  <strong>Issued By:</strong> {lab.certification?.issuedBy || lab.issuedBy || 'N/A'}
                </Col>
              </Row>
              
              <hr/>
              
              {/* Chemical Composition */}
              {lab.testResults?.chemicalComposition && (
                <div className="mb-3">
                  <h6><strong>Chemical Composition</strong></h6>
                  <Row>
                    <Col md={3}>
                      <strong>Alkaloids:</strong> {lab.testResults.chemicalComposition.alkaloids}
                    </Col>
                    <Col md={3}>
                      <strong>Essential Oils:</strong> {lab.testResults.chemicalComposition.essentialOils}
                    </Col>
                    <Col md={3}>
                      <strong>Flavonoids:</strong> {lab.testResults.chemicalComposition.flavonoids}
                    </Col>
                    <Col md={3}>
                      <strong>Tannins:</strong> {lab.testResults.chemicalComposition.tannins}
                    </Col>
                  </Row>
                </div>
              )}

              {/* Contaminants */}
              {lab.testResults?.contaminants && (
                <div className="mb-3">
                  <h6><strong>Contaminants Analysis</strong></h6>
                  <Row>
                    <Col md={3}>
                      <strong>Pesticides:</strong> {lab.testResults.contaminants.pesticides}
                    </Col>
                    <Col md={3}>
                      <strong>Heavy Metals:</strong> {lab.testResults.contaminants.heavyMetals}
                    </Col>
                    <Col md={3}>
                      <strong>Microbes:</strong> {lab.testResults.contaminants.microbes}
                    </Col>
                    <Col md={3}>
                      <strong>Aflatoxins:</strong> {lab.testResults.contaminants.aflatoxins}
                    </Col>
                  </Row>
                </div>
              )}

              {/* Physical Parameters */}
              {lab.testResults?.physicalParameters && (
                <div className="mb-3">
                  <h6><strong>Physical Parameters</strong></h6>
                  <Row>
                    <Col md={3}>
                      <strong>Moisture Content:</strong> {lab.testResults.physicalParameters.moistureContent}
                    </Col>
                    <Col md={3}>
                      <strong>Ash Content:</strong> {lab.testResults.physicalParameters.ashContent}
                    </Col>
                    <Col md={3}>
                      <strong>pH:</strong> {lab.testResults.physicalParameters.pH}
                    </Col>
                    <Col md={3}>
                      <strong>Density:</strong> {lab.testResults.physicalParameters.density}
                    </Col>
                  </Row>
                </div>
              )}

              {/* Pharmacopeia Status */}
              {lab.testResults?.pharmacopeiaStatus && (
                <div className="mb-3">
                  <h6><strong>Pharmacopeia Status:</strong> 
                    <Badge bg={lab.testResults.pharmacopeiaStatus.includes('PASS') ? 'success' : 'danger'} className="ms-2">
                      {lab.testResults.pharmacopeiaStatus}
                    </Badge>
                  </h6>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* Blockchain Verification */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>🔐 Blockchain Verification</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  {blockchain?.labCertificateId && (
                    <>
                      <strong>Lab Certificate ID:</strong> {blockchain.labCertificateId}<br/>
                      <strong>Lab Blockchain Hash:</strong> {blockchain.labHash}<br/>
                      {blockchain.labQrCodeHash && (
                        <><strong>Lab QR Code Hash:</strong> {blockchain.labQrCodeHash}</>
                      )}
                    </>
                  )}
                  {blockchain?.certificateId && !blockchain.labCertificateId && (
                    <>
                      <strong>Certificate ID:</strong> {blockchain.certificateId}<br/>
                      <strong>Blockchain Hash:</strong> {blockchain.hash}<br/>
                    </>
                  )}
                </Col>
                <Col md={6}>
                  <div className={`alert ${verificationStatus?.isValid ? 'alert-success' : 'alert-danger'}`}>
                    <strong>{verificationStatus?.isValid ? '✅ Verified' : '❌ Not Verified'}</strong><br/>
                    {verificationStatus?.isValid ? 
                      'This lab result has been verified and stored on the blockchain.' :
                      'This lab result could not be verified. Please check the QR code.'
                    }
                  </div>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Raw Data */}
          <Accordion.Item eventKey="4">
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
    <div>
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">🔍 QR Code Verification Service</h4>
        </Card.Header>
        <Card.Body>
          <p className="text-muted">
            Verify the authenticity of lab results by scanning QR codes. This service ensures the integrity and traceability of your herbal products.
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
              Copy and paste the JSON data from a QR code scanner or the raw data from lab certificates.
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
              Upload a JSON file containing QR code data from lab results.
            </Form.Text>
          </div>

          <div className="d-flex gap-2 mb-3">
            <Button 
              variant="primary" 
              onClick={toggleScanning}
            >
              {isScanning ? 'Stop Scanning' : 'Start Camera Scan'}
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                const sampleData = {
                  type: "lab_result",
                  timestamp: new Date().toISOString(),
                  herb: {
                    id: "herb001",
                    name: "Ashwagandha",
                    scientificName: "Withania somnifera",
                    status: "tested"
                  },
                  farmer: {
                    id: "farmer001",
                    name: "Ramesh Kumar",
                    location: "Uttarakhand, India",
                    coordinates: "30.0668° N, 79.0193° E"
                  },
                  lab: {
                    sampleMetadata: {
                      labId: "LAB-001-2024",
                      batchNumber: "BATCH-ASH-001",
                      sampleCollectionDate: new Date().toISOString(),
                      collectedBy: "Dr. Sarah Johnson",
                      transferredBy: "Lab Technician - Mike Chen",
                      chainOfCustody: "COC-ASH-001-2024"
                    },
                    testResults: {
                      chemicalComposition: {
                        alkaloids: "1.2%",
                        essentialOils: "2.8%",
                        flavonoids: "1.5%",
                        tannins: "3.2%"
                      },
                      contaminants: {
                        pesticides: "Below Detection Limit",
                        heavyMetals: "Within Safe Limits",
                        microbes: "E. Coli: Negative, Salmonella: Negative",
                        aflatoxins: "Below 10 ppb (Safe)"
                      },
                      physicalParameters: {
                        moistureContent: "9.5%",
                        ashContent: "6.8%",
                        pH: "6.2",
                        density: "1.15 g/cm³"
                      },
                      pharmacopeiaStatus: "PASS - Meets USP Standards"
                    },
                    qualityScore: 92,
                    certification: {
                      certificateId: "CERT-ASH-001-2024",
                      labSignature: "LAB-SIG-001",
                      digitalSignature: "DIG-SIG-ASH-001",
                      validityPeriod: "2 years from issue date",
                      issuedBy: "Certified Testing Laboratory - Delhi"
                    }
                  },
                  blockchain: {
                    labCertificateId: "CERT-ASH-001-2024",
                    labHash: "0x" + Math.random().toString(16).substr(2, 64),
                    labQrCodeHash: "QR-" + Math.random().toString(16).substr(2, 16)
                  }
                };
                setScannedData(sampleData);
                setError('');
                verifyQRData(sampleData);
              }}
            >
              Load Sample Data
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
                  link.download = `verified-lab-result-${Date.now()}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download Verified Data
              </Button>
            )}
            {scannedData && (
              <Button 
                variant="info" 
                onClick={() => setShowModal(true)}
              >
                View Full Report
              </Button>
            )}
          </div>

          {isScanning && (
            <div className="mb-3">
              <Alert variant="info">
                <Alert.Heading>Camera Scanning Active</Alert.Heading>
                <p>Point your camera at a QR code to scan it. Make sure the QR code is clearly visible and well-lit.</p>
              </Alert>
              <div className="text-center">
                <video
                  ref={videoRef}
                  style={{ width: '100%', maxWidth: '400px', height: '300px', border: '2px solid #007bff', borderRadius: '8px' }}
                />
              </div>
              {cameraError && (
                <Alert variant="danger" className="mt-2">
                  {cameraError}
                </Alert>
              )}
            </div>
          )}

          {renderLabDataContent()}
        </Card.Body>
      </Card>

      {/* Full Report Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📊 Complete Lab Result Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderLabDataContent()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            const dataStr = JSON.stringify(scannedData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `complete-lab-report-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}>
            Download Full Report
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QRVerificationService;
