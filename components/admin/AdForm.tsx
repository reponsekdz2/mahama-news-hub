import React, { useState, useEffect, useRef } from 'react';
import { Advertisement } from '../../types.ts';
import { createAd, updateAd } from '../../services/adService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface AdFormProps {
    adToEdit?: Advertisement | null;
    onFormSubmit: () => void;
    onCancel: () => void;
}

const AdForm: React.FC<AdFormProps> = ({ adToEdit, onFormSubmit, onCancel }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        linkUrl: '',
        placement: 'sidebar',
        status: 'active',
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(adToEdit) {
            setFormData({
                title: adToEdit.title,
                linkUrl: adToEdit.linkUrl,
                placement: adToEdit.placement,
                status: adToEdit.status,
            });
            setImagePreview(adToEdit.imageUrl);
        }
    }, [adToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user?.token) return;

        const formPayload = new FormData();
        formPayload.append('title', formData.title);
        formPayload.append('linkUrl', formData.linkUrl);
        formPayload.append('placement', formData.placement);
        formPayload.append('status', formData.status);
        if (image) {
            formPayload.append('image', image);
        } else if (adToEdit?.imageUrl) {
            formPayload.append('imageUrl', adToEdit.imageUrl);
        }
        
        setIsLoading(true);
        setError('');
        try {
            if (adToEdit?.id) {
                await updateAd(adToEdit.id, formPayload, user.token);
            } else {
                await createAd(formPayload, user.token);
            }
            onFormSubmit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save ad.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h2 className="text-xl font-bold">{adToEdit ? 'Edit' : 'Create'} Ad</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div>
                <label className="block text-sm font-medium">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium">Link URL</label>
                <input type="url" name="linkUrl" value={formData.linkUrl} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium">Image</label>
                <div className="mt-2 flex items-center space-x-4">
                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />}
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium">
                        Upload Image
                    </button>
                    <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Placement</label>
                    <select name="placement" value={formData.placement} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm">
                        <option value="sidebar">Sidebar</option>
                        <option value="in-feed">In-Feed</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm">
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                    </select>
                </div>
            </div>


            <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Ad'}
                </button>
            </div>
        </form>
    );
};

export default AdForm;
