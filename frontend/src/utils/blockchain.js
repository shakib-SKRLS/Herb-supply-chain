import Web3 from 'web3';

// Mock blockchain service for herb traceability
class BlockchainService {
  constructor() {
    // Initialize Web3 with a local provider (for demonstration)
    this.web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    this.isConnected = false;
    this.account = null;
    
    // Mock contract data
    this.contractAddress = "0x1234567890123456789012345678901234567890";
    
    // Mock blockchain data storage
    this.herbData = [
      {
        id: "herb001",
        name: "Ashwagandha",
        scientificName: "Withania somnifera",
        farmer: {
          id: "farmer001",
          name: "Ramesh Kumar",
          location: "Uttarakhand, India",
          coordinates: "30.0668° N, 79.0193° E"
        },
        lab: {
          id: "lab001",
          name: "Ayurvedic Research Lab",
          testDate: "2023-05-15",
          qualityScore: 92,
          certificationId: "CERT-ASH-001"
        },
        processor: {
          id: "processor001",
          name: "Herbal Extracts Ltd.",
          processDate: "2023-05-20",
          batchNumber: "BATCH-001",
          expiryDate: "2025-05-20"
        },
        status: "processed",
        transactionHistory: [
          { timestamp: "2023-05-10T10:30:00", action: "harvested", actor: "farmer001", blockHash: "0xabc..." },
          { timestamp: "2023-05-15T14:20:00", action: "tested", actor: "lab001", blockHash: "0xdef..." },
          { timestamp: "2023-05-20T09:15:00", action: "processed", actor: "processor001", blockHash: "0xghi..." }
        ]
      },
      {
        id: "herb002",
        name: "Tulsi",
        scientificName: "Ocimum sanctum",
        farmer: {
          id: "farmer002",
          name: "Suresh Patel",
          location: "Gujarat, India",
          coordinates: "22.2587° N, 71.1924° E"
        },
        lab: {
          id: "lab001",
          name: "Ayurvedic Research Lab",
          testDate: "2023-06-05",
          qualityScore: 95,
          certificationId: "CERT-TUL-002"
        },
        processor: {
          id: "processor001",
          name: "Herbal Extracts Ltd.",
          processDate: "2023-06-10",
          batchNumber: "BATCH-002",
          expiryDate: "2025-06-10"
        },
        status: "shipped",
        transactionHistory: [
          { timestamp: "2023-06-01T08:45:00", action: "harvested", actor: "farmer002", blockHash: "0xjkl..." },
          { timestamp: "2023-06-05T11:30:00", action: "tested", actor: "lab001", blockHash: "0xmno..." },
          { timestamp: "2023-06-10T13:20:00", action: "processed", actor: "processor001", blockHash: "0xpqr..." },
          { timestamp: "2023-06-15T09:00:00", action: "shipped", actor: "processor001", blockHash: "0xstu..." }
        ]
      },
      {
        id: "herb003",
        name: "Brahmi",
        scientificName: "Bacopa monnieri",
        farmer: {
          id: "farmer003",
          name: "Anita Sharma",
          location: "Kerala, India",
          coordinates: "10.8505° N, 76.2711° E"
        },
        lab: {
          id: "lab001",
          name: "Ayurvedic Research Lab",
          testDate: "2023-07-10",
          qualityScore: 88,
          certificationId: "CERT-BRA-003"
        },
        status: "tested",
        transactionHistory: [
          { timestamp: "2023-07-05T10:15:00", action: "harvested", actor: "farmer003", blockHash: "0xvwx..." },
          { timestamp: "2023-07-10T16:40:00", action: "tested", actor: "lab001", blockHash: "0xyz..." }
        ]
      }
    ];
    
    // Mock orders data
    this.orders = [
      {
        id: "order001",
        consumerId: "consumer001",
        herbId: "herb001",
        quantity: 2,
        orderDate: "2023-06-01T14:30:00",
        status: "delivered",
        deliveryDate: "2023-06-10T11:20:00",
        transactionHash: "0xabc123..."
      },
      {
        id: "order002",
        consumerId: "consumer001",
        herbId: "herb002",
        quantity: 1,
        orderDate: "2023-07-05T09:15:00",
        status: "shipped",
        transactionHash: "0xdef456..."
      }
    ];
  }

  // Connect to blockchain
  async connect() {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0];
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Error connecting to blockchain:", error);
      // For demo purposes, we'll still return true
      this.isConnected = true;
      this.account = "0x0000000000000000000000000000000000000000";
      return true;
    }
  }

  // Get all herbs
  async getAllHerbs() {
    await this.simulateBlockchainDelay();
    return this.herbData;
  }

  // Get herb by ID
  async getHerbById(id) {
    await this.simulateBlockchainDelay();
    return this.herbData.find(herb => herb.id === id) || null;
  }

  // Add new herb data (for lab/processor)
  async addHerbData(herbData) {
    await this.simulateBlockchainDelay();
    
    // Generate mock transaction hash
    const txHash = "0x" + Math.random().toString(16).substr(2, 40);
    
    // Add to mock blockchain data
    this.herbData.push({
      ...herbData,
      id: "herb" + (this.herbData.length + 1).toString().padStart(3, '0'),
      transactionHistory: [
        {
          timestamp: new Date().toISOString(),
          action: "created",
          actor: herbData.lab ? herbData.lab.id : (herbData.processor ? herbData.processor.id : "unknown"),
          blockHash: txHash
        }
      ]
    });
    
    return txHash;
  }

  // Update herb data (for lab/processor)
  async updateHerbData(id, updateData) {
    await this.simulateBlockchainDelay();
    
    // Find herb index
    const herbIndex = this.herbData.findIndex(herb => herb.id === id);
    if (herbIndex === -1) return null;
    
    // Generate mock transaction hash
    const txHash = "0x" + Math.random().toString(16).substr(2, 40);
    
    // Update herb data
    this.herbData[herbIndex] = {
      ...this.herbData[herbIndex],
      ...updateData,
      transactionHistory: [
        ...this.herbData[herbIndex].transactionHistory,
        {
          timestamp: new Date().toISOString(),
          action: "updated",
          actor: updateData.lab ? updateData.lab.id : (updateData.processor ? updateData.processor.id : "unknown"),
          blockHash: txHash
        }
      ]
    };
    
    return txHash;
  }

  // Create new order
  async createOrder(orderData) {
    await this.simulateBlockchainDelay();
    
    // Generate mock transaction hash
    const txHash = "0x" + Math.random().toString(16).substr(2, 40);
    
    // Create new order
    const newOrder = {
      ...orderData,
      id: "order" + (this.orders.length + 1).toString().padStart(3, '0'),
      orderDate: new Date().toISOString(),
      status: "processing",
      transactionHash: txHash
    };
    
    // Add to orders
    this.orders.push(newOrder);
    
    return newOrder;
  }

  // Get orders by consumer ID
  async getOrdersByConsumer(consumerId) {
    await this.simulateBlockchainDelay();
    return this.orders.filter(order => order.consumerId === consumerId);
  }

  // Get order by ID
  async getOrderById(id) {
    await this.simulateBlockchainDelay();
    return this.orders.find(order => order.id === id) || null;
  }

  // Simulate blockchain delay
  async simulateBlockchainDelay() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Create and export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;