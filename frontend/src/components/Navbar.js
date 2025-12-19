import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLeaf, FaSignOutAlt, FaHome, FaClipboardList, FaShoppingCart, FaFlask, FaIndustry, FaUsers } from 'react-icons/fa';
import '../styles/Navbar.css';

const AppNavbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const getNavLinks = () => {
    if (!user) {
      return (
        <>
          <Nav.Link as={Link} to="/" className="nav-link-animated">
            <FaHome className="nav-icon" /> Home
          </Nav.Link>
          <Nav.Link as={Link} to="/login" className="nav-link-animated">
            <FaSignOutAlt className="nav-icon" /> Login
          </Nav.Link>
        </>
      );
    }

    switch (user.role) {
      case 'consumer':
        return (
          <>
            <Nav.Link as={Link} to="/consumer/dashboard" className={`nav-link-animated ${location.pathname === '/consumer/dashboard' ? 'active' : ''}`}>
              <FaHome className="nav-icon" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/consumer/herb-selection" className={`nav-link-animated ${location.pathname === '/consumer/herb-selection' ? 'active' : ''}`}>
              <FaLeaf className="nav-icon" /> Browse Herbs
            </Nav.Link>
            <Nav.Link as={Link} to="/consumer/order-history" className={`nav-link-animated ${location.pathname === '/consumer/order-history' ? 'active' : ''}`}>
              <FaClipboardList className="nav-icon" /> Order History
            </Nav.Link>
          </>
        );
      case 'lab':
        return (
          <>
            <Nav.Link as={Link} to="/lab/dashboard" className={`nav-link-animated ${location.pathname === '/lab/dashboard' ? 'active' : ''}`}>
              <FaHome className="nav-icon" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/lab/add-herb-details" className={`nav-link-animated ${location.pathname === '/lab/add-herb-details' ? 'active' : ''}`}>
              <FaFlask className="nav-icon" /> Add Herb Details
            </Nav.Link>
          </>
        );
      case 'processor':
        return (
          <>
            <Nav.Link as={Link} to="/processor/dashboard" className={`nav-link-animated ${location.pathname === '/processor/dashboard' ? 'active' : ''}`}>
              <FaHome className="nav-icon" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/processor/process-herb" className={`nav-link-animated ${location.pathname === '/processor/process-herb' ? 'active' : ''}`}>
              <FaIndustry className="nav-icon" /> Process Herb
            </Nav.Link>
            <Nav.Link as={Link} to="/processor/create-herb" className={`nav-link-animated ${location.pathname === '/processor/create-herb' ? 'active' : ''}`}>
              <FaLeaf className="nav-icon" /> Create Herb
            </Nav.Link>
            <Nav.Link as={Link} to="/processor/farmers" className={`nav-link-animated ${location.pathname === '/processor/farmers' ? 'active' : ''}`}>
              <FaUsers className="nav-icon" /> Farmers
            </Nav.Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Nav.Link as={Link} to="/processor/dashboard" className={`nav-link-animated ${location.pathname === '/processor/dashboard' ? 'active' : ''}`}>
              <FaHome className="nav-icon" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/farmers" className={`nav-link-animated ${location.pathname === '/admin/farmers' ? 'active' : ''}`}>
              <FaUsers className="nav-icon" /> Manage Farmers
            </Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Navbar 
      bg="transparent" 
      variant="dark" 
      expand="lg" 
      fixed="top"
      className={`app-navbar ${scrolled ? 'scrolled' : ''}`}
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <FaLeaf className="brand-icon" /> 
          <span className="brand-text">Herb Traceability</span>
          {user && <span className="portal-badge">{user.role}</span>}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" className="navbar-toggler" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {getNavLinks()}
            {user && (
              <Button 
                variant="outline-light" 
                className="logout-btn" 
                onClick={handleLogout}
              >
                <FaSignOutAlt className="nav-icon" /> Logout
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;