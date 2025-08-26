# UI Consistency & Accessibility Guide

## **Overview**
This guide establishes standardized UI patterns and accessibility standards for all job components to ensure a consistent, professional user experience.

## **Core UI Components**

### **FormField Component**
The foundation for all form inputs with consistent labeling, error handling, and help text.

```tsx
<FormField 
  label="Field Label" 
  name="fieldName" 
  icon={IconComponent}
  required={true}
  error="Error message"
  helpText="Helpful information"
>
  <FormInput />
</FormField>
```

**Features:**
- ✅ Consistent label styling and positioning
- ✅ Icon support for visual context
- ✅ Required field indicators
- ✅ Error message display with ARIA attributes
- ✅ Help text support
- ✅ Proper HTML semantics

### **Form Input Components**

#### **FormInput**
Standardized input fields with consistent styling and behavior.

```tsx
<FormInput
  type="text|email|url|number|date|tel"
  value={value}
  onChange={handleChange}
  placeholder="Placeholder text"
  error="Error message"
  disabled={false}
  min={0}
  max={100}
  step={1}
/>
```

#### **FormTextarea**
Multi-line text input with consistent styling.

```tsx
<FormTextarea
  value={value}
  onChange={handleChange}
  placeholder="Placeholder text"
  rows={3}
  error="Error message"
  disabled={false}
/>
```

#### **FormSelect**
Dropdown selection with consistent styling and options.

```tsx
<FormSelect
  value={value}
  onChange={handleChange}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2', disabled: true }
  ]}
  placeholder="Select an option"
  error="Error message"
  disabled={false}
/>
```

### **Status & Priority Badges**

#### **StatusBadge**
Consistent status indicators with semantic colors.

```tsx
<StatusBadge status="in_progress" />
```

**Supported Statuses:**
- `pending` - Gray
- `planning` - Blue
- `in_progress` - Blue
- `review` - Yellow
- `completed` - Green
- `cancelled` - Red
- `on_hold` - Orange

#### **PriorityBadge**
Consistent priority indicators with semantic colors.

```tsx
<PriorityBadge priority="high" />
```

**Supported Priorities:**
- `low` - Green
- `medium` - Yellow
- `high` - Orange
- `urgent` - Red

## **Accessibility Standards**

### **WCAG 2.1 AA Compliance**

#### **Color Contrast**
- ✅ Text contrast ratio: 4.5:1 minimum
- ✅ Large text contrast ratio: 3:1 minimum
- ✅ Interactive elements: 3:1 minimum

#### **Keyboard Navigation**
- ✅ All interactive elements accessible via keyboard
- ✅ Focus indicators visible and consistent
- ✅ Tab order logical and intuitive

#### **Screen Reader Support**
- ✅ Proper ARIA labels and descriptions
- ✅ Semantic HTML structure
- ✅ Error messages announced to screen readers
- ✅ Form field associations

#### **Form Accessibility**
- ✅ Labels associated with form controls
- ✅ Error messages linked to form fields
- ✅ Required field indicators
- ✅ Help text for complex fields

### **Implementation Examples**

#### **Accessible Form Field**
```tsx
<FormField 
  label="Email Address" 
  name="email" 
  required 
  error={emailError}
  helpText="We'll use this for project updates"
>
  <FormInput
    type="email"
    value={email}
    onChange={setEmail}
    placeholder="Enter your email"
    error={emailError}
  />
</FormField>
```

#### **Accessible Status Display**
```tsx
// View mode
<StatusBadge status={job.status} />

// Edit mode
<FormField label="Status" name="status">
  <FormSelect
    value={status}
    onChange={setStatus}
    options={statusOptions}
    placeholder="Select status"
  />
</FormField>
```

## **Responsive Design Patterns**

### **Grid Layouts**
```tsx
// Standard grid for form fields
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <FormField>...</FormField>
  <FormField>...</FormField>
</div>

// Full-width fields
<FormField className="md:col-span-2">...</FormField>
```

### **Mobile-First Approach**
- ✅ Single column layout on mobile
- ✅ Two column layout on medium screens and up
- ✅ Touch-friendly input sizes (minimum 44px)
- ✅ Adequate spacing between elements

### **Breakpoint Strategy**
```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
```

## **Color System**

### **Primary Colors**
- **Blue**: `text-blue-600` - Primary actions, links
- **Green**: `text-green-600` - Success states, completed items
- **Red**: `text-red-600` - Error states, destructive actions
- **Yellow**: `text-yellow-600` - Warning states, pending items
- **Orange**: `text-orange-600` - High priority, urgent items

### **Status Colors**
- **Success**: `bg-green-100 text-green-800 border-green-200`
- **Info**: `bg-blue-100 text-blue-800 border-blue-200`
- **Warning**: `bg-yellow-100 text-yellow-800 border-yellow-200`
- **Error**: `bg-red-100 text-red-800 border-red-200`
- **Neutral**: `bg-gray-100 text-gray-800 border-gray-200`

