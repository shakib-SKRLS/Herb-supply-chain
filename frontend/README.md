# 🌿 Herb Traceability System

A comprehensive blockchain-based herb traceability system with QR code verification for lab results, built with React and Bootstrap.

## 🚀 Features

### 🔍 **QR Code Verification Service**
- **Real-time Camera Scanning**: Scan QR codes using device camera
- **Manual Input**: Paste QR code JSON data directly
- **File Upload**: Upload JSON files containing QR data
- **Blockchain Verification**: Validates lab results for authenticity
- **Comprehensive Display**: Shows complete lab test results and traceability data

### 🧪 **Lab Dashboard**
- **Add Herb Details**: Comprehensive form for lab test results
- **Chemical Composition Analysis**: Alkaloids, essential oils, flavonoids, tannins
- **Contaminants Testing**: Pesticides, heavy metals, microbes, aflatoxins
- **Physical Parameters**: Moisture content, ash content, pH, density
- **Quality Assessment**: Quality scoring and pharmacopeia compliance
- **QR Code Generation**: Generate QR codes with complete lab data

### ⚙️ **Processor Dashboard**
- **Process Herb Form**: Detailed processing information
- **Batch Identification**: Processor ID, batch numbers, farmer links
- **Quality & Safety Records**: Processing conditions and safety measures
- **Digital Certificates**: Blockchain signatures and certificates
- **QR Code Generation**: Generate QR codes with processing data

### 👥 **Consumer Dashboard**
- **Order Tracking**: Track herb orders with complete traceability
- **Browse Herbs**: Explore available herbs with quality information
- **QR Verification**: Verify lab results using QR codes
- **Order History**: View past orders and their status

## 🛠️ **Technology Stack**

- **Frontend**: React 18, React Bootstrap, React Router
- **QR Code**: qr-scanner library for camera scanning, qrcode.react for generation
- **Blockchain**: Web3.js for blockchain integration
- **Styling**: Bootstrap 5, Custom CSS animations
- **Icons**: React Icons (Font Awesome)

## 📦 **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/herb-traceability-system.git
   cd herb-traceability-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## 🎯 **Usage**

### **For Consumers**:
1. Login as a consumer
2. Browse available herbs
3. Place orders
4. Use QR verification service to verify lab results
5. Track order status

### **For Lab Technicians**:
1. Login as lab user
2. Add comprehensive herb test results
3. Generate QR codes with lab data
4. View and update existing test results

### **For Processors**:
1. Login as processor
2. Process tested herbs
3. Add processing details and quality records
4. Generate QR codes with processing data

## 🔐 **QR Code Verification Process**

1. **Scan QR Code**: Use camera or manual input
2. **Data Validation**: System validates blockchain hashes and digital signatures
3. **Display Results**: Shows complete traceability information including:
   - Herb information and scientific name
   - Farmer details and location
   - Lab test results and quality scores
   - Processing information (if available)
   - Blockchain verification status

## 📊 **Data Structure**

### **Lab Test Results Include**:
- Sample metadata (lab ID, batch number, collection date)
- Chemical composition analysis
- Contaminants testing results
- Physical parameters measurement
- Quality assessment and scoring
- Digital certificates and blockchain hashes

### **Processing Data Includes**:
- Batch identification and tracking
- Processing information and equipment used
- Quality and safety records
- Digital certificates and blockchain verification
- Additional processing details

## 🌟 **Key Features**

- ✅ **Complete Traceability**: Farm to consumer tracking
- ✅ **QR Code Integration**: Easy verification and data sharing
- ✅ **Blockchain Verification**: Tamper-proof data storage
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Real-time Scanning**: Camera-based QR code scanning
- ✅ **Data Export**: Download verified data as JSON
- ✅ **Comprehensive Forms**: Detailed data collection and validation
- ✅ **User-friendly Interface**: Intuitive navigation and design

## 🔧 **Development**

### **Project Structure**:
```
src/
├── components/
│   ├── consumer/          # Consumer dashboard components
│   ├── lab/              # Lab dashboard components
│   ├── processor/        # Processor dashboard components
│   └── QRVerificationService.js  # QR verification component
├── styles/               # CSS styles
├── utils/
│   └── blockchain.js     # Blockchain service integration
└── App.js               # Main application component
```

### **Available Scripts**:
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Authors**

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 **Acknowledgments**

- React team for the amazing framework
- Bootstrap for the UI components
- QR Scanner library for camera functionality
- Web3.js for blockchain integration

## 📞 **Support**

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for herb traceability and quality assurance**
