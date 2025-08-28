import React, { useState } from 'react';
import { useCredits } from '../../hooks/useCredits';
import { TransactionType } from '@/types';

interface CreditsDashboardProps {
  className?: string;
}

export const CreditsDashboard: React.FC<CreditsDashboardProps> = ({ className = '' }) => {
  const {
    balance,
    summary,
    transactionHistory,
    isLoading,
    error,
    refreshBalance,
    refreshSummary,
    refreshTransactionHistory,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize
  } = useCredits();

  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case TransactionType.SERVICE:
        return 'Service Usage';
      case TransactionType.SUBSCRIPTION:
        return 'Subscription';
      case TransactionType.ADMIN:
        return 'Admin Action';
      case TransactionType.DISPUTE:
        return 'Dispute';
      case TransactionType.PURCHASE:
        return 'Purchase';
      default:
        return type;
    }
  };

  const getTransactionAmountDisplay = (transaction: any) => {
    const isCredit = transaction.amount > 0;
    const amount = Math.abs(transaction.amount);
    const sign = isCredit ? '+' : '-';
    const color = isCredit ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={color}>
        {sign}{formatCredits(amount)} credits
      </span>
    );
  };

  if (isLoading && !balance) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-32 rounded-lg mb-6"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error && !balance) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading credits</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => {
            refreshBalance();
            refreshSummary();
          }}
          className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Credit Balance Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Credit Balance</h2>
          <button
            onClick={refreshBalance}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatCredits(balance.current_credits)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Available Credits</div>
              <div className="text-xs text-gray-500 mt-1">
                ≈ {formatCurrency(balance.current_credits * 0.10)}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                balance.credit_status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {balance.credit_status.charAt(0).toUpperCase() + balance.credit_status.slice(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Account Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {balance.subscription ? balance.subscription.package.name : 'No Plan'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Current Plan</div>
              {balance.next_billing_date && (
                <div className="text-xs text-gray-500 mt-1">
                  Next billing: {new Date(balance.next_billing_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Credit Summary Card */}
      {summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCredits(summary.monthly_credits_added)}
              </div>
              <div className="text-sm text-green-700">Credits Added</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCredits(summary.monthly_credits_spent)}
              </div>
              <div className="text-sm text-red-700">Credits Spent</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                summary.monthly_net_change >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {summary.monthly_net_change >= 0 ? '+' : ''}{formatCredits(summary.monthly_net_change)}
              </div>
              <div className="text-sm text-blue-700">Net Change</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.estimated_monthly_cost)}
              </div>
              <div className="text-sm text-purple-700">Est. Monthly Cost</div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTransactionType}
              onChange={(e) => setSelectedTransactionType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value={TransactionType.SERVICE}>Service Usage</option>
              <option value={TransactionType.SUBSCRIPTION}>Subscription</option>
              <option value={TransactionType.ADMIN}>Admin Action</option>
              <option value={TransactionType.DISPUTE}>Dispute</option>
              <option value={TransactionType.PURCHASE}>Purchase</option>
            </select>
            
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {transactionHistory && transactionHistory.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionHistory.transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTransactionTypeLabel(transaction.transaction_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {getTransactionAmountDisplay(transaction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.dollar_amount ? formatCurrency(transaction.dollar_amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {isLoading ? 'Loading transactions...' : 'No transactions found'}
          </div>
        )}

        {/* Pagination */}
        {transactionHistory && transactionHistory.total_count > pageSize && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, transactionHistory.total_count)} of{' '}
              {transactionHistory.total_count} results
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(transactionHistory.total_count / pageSize)}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(transactionHistory.total_count / pageSize)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            Purchase Credits
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
            View Plans
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
            Submit Dispute
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
