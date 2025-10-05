import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Article } from '../../types.ts';
import { useLanguage, CATEGORIES } from '../../contexts/LanguageContext.tsx';
import { createOrUpdatePoll } from '../../services/pollService.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { fetchTags } from '../../services/tagService.ts';

interface ArticleFormProps {
  articleToEdit?: Partial<Article> | null;
  onFormSubmit: (formData: FormData, articleId?: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const FileUploader: React.FC<{
    label: string;
    file: File | null;
    preview: string | null;
    accept: string;
    onFileChange: (file: File | null) => void;
    onPreviewChange: (preview: string | null) => void;
}> = ({ label, file, preview, accept, onFileChange, onPreviewChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            onFileChange(selectedFile);
            onPreviewChange(URL.createObjectURL(selectedFile));
        }
    };
    
    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileChange(null);
        onPreviewChange(null);
        if(inputRef.current) inputRef.current.value = '';
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <div className="file-uploader" onClick={() => inputRef.current?.click()}>
                <input type="file" accept={accept} ref={inputRef} onChange={handleFileChange} className="hidden" />
                {preview ? (
                    <div className="file-uploader-preview">
                        {accept.startsWith('image') ? <img src={preview} alt="Preview" /> : <video src={preview} />}
                        <button type="button" onClick={removeFile} className="file-uploader-remove-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <p className="mt-2 text-sm">Click to upload or drag and drop</p>
                        <p className="text-xs">{accept.startsWith('image') ? 'PNG, JPG, GIF' : 'MP4, MOV'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const ArticleForm: React.FC<ArticleFormProps> = ({ articleToEdit, onFormSubmit, onCancel, isLoading }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES.find(c => c !== 'Top Stories') || 'World');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [isPremium, setIsPremium] = useState(false);
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  // Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  useEffect(() => {
    fetchTags().then(tags => setAllTags(tags.map(t => t.name)));
  }, []);

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      setSummary(articleToEdit.summary || '');
      setContent(articleToEdit.content || '');
      setCategory(articleToEdit.category || CATEGORIES[1]);
      setImagePreview(articleToEdit.imageUrl || null);
      setVideoPreview(articleToEdit.videoUrl || null);
      setStatus(articleToEdit.status || 'published');
      setIsPremium(articleToEdit.isPremium || false);
      setTags((articleToEdit.tags || []).join(', '));
      setMetaTitle(articleToEdit.metaTitle || '');
      setMetaDescription(articleToEdit.metaDescription || '');
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
        setIsPremium(false);
        setTags('');
        setMetaTitle('');
        setMetaDescription('');
        setPollQuestion('');
        setPollOptions(['', '']);
    }
  }, [articleToEdit]);
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTags(value);

    const currentTags = value.split(',').map(t => t.trim().toLowerCase());
    const lastTagFragment = currentTags[currentTags.length - 1];

    if (lastTagFragment) {
        const suggestions = allTags.filter(t =>
            t.toLowerCase().startsWith(lastTagFragment) &&
            !currentTags.slice(0, -1).includes(t.toLowerCase())
        );
        setTagSuggestions(suggestions);
    } else {
        setTagSuggestions([]);
    }
  };

  const addTagSuggestion = (suggestion: string) => {
    const currentTags = tags.split(',').map(t => t.trim());
    currentTags[currentTags.length - 1] = suggestion;
    setTags(currentTags.join(', ') + ', ');
    setTagSuggestions([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('isPremium', String(isPremium));
    formData.append('tags', tags);
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
    
    // The onFormSubmit prop will handle the article creation/update
    // and then we can create/update the poll with the returned article ID.
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
       <div className="flex items-center">
            <input type="checkbox" id="isPremium" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" />
            <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">This is a premium article</label>
        </div>

      <div className="relative">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={handleTagsChange}
          autoComplete="off"
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
        />
         {tagSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                <ul className="max-h-40 overflow-auto">
                    {tagSuggestions.map(tag => (
                        <li key={tag} onMouseDown={() => addTagSuggestion(tag)} className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            {tag}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
        </label>
        <ReactQuill theme="snow" value={content} onChange={setContent} className="mt-1 bg-white dark:bg-gray-700 dark:text-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploader 
            label="Cover Image"
            file={image}
            preview={imagePreview}
            accept="image/*"
            onFileChange={setImage}
            onPreviewChange={setImagePreview}
          />
          <FileUploader 
            label="Cover Video (Optional)"
            file={video}
            preview={videoPreview}
            accept="video/*"
            onFileChange={setVideo}
            onPreviewChange={setVideoPreview}
          />
      </div>
      
       {/* SEO Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">SEO Settings</h3>
        <div className="mt-4 space-y-4">
            <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</label>
                <input type="text" id="metaTitle" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="A concise, SEO-friendly title" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                <p className="text-xs text-gray-500 mt-1">{metaTitle.length} / 60 characters recommended</p>
            </div>
             <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                <textarea id="metaDescription" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="A brief summary for search engine results" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md" />
                <p className="text-xs text-gray-500 mt-1">{metaDescription.length} / 160 characters recommended</p>
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