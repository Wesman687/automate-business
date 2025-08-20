import React, { useState } from 'react';
import SuccessModal from './SuccessModal';

export default function SuccessModalDemo() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">SuccessModal Component Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Success Variant */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Variant</h3>
          <p className="text-gray-600 text-sm mb-4">Use for successful operations and confirmations.</p>
          <button
            onClick={() => setShowSuccessModal(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Show Success
          </button>
        </div>

        {/* Info Variant */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Info Variant</h3>
          <p className="text-gray-600 text-sm mb-4">Use for informational messages and updates.</p>
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show Info
          </button>
        </div>

        {/* Warning Variant */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Warning Variant</h3>
          <p className="text-gray-600 text-sm mb-4">Use for warnings and important notices.</p>
          <button
            onClick={() => setShowWarningModal(true)}
            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Show Warning
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message="Your action was completed successfully. The changes have been saved and applied."
        variant="success"
      />

      {/* Info Modal */}
      <SuccessModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Information"
        message="Your profile has been updated. Some changes may take a few minutes to appear."
        variant="info"
      />

      {/* Warning Modal */}
      <SuccessModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Important Notice"
        message="Your subscription will expire in 7 days. Please renew to maintain access to all features."
        variant="warning"
      />
    </div>
  );
}
