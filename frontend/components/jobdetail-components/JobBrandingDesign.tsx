'use client';

import React, { useCallback } from 'react';
import { Palette, Target, FileText } from 'lucide-react';
import { Job } from '../interfaces/job';
import { FormField, FormInput, FormSelect, FormTextarea } from '../ui';

interface JobBrandingDesignProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
}

export default function JobBrandingDesign({ data, isEditing, editData, setEditData }: JobBrandingDesignProps) {
  const handleInputChange = useCallback((field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  }, [editData, setEditData]);

  const brandStyles = [
    { value: 'Modern & Minimalist', label: 'Modern & Minimalist' },
    { value: 'Classic & Traditional', label: 'Classic & Traditional' },
    { value: 'Bold & Dynamic', label: 'Bold & Dynamic' },
    { value: 'Elegant & Sophisticated', label: 'Elegant & Sophisticated' },
    { value: 'Playful & Creative', label: 'Playful & Creative' },
    { value: 'Professional & Corporate', label: 'Professional & Corporate' },
    { value: 'Artistic & Expressive', label: 'Artistic & Expressive' },
    { value: 'Other', label: 'Other' }
  ];

  const predefinedColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#000000',
    '#FFFFFF', '#808080', '#C0C0C0', '#FFD700', '#32CD32', '#FF69B4'
  ];

  const addColor = () => {
    const newColors = [...(editData.brand_colors || []), '#000000'];
    handleInputChange('brand_colors', newColors);
  };

  const removeColor = (index: number) => {
    const newColors = (editData.brand_colors || []).filter((_: any, i: number) => i !== index);
    handleInputChange('brand_colors', newColors);
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...(editData.brand_colors || [])];
    newColors[index] = color;
    handleInputChange('brand_colors', newColors);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Palette className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-900">Branding & Design</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Style */}
        <FormField label="Brand Style" name="brand_style" icon={Palette}>
          {isEditing ? (
            <div className="space-y-3">
              <FormSelect
                value={editData.brand_style || ''}
                onChange={(value) => handleInputChange('brand_style', value)}
                options={brandStyles}
                placeholder="Select brand style"
              />
              {editData.brand_style === 'Other' && (
                <FormInput
                  type="text"
                  value={editData.brand_style_other || ''}
                  onChange={(value) => handleInputChange('brand_style_other', value)}
                  placeholder="Describe brand style"
                />
              )}
            </div>
          ) : (
            <p className="text-gray-900">
              {data.brand_style === 'Other' && data.brand_style_other 
                ? data.brand_style_other 
                : data.brand_style || 'Not specified'
              }
            </p>
          )}
        </FormField>

        {/* Logo Files Count */}
        <FormField label="Logo Files" name="logo_files" icon={FileText}>
          <p className="text-gray-900">
            {data.logo_files && data.logo_files.length > 0 
              ? `${data.logo_files.length} file(s) uploaded`
              : 'No logo files uploaded'
            }
          </p>
        </FormField>

        {/* Brand Colors */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Colors
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(editData.brand_colors || []).map((color: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => removeColor(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addColor}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
              >
                + Add Color
              </button>
              <div className="text-xs text-gray-500">
                Click on a color to change it, or use the × button to remove it.
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.brand_colors && data.brand_colors.length > 0 ? (
                data.brand_colors.map((color: string, index: number) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))
              ) : (
                <p className="text-gray-500">No brand colors specified</p>
              )}
            </div>
          )}
        </div>

        {/* Brand Guidelines */}
        <FormField label="Brand Guidelines" name="brand_guidelines" icon={Target} className="md:col-span-2">
          {isEditing ? (
            <FormTextarea
              value={editData.brand_guidelines || ''}
              onChange={(value) => handleInputChange('brand_guidelines', value)}
              placeholder="Describe brand guidelines, tone of voice, personality, etc..."
              rows={4}
            />
          ) : (
            <p className="text-gray-900">{data.brand_guidelines || 'No brand guidelines specified'}</p>
          )}
        </FormField>

        {/* Brand Summary */}
        <div className="md:col-span-2">
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-pink-700">Brand Summary</span>
            </div>
            <div className="text-sm text-pink-800 space-y-1">
              {data.brand_style && (
                <p><strong>Style:</strong> {data.brand_style === 'Other' && data.brand_style_other ? data.brand_style_other : data.brand_style}</p>
              )}
              {data.brand_colors && data.brand_colors.length > 0 && (
                <p><strong>Colors:</strong> {data.brand_colors.length} color(s) defined</p>
              )}
              {data.logo_files && data.logo_files.length > 0 && (
                <p><strong>Assets:</strong> {data.logo_files.length} logo file(s) uploaded</p>
              )}
              {data.brand_guidelines && (
                <p><strong>Guidelines:</strong> {data.brand_guidelines.length > 100 ? `${data.brand_guidelines.substring(0, 100)}...` : data.brand_guidelines}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
