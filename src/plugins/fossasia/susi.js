// FOSSASIA SUSI.AI Integration Plugin
// Provides intelligent transaction analysis and categorization using SUSI.AI

import config from '../../config';

class SusiPlugin {
  constructor() {
    this.isEnabled = config.FOSSASIA_ENABLED;
    this.apiUrl = config.SUSI_API_URL;
    this.apiKey = config.SUSI_API_KEY;
    this.sessionId = this.generateSessionId();
    this.conversationHistory = [];
  }

  async initialize() {
    if (!this.isEnabled) {
      console.log('SUSI.AI plugin disabled');
      return false;
    }

    try {
      // Test connection to SUSI.AI
      const testResponse = await this.sendMessage('Hello');
      if (testResponse.success) {
        console.log('SUSI.AI plugin initialized successfully');
        return true;
      } else {
        throw new Error('Failed to connect to SUSI.AI');
      }
    } catch (error) {
      console.error('Failed to initialize SUSI.AI plugin:', error);
      return false;
    }
  }

  // Generate a unique session ID for conversation tracking
  generateSessionId() {
    return 'cleartx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Send a message to SUSI.AI and get response
  async sendMessage(message, context = {}) {
    if (!this.isEnabled) {
      return { success: false, error: 'Plugin disabled' };
    }

    try {
      const requestData = {
        q: message,
        session: this.sessionId,
        ...context
      };

      const response = await fetch(`${this.apiUrl}${config.ENDPOINTS.SUSI}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store conversation history
      this.conversationHistory.push({
        timestamp: Date.now(),
        message,
        response: data,
        context
      });

      return {
        success: true,
        data,
        sessionId: this.sessionId
      };
    } catch (error) {
      console.error('SUSI.AI API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze transaction description and categorize it
  async analyzeTransaction(description, amount, accountType = 'bank') {
    if (!this.isEnabled) {
      return { success: false, error: 'Plugin disabled' };
    }

    try {
      const prompt = `Analyze this transaction: "${description}" with amount ${amount} from ${accountType} account. 
      Please categorize it and provide:
      1. Category (e.g., Food, Transport, Shopping, Bills, Entertainment)
      2. Confidence score (0-100)
      3. Reasoning
      4. Suggested tags
      5. Budget impact assessment`;

      const response = await this.sendMessage(prompt, {
        transaction: { description, amount, accountType },
        analysis_type: 'transaction_categorization'
      });

      if (response.success) {
        return this.parseTransactionAnalysis(response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Transaction analysis failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackCategory(description, amount)
      };
    }
  }

  // Parse SUSI.AI response for transaction analysis
  parseTransactionAnalysis(susiResponse) {
    try {
      // Extract relevant information from SUSI.AI response
      const answer = susiResponse.answers?.[0]?.actions?.[0]?.expression || '';
      
      // Parse the response to extract structured data
      const analysis = {
        category: this.extractCategory(answer),
        confidence: this.extractConfidence(answer),
        reasoning: this.extractReasoning(answer),
        tags: this.extractTags(answer),
        budgetImpact: this.extractBudgetImpact(answer),
        rawResponse: answer
      };

      return {
        success: true,
        analysis,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to parse SUSI.AI response:', error);
      return {
        success: false,
        error: 'Failed to parse response',
        rawResponse: susiResponse
      };
    }
  }

  // Extract category from SUSI.AI response
  extractCategory(response) {
    const categories = [
      'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
      'Healthcare', 'Education', 'Travel', 'Utilities', 'Insurance'
    ];

    for (const category of categories) {
      if (response.toLowerCase().includes(category.toLowerCase())) {
        return category;
      }
    }

    return 'Other';
  }

  // Extract confidence score from response
  extractConfidence(response) {
    const confidenceMatch = response.match(/confidence[:\s]+(\d+)/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]);
    }
    return 75; // Default confidence
  }

  // Extract reasoning from response
  extractReasoning(response) {
    const reasoningMatch = response.match(/reasoning[:\s]+(.+?)(?=\n|$)/i);
    if (reasoningMatch) {
      return reasoningMatch[1].trim();
    }
    return 'Analysis based on transaction description patterns';
  }

  // Extract suggested tags from response
  extractTags(response) {
    const tagsMatch = response.match(/tags[:\s]+(.+?)(?=\n|$)/i);
    if (tagsMatch) {
      return tagsMatch[1].split(',').map(tag => tag.trim());
    }
    return [];
  }

  // Extract budget impact assessment
  extractBudgetImpact(response) {
    const impactMatch = response.match(/budget impact[:\s]+(.+?)(?=\n|$)/i);
    if (impactMatch) {
      return impactMatch[1].trim();
    }
    return 'Moderate impact on monthly budget';
  }

  // Fallback categorization when SUSI.AI is unavailable
  getFallbackCategory(description, amount) {
    const desc = description.toLowerCase();
    const numAmount = parseFloat(amount);

    // Simple rule-based categorization
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('grocery')) {
      return { category: 'Food', confidence: 80, tags: ['food', 'dining'] };
    }
    if (desc.includes('uber') || desc.includes('taxi') || desc.includes('fuel')) {
      return { category: 'Transport', confidence: 85, tags: ['transport', 'commute'] };
    }
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping')) {
      return { category: 'Shopping', confidence: 90, tags: ['shopping', 'online'] };
    }
    if (numAmount > 1000) {
      return { category: 'Bills', confidence: 70, tags: ['bills', 'large-payment'] };
    }

    return { category: 'Other', confidence: 50, tags: ['uncategorized'] };
  }

  // Get spending insights and recommendations
  async getSpendingInsights(transactions, timeRange = 'month') {
    if (!this.isEnabled) {
      return { success: false, error: 'Plugin disabled' };
    }

    try {
      const summary = this.summarizeTransactions(transactions, timeRange);
      const prompt = `Analyze these spending patterns and provide insights:
      Total spent: ${summary.total}
      Top categories: ${summary.topCategories.join(', ')}
      Time period: ${timeRange}
      
      Please provide:
      1. Spending trends analysis
      2. Budget recommendations
      3. Potential savings opportunities
      4. Category-wise insights`;

      const response = await this.sendMessage(prompt, {
        transactions: summary,
        analysis_type: 'spending_insights',
        time_range: timeRange
      });

      if (response.success) {
        return {
          success: true,
          insights: this.parseInsights(response.data),
          summary
        };
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Spending insights failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Summarize transactions for analysis
  summarizeTransactions(transactions, timeRange) {
    const summary = {
      total: 0,
      count: transactions.length,
      categories: {},
      topCategories: [],
      timeRange
    };

    transactions.forEach(tx => {
      summary.total += parseFloat(tx.amount) || 0;
      const category = tx.category || 'Other';
      summary.categories[category] = (summary.categories[category] || 0) + (parseFloat(tx.amount) || 0);
    });

    // Get top 3 categories
    summary.topCategories = Object.entries(summary.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return summary;
  }

  // Parse insights from SUSI.AI response
  parseInsights(susiResponse) {
    try {
      const answer = susiResponse.answers?.[0]?.actions?.[0]?.expression || '';
      
      return {
        trends: this.extractTrends(answer),
        recommendations: this.extractRecommendations(answer),
        savings: this.extractSavings(answer),
        categoryInsights: this.extractCategoryInsights(answer),
        rawResponse: answer
      };
    } catch (error) {
      console.error('Failed to parse insights:', error);
      return {
        trends: 'Unable to analyze trends',
        recommendations: 'Unable to provide recommendations',
        savings: 'Unable to calculate savings',
        categoryInsights: 'Unable to provide category insights'
      };
    }
  }

  // Extract various insights components
  extractTrends(response) {
    const trendsMatch = response.match(/trends[:\s]+(.+?)(?=\n|$)/i);
    return trendsMatch ? trendsMatch[1].trim() : 'Spending patterns analysis unavailable';
  }

  extractRecommendations(response) {
    const recMatch = response.match(/recommendations[:\s]+(.+?)(?=\n|$)/i);
    return recMatch ? recMatch[1].trim() : 'Budget recommendations unavailable';
  }

  extractSavings(response) {
    const savingsMatch = response.match(/savings[:\s]+(.+?)(?=\n|$)/i);
    return savingsMatch ? savingsMatch[1].trim() : 'Savings opportunities unavailable';
  }

  extractCategoryInsights(response) {
    const insightsMatch = response.match(/category insights[:\s]+(.+?)(?=\n|$)/i);
    return insightsMatch ? insightsMatch[1].trim() : 'Category insights unavailable';
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearConversationHistory() {
    this.conversationHistory = [];
    this.sessionId = this.generateSessionId();
  }

  // Get plugin status
  getStatus() {
    return {
      enabled: this.isEnabled,
      connected: this.isEnabled && this.sessionId !== null,
      apiUrl: this.apiUrl,
      sessionId: this.sessionId,
      conversationCount: this.conversationHistory.length
    };
  }
}

// Export singleton instance
const susiPlugin = new SusiPlugin();
export default susiPlugin;

// Export the class for instantiation
export { SusiPlugin as FOSSASIAPlugin };

// Export individual methods for direct use
export const {
  initialize,
  sendMessage,
  analyzeTransaction,
  getSpendingInsights,
  getConversationHistory,
  clearConversationHistory,
  getStatus
} = susiPlugin;
