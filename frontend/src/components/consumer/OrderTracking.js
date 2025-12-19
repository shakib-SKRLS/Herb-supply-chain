import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Navbar, Nav, ListGroup, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import api from '../../utils/api';

const OrderTracking = ({ user }) => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [herb, setHerb] = useState(null);
  const [latestLab, setLatestLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/api/orders/${orderId}`);
        const ord = res?.data;
        if (!cancelled) setOrder(ord);

        // Determine herb id from first item
        const firstItem = ord?.items?.[0];
        const herbId = (firstItem?.herb && (firstItem.herb._id || firstItem.herb)) || null;
        if (herbId) {
          const herbRes = await api.get(`/api/herbs/${herbId}`);
          if (!cancelled) setHerb(herbRes?.data || null);
          // Fetch latest lab result for this herb
          try {
            const labRes = await api.get(`/api/lab-results/herb/${herbId}/latest`);
            if (!cancelled) setLatestLab(labRes?.data || null);
          } catch (e) {
            console.warn('No latest lab result found or failed to fetch:', e.message);
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrderDetails();

    // Poll for status updates every 10s until delivered
    const interval = setInterval(() => {
      if (order && order.status === 'delivered') return; // stop polling conditionally
      fetchOrderDetails();
    }, 10000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [orderId, order?.status]);

  const handleLogout = () => {
    navigate('/');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  const getProgressValue = (status) => {
    // pending -> 10, processing -> 40, shipped -> 70, delivered -> 100
    switch (status) {
      case 'pending':
        return 10;
      case 'processing':
        return 40;
      case 'shipped':
        return 70;
      case 'delivered':
        return 100;
      default:
        return 5;
    }
  };

  // Generate QR code data
  const generateQRData = () => {
    if (!order || !herb) return '';
    
    const qrData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      herbId: herb._id,
      herbName: herb.name,
      batchNumber: herb.batchNumber || herb.processor?.batchNumber,
      expiryDate: herb.expiryDate || herb.processor?.expiryDate,
      latestLabStatus: latestLab?.status,
    };
    
    return JSON.stringify(qrData);
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <p className="text-center">Loading order details...</p>
      </Container>
    );
  }

  if (!order || !herb) {
    return (
      <Container className="mt-5">
        <p className="text-center">Order not found or has been removed.</p>
      </Container>
    );
  }

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
            <h2 className="dashboard-title">Order Tracking</h2>
            <p className="text-muted">
              Order {order.orderNumber ? `#${order.orderNumber}` : `#${String(order._id).substring(0,8)}`}
              {order.createdAt ? ` • Placed on ${new Date(order.createdAt).toLocaleDateString()}` : ''}
            </p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Details</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Herb Information</h6>
                    <p>
                      <strong>Name:</strong> {herb.name}<br />
                      <strong>Scientific Name:</strong> {herb.scientificName}<br />
                      <strong>Batch Number:</strong> {herb.batchNumber || herb.processor?.batchNumber || 'N/A'}<br />
                      <strong>Expiry Date:</strong> {(herb.expiryDate && new Date(herb.expiryDate).toLocaleDateString()) || (herb.processor?.expiryDate || 'N/A')}
                    </p>
                    
                    {herb.processor?.farmerName || herb.processor?.farmerLocation ? (
                      <>
                        <h6 className="mt-4">Farmer Details</h6>
                        <p>
                          <strong>Name:</strong> {herb.processor?.farmerName || 'N/A'}<br />
                          <strong>Location:</strong> {herb.processor?.farmerLocation || 'N/A'}
                        </p>
                      </>
                    ) : null}
                  </Col>
                  <Col md={6}>
                    <h6>Quality Assessment</h6>
                    <p>
                      <strong>Status:</strong> {latestLab ? latestLab.status : 'No results yet'}<br />
                      <strong>Test Date:</strong> {latestLab?.testDate ? new Date(latestLab.testDate).toLocaleDateString() : '-'}<br />
                      <strong>Moisture:</strong> {latestLab?.testResults?.moistureContent ?? '-'}%<br />
                      <strong>Ash:</strong> {latestLab?.testResults?.ashContent ?? '-'}%<br />
                      <strong>Foreign Matter:</strong> {latestLab?.testResults?.foreignMatter ?? '-'}%
                    </p>
                    
                    <h6 className="mt-4">Processing Details</h6>
                    <p>
                      <strong>Processor:</strong> {herb.processor?.processorId || '-'}<br />
                      <strong>Process Date:</strong> {herb.processor?.processingDate ? new Date(herb.processor.processingDate).toLocaleDateString() : '-'}<br />
                      <strong>Method:</strong> {herb.processor?.processingMethod || 'Standard'}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">Shipment Progress</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 d-flex justify-content-between">
                  {['pending','processing','shipped','delivered'].map((s) => (
                    <span key={s} className={`status-badge ${getStatusClass(s)}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  ))}
                </div>
                <ProgressBar now={getProgressValue(order.status)} label={`${getProgressValue(order.status)}%`} />
                <div className="mt-3 text-muted">
                  {order.status === 'pending' && 'Order received. Preparing your herb for processing.'}
                  {order.status === 'processing' && 'Herb is being processed and packaged.'}
                  {order.status === 'shipped' && `In transit${order.trackingNumber ? ` • Tracking #: ${order.trackingNumber}` : ''}`}
                  {order.status === 'delivered' && `Delivered${order.deliveredAt ? ` on ${new Date(order.deliveredAt).toLocaleDateString()}` : ''}`}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Status</h5>
              </Card.Header>
              <Card.Body className="text-center">
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                
                <div className="qr-code-container mt-4">
                  <QRCode 
                    value={generateQRData()} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <p className="mt-3 text-muted">
                  Scan this QR code to verify the authenticity and traceability of your herb.
                </p>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h5 className="mb-0">Estimated Delivery</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  {order.status === 'delivered' ? (
                    <>
                      <strong>Delivered on:</strong><br />
                      {(order.deliveredAt && new Date(order.deliveredAt).toLocaleDateString()) || '-'}
                    </>
                  ) : order.status === 'shipped' ? (
                    <>
                      <strong>Expected delivery:</strong><br />
                      {order.createdAt ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : '-'}
                    </>
                  ) : (
                    <>
                      <strong>Processing time:</strong><br />
                      2-3 business days
                    </>
                  )}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderTracking;