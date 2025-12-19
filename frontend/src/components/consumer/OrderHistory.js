import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Navbar, Nav, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders');
        // res: { success, count, data }
        const orderList = (res?.data || []).map((o) => ({
          _id: o._id,
          status: o.status,
          createdAt: o.createdAt,
          items: o.items || [],
          trackingNumber: o.trackingNumber,
        }));
        setOrders(orderList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

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
            <h2 className="dashboard-title">Order History</h2>
            <p className="text-muted">View and track all your previous herb orders</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={3}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Filter Orders</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Orders</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
            
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Orders:</span>
                  <strong>{orders.length}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Processing:</span>
                  <strong>{orders.filter(order => order.status === 'processing').length}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipped:</span>
                  <strong>{orders.filter(order => order.status === 'shipped').length}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivered:</span>
                  <strong>{orders.filter(order => order.status === 'delivered').length}</strong>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Your Orders</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <p className="text-center">Loading your orders...</p>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-center">No orders found with the selected filter.</p>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Herb</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Tracking</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => {
                        const firstItem = order.items && order.items[0];
                        const herbName = firstItem?.herb?.name || 'Herb';
                        const created = order.createdAt ? new Date(order.createdAt) : null;
                        return (
                        <tr key={order._id}>
                          <td>#{String(order._id).substring(0, 8)}</td>
                          <td>{herbName}</td>
                          <td>{created ? created.toLocaleDateString() : '-'}</td>
                          <td>
                            <Badge className={`status-badge ${getStatusClass(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </td>
                          <td>{order.trackingNumber || '-'}</td>
                          <td>
                            <Link 
                              to={`/consumer/order-tracking/${order._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderHistory;