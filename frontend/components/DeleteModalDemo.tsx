import React, { useState } from 'react';
import DeleteModal from './DeleteModal';

export default function DeleteModalDemo() {
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleDelete = () => {
    console.log('Item deleted!');
    setShowDangerModal(false);
    setShowWarningModal(false);
    setShowCustomModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">DeleteModal Component Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Danger Variant */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Variant</h3>
          <p className="text-gray-600 text-sm mb-4">Use for critical deletions that cannot be undone.</p>
          <button
            onClick={() => setShowDangerModal(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Item
          </button>
        </div>

        {/* Warning Variant */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Warning Variant</h3>
          <p className="text-gray-600 text-sm mb-4">Use for less critical deletions or warnings.</p>
          <button
            onClick={() => setShowWarningModal(true)}
            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Archive Item
          </button>
        </div>

        {/* Custom Modal */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Modal</h3>
          <p className="text-gray-600 text-sm mb-4">With custom title, message, and item name.</p>
          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Remove User
          </button>
        </div>
      </div>

      {/* Danger Modal */}
      <DeleteModal
        isOpen={showDangerModal}
        onClose={() => setShowDangerModal(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        itemName="Important Document"
        variant="danger"
      />

      {/* Warning Modal */}
      <DeleteModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={handleDelete}
        title="Archive Item"
        message="This item will be moved to the archive. You can restore it later if needed."
        itemName="Project File"
        variant="warning"
      />

      {/* Custom Modal */}
      <DeleteModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onConfirm={handleDelete}
        title="Remove User Access"
        message="This user will lose access to the system immediately. They can be re-added later if needed."
        itemName="john.doe@company.com"
        variant="danger"
      />
    </div>
  );
}
