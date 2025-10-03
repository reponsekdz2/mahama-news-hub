import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Article } from '../../types.ts';
import { useLanguage, CATEGORIES } from '../../contexts/LanguageContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface ArticleFormProps {
  articleToEdit?: Partial<Article> | null;
  onFormSubmit: (formData: FormData, articleId?: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ articleToEdit, onFormSubmit, onCancel, isLoading }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES.find(c => c !== 'Top Stories') || 'World');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [tags, setTags] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  // Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      setSummary(articleToEdit.summary || '');
      setContent(articleToEdit.content || '');
      setCategory(articleToEdit.category || CATEGORIES[1]);
      setImagePreview(articleToEdit.imageUrl || null);
      setVideoPreview(articleToEdit.videoUrl || null);
      setStatus(articleToEdit.status || 'published');
      setTags((articleToEdit.tags || []).join(', '));
      setIsPremium(articleToEdit.isPremium || false);
      setMetaTitle(articleToEdit.meta_title || '');
      setMetaDescription(articleToEdit.meta_description || '');
      setPollQuestion(articleToEdit.poll?.question || '');
      setPollOptions(articleToEdit.poll?.options?.map(opt => opt.option_text) || ['', '']);
    } else {
        setTitle('');
        setSummary('');
        setContent('');
        setCategory(CATEGORIES[1]);
        setImage(null);
        setVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
        setStatus('published');
        setTags('');
        setIsPremium(false);
        setMetaTitle('');
        setMetaDescription('');
        setPollQuestion('');
        setPollOptions(['', '']);
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

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  
  const addPollOption = () => {
      if (pollOptions.length < 10) {
          setPollOptions([...pollOptions, '']);
      }
  };

  const removePollOption = (index: number) => {
      if (pollOptions.length > 2) {
          setPollOptions(pollOptions.filter((_, i) => i !== index));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('tags', tags);
    formData.append('isPremium', String(isPremium));
    formData.append('metaTitle', metaTitle);
    formData.append('metaDescription', metaDescription);
    if (image) {
      formData.append('image', image);
    } else if (articleToEdit?.imageUrl) {
      formData.append('imageUrl', articleToEdit.imageUrl);
    }
    if (video) {
      formData.append('video', video);
    } else if (articleToEdit?.videoUrl) {
        formData.append('videoUrl', articleToEdit.videoUrl);
    }
    
    // Add poll data
    if (pollQuestion.trim() && pollOptions.every(opt => opt.trim())) {
        formData.append('pollQuestion', pollQuestion);
        pollOptions.forEach(opt => formData.append('pollOptions[]', opt));
    }
    
    onFormSubmit(formData, articleToEdit?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('summary')}
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
            </label>
            <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
            >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
            </select>
        </div>
      </div>
       <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border dark:border-gray-700">
            <div>
                 <label htmlFor="isPremium" className="font-medium text-gray-700 dark:text-gray-300">
                  Premium Content
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Subscribers only. Users will be shown a paywall.</p>
            </div>
            <input
              id="isPremium"
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
            />
        </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
        </label>
        <ReactQuill theme="snow" value={content} onChange={setContent} className="mt-1 bg-white dark:bg-gray-700 dark:text-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Image
            </label>
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
      
      {/* Poll Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Interactive Poll (Optional)</h3>
        <div className="mt-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poll Question</label>
                <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="E.g., What do you think?" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
            </div>
            {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <input type="text" value={option} onChange={e => handlePollOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                    <button type="button" onClick={() => removePollOption(index)} disabled={pollOptions.length <= 2} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:hover:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            ))}
            <button type="button" onClick={addPollOption} disabled={pollOptions.length >= 10} className="text-sm font-medium text-accent-600 hover:text-accent-800 disabled:opacity-50">+ Add Option</button>
        </div>
      </div>
      
       {/* SEO Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">SEO Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize how this article appears on search engines.</p>
        <div className="space-y-4">
            <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</label>
                <input id="metaTitle" type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="A concise, SEO-friendly title (50-60 characters)" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
            </div>
             <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                <textarea id="metaDescription" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} placeholder="A short description for search results (150-160 characters)" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
            </div>
        </div>
      </div>


      <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700 mt-6">
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