## **Typography Standards**

### **Headings**
- **H1**: `text-3xl font-bold` - Page titles
- **H2**: `text-2xl font-semibold` - Section headers
- **H3**: `text-xl font-semibold` - Component headers
- **H4**: `text-lg font-medium` - Subsection headers

### **Body Text**
- **Default**: `text-base` - Regular content
- **Small**: `text-sm` - Captions, help text
- **Large**: `text-lg` - Important content

### **Form Labels**
- **Standard**: `text-sm font-medium text-gray-700`
- **Required**: `text-sm font-medium text-gray-700` + red asterisk

## **Spacing Standards**

### **Component Spacing**
```tsx
// Standard component container
<div className="space-y-6">  // 24px between sections
  <div className="space-y-4">  // 16px between items
    <FormField>...</FormField>
  </div>
</div>

// Form grid spacing
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">  // 24px between columns
  <FormField>...</FormField>
</FormField>
```

### **Field Spacing**
- **Label to Input**: `mb-2` (8px)
- **Input to Help Text**: `mt-1` (4px)
- **Input to Error**: `mt-1` (4px)
- **Field to Field**: `space-y-6` (24px)

## **Animation & Transitions**

### **Hover States**
```css
/* Button hover */
hover:bg-blue-700 hover:shadow-md transition-all duration-200

/* Input focus */
focus:ring-2 focus:ring-blue-500 transition-colors duration-200

/* Status changes */
transition-all duration-300
```

### **Loading States**
- ✅ Skeleton loaders for content
- ✅ Spinner indicators for actions
- ✅ Disabled states during processing
- ✅ Progress indicators for long operations

## **Error Handling Patterns**

### **Field-Level Errors**
```tsx
<FormField 
  label="Email" 
  name="email" 
  error={emailError}
>
  <FormInput
    type="email"
    value={email}
    onChange={setEmail}
    error={emailError}
  />
</FormField>
```

### **Form-Level Errors**
```tsx
{formError && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
    <div className="flex">
      <ExclamationCircle className="w-5 h-5 text-red-400" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          There was an error with your submission
        </h3>
        <div className="mt-2 text-sm text-red-700">
          {formError}
        </div>
      </div>
    </div>
  </div>
)}
```

## **Success States**

### **Form Submission Success**
```tsx
{showSuccess && (
  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
    <div className="flex">
      <CheckCircle className="w-5 h-5 text-green-400" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-green-800">
          Successfully saved!
        </h3>
        <div className="mt-2 text-sm text-green-700">
          Your changes have been saved.
        </div>
      </div>
    </div>
  </div>
)}
```

## **Implementation Checklist**

### **For Each Component**
- [ ] Uses standardized FormField wrapper
- [ ] Implements proper error handling
- [ ] Includes help text where appropriate
- [ ] Uses consistent spacing patterns
- [ ] Implements responsive design
- [ ] Includes proper ARIA attributes
- [ ] Uses semantic color system
- [ ] Implements loading states
- [ ] Includes success feedback

### **For Each Form**
- [ ] All fields have proper labels
- [ ] Required fields are marked
- [ ] Error messages are clear and helpful
- [ ] Success states provide feedback
- [ ] Keyboard navigation works properly
- [ ] Screen reader compatibility verified

## **Testing Guidelines**

### **Accessibility Testing**
- ✅ Color contrast ratio verification
- ✅ Keyboard navigation testing
- ✅ Screen reader compatibility
- ✅ Focus management testing
- ✅ ARIA attribute validation

### **Responsive Testing**
- ✅ Mobile device testing
- ✅ Tablet device testing
- ✅ Desktop testing
- ✅ Cross-browser compatibility
- ✅ Touch device interaction

### **User Experience Testing**
- ✅ Form validation testing
- ✅ Error handling verification
- ✅ Success state confirmation
- ✅ Loading state testing
- ✅ Performance optimization

## **Migration Guide**

### **From Legacy Components**
1. Replace custom input wrappers with FormField
2. Update input components to use FormInput/FormTextarea/FormSelect
3. Replace custom status displays with StatusBadge/PriorityBadge
4. Update spacing to use standardized classes
5. Implement consistent error handling
6. Add proper accessibility attributes

### **Example Migration**
```tsx
// Before (Legacy)
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Job Title
  </label>
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

// After (Standardized)
<FormField label="Job Title" name="title" icon={Target} required>
  <FormInput
    type="text"
    value={title}
    onChange={setTitle}
    placeholder="Enter job title"
  />
</FormField>
```

This guide ensures all job components maintain consistent, professional appearance while providing excellent accessibility and user experience.
