# Modal Components

This folder contains all standardized modal components for the Stream-line AI Automate platform. These components provide a consistent, professional user experience and should be used instead of browser alerts.

## 🚫 Never Use Browser Alerts

**CRITICAL**: Never use `alert()`, `confirm()`, or `prompt()` in this application. These are unprofessional and break the user experience.

## 📁 Available Components

### 1. SuccessModal
- **Purpose**: Success messages, information, and warnings
- **Variants**: `success` (green), `info` (blue), `warning` (amber)
- **Use for**: Form submissions, updates, confirmations, notices

### 2. DeleteModal  
- **Purpose**: Confirmation dialogs for destructive actions
- **Variants**: `danger` (red), `warning` (amber)
- **Use for**: Delete confirmations, destructive operations

### 3. ErrorModal
- **Purpose**: Error messages and notifications
- **Types**: `error`, `warning`, `success`, `info`
- **Use for**: Error handling, validation messages, system notifications

## 🔧 Usage Pattern

### Standard State Management
```tsx
const [showModal, setShowModal] = useState(false);
const [modalMessage, setModalMessage] = useState('');

const handleSuccess = (message: string) => {
  setModalMessage(message);
  setShowModal(true);
};

// Replace alert calls
// Before: alert('Success message');
// After: handleSuccess('Success message');
```

### Import Pattern
```tsx
// Import individual components
import { SuccessModal, DeleteModal, ErrorModal } from '@/components/modals';

// Or import from index
import { SuccessModal } from '@/components/modals';
```

## 📝 Examples

### Success Modal
```tsx
<SuccessModal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  title="Success!"
  message="Your action was completed successfully."
  variant="success"
/>
```

### Delete Confirmation
```tsx
<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  itemName={itemToDelete?.name}
  variant="danger"
/>
```

### Error Message
```tsx
<ErrorModal
  isOpen={showErrorModal}
  onClose={() => setShowErrorModal(false)}
  title="Error"
  message="Something went wrong. Please try again."
  type="error"
/>
```

## 🎨 Design Principles

- **Consistent**: All modals follow the same design language
- **Professional**: Clean, modern UI with proper spacing
- **Accessible**: Keyboard navigation, screen reader support
- **Responsive**: Works on all screen sizes
- **Branded**: Uses project color scheme and styling

## 🔄 Migration from Alerts

### Step 1: Add State
```tsx
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
```

### Step 2: Replace Alert
```tsx
// Before
alert('Customer information updated successfully!');

// After  
setSuccessMessage('Customer information updated successfully!');
setShowSuccessModal(true);
```

### Step 3: Add Modal
```tsx
<SuccessModal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  title="Success!"
  message={successMessage}
  variant="success"
/>
```

## 📋 Best Practices

1. **Use descriptive titles** that clearly indicate the message type
2. **Write clear messages** that explain what happened
3. **Choose appropriate variants/types** for different scenarios
4. **Keep messages concise** but informative
5. **Use consistent language** across the application
6. **Handle modal state properly** with useEffect cleanup if needed

## 🧪 Testing

- Test all modal interactions (open, close, confirm, cancel)
- Verify keyboard navigation (Tab, Enter, Escape)
- Test screen reader compatibility
- Verify consistent styling across different modal types
- Test responsive behavior on different screen sizes

## 🔗 Related Files

- `ai_docs/cursorrules` - Modal usage rules
- `ai_docs/tasks/modal-cleanup-standardization-task.md` - Cleanup task
- `ai_docs/instructions.md` - UX conventions

## 📚 Component Documentation

- [SuccessModal](./SuccessModal.md) - Detailed usage and examples
- [DeleteModal](./DeleteModal.md) - Confirmation dialog guide
- [ErrorModal](./ErrorModal.tsx) - Error handling patterns
