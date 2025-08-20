# DeleteModal Component

A professional, reusable confirmation modal for deleting items throughout the application.

## Features

- **Professional Design**: Clean, modern UI with proper spacing and typography
- **Two Variants**: `danger` (red) and `warning` (amber) color schemes
- **Loading States**: Built-in loading indicator during deletion
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper focus management and keyboard navigation
- **Customizable**: Flexible props for different use cases

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | ✅ | - | Controls modal visibility |
| `onClose` | `() => void` | ✅ | - | Function called when modal is closed |
| `onConfirm` | `() => void` | ✅ | - | Function called when delete is confirmed |
| `title` | `string` | ✅ | - | Modal title |
| `message` | `string` | ✅ | - | Main confirmation message |
| `itemName` | `string` | ❌ | - | Name of item being deleted (displayed in info box) |
| `isLoading` | `boolean` | ❌ | `false` | Shows loading state on delete button |
| `variant` | `'danger' \| 'warning'` | ❌ | `'danger'` | Color scheme variant |

## Usage Examples

### Basic Usage

```tsx
import DeleteModal from '@/components/DeleteModal';

function MyComponent() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDelete = () => {
    setShowDeleteModal(true);
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    // Delete logic here
    await deleteItem(itemToDelete.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <button onClick={handleDelete}>Delete Item</button>
      
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        itemName={itemToDelete?.name}
      />
    </>
  );
}
```

### With Loading State

```tsx
const [isDeleting, setIsDeleting] = useState(false);

const confirmDelete = async () => {
  setIsDeleting(true);
  try {
    await deleteItem(itemToDelete.id);
    setShowDeleteModal(false);
  } finally {
    setIsDeleting(false);
  }
};

<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={confirmDelete}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  itemName={itemToDelete?.name}
  isLoading={isDeleting}
/>
```

### Warning Variant

```tsx
<DeleteModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={confirmDelete}
  title="Archive Item"
  message="This item will be moved to the archive. You can restore it later if needed."
  itemName={itemToDelete?.name}
  variant="warning"
/>
```

## Styling

The component uses Tailwind CSS classes and includes:

- **Backdrop**: Semi-transparent black with backdrop blur
- **Modal**: White background with rounded corners and shadow
- **Header**: Colored background based on variant with icon and title
- **Content**: Centered text with optional item name display
- **Actions**: Two buttons (Cancel/Delete) with proper spacing

## Variants

### Danger (Default)
- Red color scheme
- Use for critical deletions that cannot be undone
- Best for: user accounts, important data, permanent removals

### Warning
- Amber/orange color scheme  
- Use for less critical actions or warnings
- Best for: archiving, temporary removals, reversible actions

## Best Practices

1. **Always show item name** when possible to avoid confusion
2. **Use descriptive messages** that explain the consequences
3. **Include loading states** for async operations
4. **Handle errors gracefully** in the onConfirm function
5. **Use appropriate variants** for different types of actions

## Accessibility

- Proper focus management
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Clear action buttons

## Integration

The component is designed to work seamlessly with:
- React state management
- Async operations
- Error handling
- Loading states
- Form validation
