import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Article } from '../types.ts';
import { useLanguage, CATEGORIES } from '../contexts/LanguageContext.tsx';
import { improveWriting, generateImageIdea } from '../services/aiService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

interface ArticleFormProps {
  articleToEdit?: Partial<Article> | null;
  onFormSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ articleToEdit, onFormSubmit, onCancel, isLoading }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES.find(c => c !== 'Top Stories') || 'World');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [imageIdea, setImageIdea] = useState('');
  const [aiError, setAiError] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      setContent(articleToEdit.content || '');
      setCategory(articleToEdit.category || CATEGORIES[1]);
      setImagePreview(articleToEdit.imageUrl || null);
      setVideoPreview(articleToEdit.videoUrl || null);
    } else {
        setTitle('');
        setContent('');
        setCategory(CATEGORIES[1]);
        setImage(null);
        setVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
    }
  }, [articleToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleImproveWriting = async () => {
    if(!user?.token || !content) return;
    setIsImproving(true);
    setAiError('');
    try {
        const improved = await improveWriting(content, user.token);
        setContent(improved);
    } catch (err) {
        setAiError(err instanceof Error ? err.message : 'Failed to improve text.');
    } finally {
        setIsImproving(false);
    }
  }
  
  const handleGenerateImageIdea = async () => {
      if(!user?.token || !title) return;
      setIsGeneratingIdea(true);
      setAiError('');
      try {
          const idea = await generateImageIdea(title, user.token);
          setImageIdea(idea);
      } catch(err) {
          setAiError(err instanceof Error ? err.message : 'Failed to generate idea.');
      } finally {
          setIsGeneratingIdea(false);
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }
    if (video) {
      formData.append('video', video);
    }
    onFormSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {aiError && <p className="text-red-500 text-sm mb-4">{aiError}</p>}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
        >
          {CATEGORIES.filter(c => c !== 'Top Stories').map(cat => (
            <option key={cat} value={cat}>{t(cat as any)}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </label>
            <button type="button" onClick={handleImproveWriting} disabled={isImproving || !content} className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline disabled:opacity-50 disabled:no-underline">
                {isImproving ? t('generating') : t('improveWriting')}
            </button>
        </div>
        <ReactQuill theme="snow" value={content} onChange={setContent} className="mt-1 bg-white dark:bg-gray-700 dark:text-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cover Image
                </label>
                 <button type="button" onClick={handleGenerateImageIdea} disabled={isGeneratingIdea || !title} className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline disabled:opacity-50 disabled:no-underline">
                    {isGeneratingIdea ? t('generating') : t('generateImageIdea')}
                </button>
            </div>
            {imageIdea && <textarea readOnly value={imageIdea} className="mt-2 w-full text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-900 border dark:border-gray-600" rows={3}/>}
            <div className="mt-2 flex items-center space-x-4">
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-md" />}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </button>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Video (Optional)
            </label>
             <div className="mt-1 flex items-center space-x-4">
              {videoPreview && <video src={videoPreview} className="w-20 h-20 object-cover rounded-md" />}
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {videoPreview ? 'Change Video' : 'Upload Video'}
              </button>
              <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoChange} className="hidden" />
            </div>
          </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-accent-600 text-white rounded-md text-sm font-medium hover:bg-accent-700 disabled:opacity-50 flex items-center"
        >
          {isLoading ? 'Saving...' : (articleToEdit?.id ? 'Update Article' : 'Create Article')}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;