import React, { useEffect, useState } from 'react';
import { Article } from '../types.ts';
import { recordView } from '../services/articleService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSettings } from '../contexts/SettingsContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import CommentsSection from './CommentsSection.tsx';
import RelatedArticles from './RelatedArticles.tsx';
import ArticleActions from './ArticleActions.tsx';
import Poll from './Poll.tsx';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onReadAnother: (article: Article) => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, onReadAnother }) => {
  const { user } = useAuth();
  const { fontSize, lineHeight } = useSettings();
  const { t } = useLanguage();
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Record the view when the modal opens
    recordView(article.id, user?.token);

    // Update document title and meta description for SEO
    document.title = article.metaTitle || article.title;
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) {
      metaDesc.setAttribute('content', article.metaDescription || article.summary);
    }
    
    const scrollContainer = document.querySelector('.article-content-scroll');
    if (!scrollContainer) return;

    const handleScroll = () => {
        const scrollableHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const currentProgress = (scrollContainer.scrollTop / scrollableHeight) * 100;
        setProgress(currentProgress > 100 ? 100 : currentProgress);
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    // Reset scroll position on article change
    scrollContainer.scrollTo(0, 0);
    
    return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        // Resetting title/meta is handled by App component on close
    };

  }, [article, user?.token]);
  
  const contentStyle = {
      fontSize: 'var(--font-size-base)',
      lineHeight: 'var(--line-height-base)',
  };

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-40 animate-fadeIn article-content-scroll" style={{overflowY: 'scroll'}}>
       <div
          className="fixed top-0 left-0 h-1 bg-accent-500 transition-all duration-150 z-50"
          style={{ width: `${progress}%` }}
        />
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isReaderMode ? 'reader-mode' : ''}`}>
        <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="text-accent-500 dark:text-accent-400 hover:underline font-semibold text-sm">
              &larr; {t('backToNews')}
            </button>
            <button onClick={() => setIsReaderMode(!isReaderMode)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title={t('readerMode')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-10">
          <header>
            <p className="text-accent-500 font-semibold">{article.category}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{article.title}</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{article.summary}</p>
             {article.tags && article.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
          </header>
          
          <ArticleActions article={article} />

          {article.videoUrl ? (
            <video controls src={article.videoUrl} className="w-full rounded-lg my-6 aspect-video bg-black"></video>
          ) : (
            <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-96 object-cover rounded-lg my-6" />
          )}

          <div
            style={contentStyle}
            className="prose dark:prose-invert max-w-none article-content transition-all duration-300"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.poll && <Poll initialPoll={article.poll} />}
          
          <CommentsSection articleId={article.id} />
          
          <RelatedArticles currentArticleId={article.id} category={article.category} onArticleClick={onReadAnother} />
        </article>
      </div>
    </div>
  );
};

export default ArticleModal;