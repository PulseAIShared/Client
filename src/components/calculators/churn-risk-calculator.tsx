import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';

interface ChurnCalculatorInputs {
  totalSubscribers: number;
  annualRecurringRevenue: number;
  monthlyChurnRate: number;
}

interface ChurnCalculatorResults {
  monthlyLostCustomers: number;
  saveableCustomersPercentage: number;
  potentialARRSavings: number;
  averageCustomerValue: number;
}

export const ChurnRiskCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<ChurnCalculatorInputs>({
    totalSubscribers: 0,
    annualRecurringRevenue: 0,
    monthlyChurnRate: 0,
  });
  
  const [results, setResults] = useState<ChurnCalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { openWaitlistModal } = useWaitlistModal();

  const calculateChurnRisk = () => {
    if (!inputs.totalSubscribers || !inputs.annualRecurringRevenue || !inputs.monthlyChurnRate) {
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const averageCustomerValue = inputs.annualRecurringRevenue / inputs.totalSubscribers;
      const monthlyLostCustomers = Math.round((inputs.totalSubscribers * inputs.monthlyChurnRate) / 100);
      const saveableCustomersPercentage = 30; // More realistic: we can save 30% of churning customers
      const saveableCustomers = Math.round(monthlyLostCustomers * (saveableCustomersPercentage / 100));
      
      // Calculate annual ARR savings: monthly saved customers × 12 months × annual customer value
      // This represents the total yearly revenue impact of saving customers each month
      const potentialARRSavings = saveableCustomers * 12 * averageCustomerValue;

      setResults({
        monthlyLostCustomers,
        saveableCustomersPercentage,
        potentialARRSavings,
        averageCustomerValue,
      });
      
      setIsCalculating(false);
    }, 800);
  };

  const handleInputChange = (field: keyof ChurnCalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
    setResults(null); // Clear results when inputs change
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="max-w-4xl mx-auto">
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-surface-primary rounded-2xl shadow-xl border border-border-primary overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-900 p-8 text-white">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold mb-2"
          >
            Churn Risk Calculator
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg opacity-90"
          >
            Discover how much revenue you're losing to churn and what you could save
          </motion.p>
        </div>

        <div className="p-8">
          {/* Input Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-text-primary">
                Total Subscribers/Customers
              </label>
              <input
                type="number"
                placeholder="e.g., 1,000"
                value={inputs.totalSubscribers || ''}
                onChange={(e) => handleInputChange('totalSubscribers', e.target.value)}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent text-text-primary placeholder-text-muted transition-all duration-200"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-text-primary">
                Annual Recurring Revenue (ARR)
              </label>
              <input
                type="number"
                placeholder="e.g., 1,200,000"
                value={inputs.annualRecurringRevenue || ''}
                onChange={(e) => handleInputChange('annualRecurringRevenue', e.target.value)}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent text-text-primary placeholder-text-muted transition-all duration-200"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-text-primary">
                Monthly Churn Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 5.2"
                value={inputs.monthlyChurnRate || ''}
                onChange={(e) => handleInputChange('monthlyChurnRate', e.target.value)}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent text-text-primary placeholder-text-muted transition-all duration-200"
              />
            </motion.div>
          </div>

          {/* Calculate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center mb-8"
          >
            <button
              onClick={calculateChurnRisk}
              disabled={isCalculating || !inputs.totalSubscribers || !inputs.annualRecurringRevenue || !inputs.monthlyChurnRate}
              className="px-8 py-4 bg-accent-primary hover:bg-accent-secondary disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                'Calculate Churn Risk'
              )}
            </button>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="bg-bg-secondary rounded-xl p-6 border border-border-primary"
              >
                <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                  Your Churn Risk Analysis
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-surface-primary rounded-lg p-4 border border-border-primary"
                  >
                    <div className="text-error text-2xl font-bold">
                      {formatNumber(results.monthlyLostCustomers)}
                    </div>
                    <div className="text-text-muted text-sm">
                      Customers Lost Monthly
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-surface-primary rounded-lg p-4 border border-border-primary"
                  >
                    <div className="text-success text-2xl font-bold">
                      {results.saveableCustomersPercentage}%
                    </div>
                    <div className="text-text-muted text-sm">
                      Saveable Customers
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-surface-primary rounded-lg p-4 border border-border-primary"
                  >
                    <div className="text-accent-primary text-2xl font-bold">
                      {formatCurrency(results.potentialARRSavings)}
                    </div>
                    <div className="text-text-muted text-sm">
                      Annual Revenue Savings
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-surface-primary rounded-lg p-4 border border-border-primary"
                  >
                    <div className="text-info text-2xl font-bold">
                      {formatCurrency(results.averageCustomerValue)}
                    </div>
                    <div className="text-text-muted text-sm">
                      Average Customer Value (Annual)
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                >
                  <p className="text-text-primary text-center mb-4">
                    <span className="font-semibold">PulseLTV could help you save {formatCurrency(results.potentialARRSavings)} annually</span>
                    <br />
                    <span className="text-text-muted">by reducing churn through predictive analytics and targeted retention campaigns.</span>
                  </p>
                  <div className="text-center">
                    <button 
                      onClick={() => openWaitlistModal('churn-calculator-result')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Join Waiting List
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};