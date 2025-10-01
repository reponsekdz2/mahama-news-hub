import React, { useState, useEffect, useRef } from 'react';
import { Advertisement } from '../../types.ts';

interface AdFormProps {
  adToEdit?: Partial<Advertisement> | null;
  onFormSubmit: (formData: FormData) => void;
  onClose: () => void;
  isLoading: boolean;
}

const AdForm: React.FC<AdFormProps> = ({ adToEdit, onFormSubmit, onClose, isLoading }) => {
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adToEdit) {
      setTitle(adToEdit.title || '');
      setLinkUrl(adToEdit.linkUrl || '');
      setStatus(adToEdit.status || 'active');
      setImagePreview(adToEdit.imageUrl || null);
    }
  }, [adToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('linkUrl', linkUrl);
    formData.append('status', status);
    if (image) {
      formData.append('image', image);
    }
    onFormSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{adToEdit ? 'Edit Ad' : 'Create New Ad'}</h2>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link URL</label>
                    <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Image</label>
                    <div className="mt-2 flex items-center space-x-4">
                        {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />}
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                           {imagePreview ? 'Change Image' : 'Upload Image'}
                        </button>
                        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                    {isLoading ? 'Saving...' : (adToEdit ? 'Update Ad' : 'Create Ad')}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AdForm;
