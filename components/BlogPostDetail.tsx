import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Clock, Share2, Type, Minus, Plus,
  Mail, Twitter, Link as LinkIcon, Check
} from 'lucide-react';
import { ARTICLES } from '../articles';
import { AUTHORS } from '../authors';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = ARTICLES.find(p => p.id === id);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0: base, 1: lg, 2: xl
  const [shareOpen, setShareOpen] = useState(false);
  const [copiedSource, setCopiedSource] = useState<'instagram' | 'link' | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShareOpen(false); // Reset share menu on navigation
  }, [id]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    
    // Helper to extract significant keywords from text
    const getKeywords = (text: string) => {
      const stopWords = ['this', 'that', 'with', 'from', 'what', 'when', 'where', 'which', 'have', 'been', 'were'];
      return text.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.includes(w));
    };

    const currentKeywords = getKeywords(`${post.title} ${post.excerpt}`);

    // Calculate relevance score for each article
    const scoredArticles = ARTICLES
      .filter(p => p.id !== post.id)
      .map(p => {
        let score = 0;
        
        // 1. Category Match (Base score)
        if (p.category === post.category) score += 5;
        
        // 2. Keyword overlap (Boost score)
        const pKeywords = getKeywords(`${p.title} ${p.excerpt}`);
        const matchCount = pKeywords.filter(k => currentKeywords.includes(k)).length;
        score += matchCount;
        
        return { article: p, score };
      });

    // Sort by score descending and take top 3
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.article);
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-bold mb-4">Adventure Not Found</h2>
        <p className="mb-8 text-gray-400">The story you are looking for doesn't exist.</p>
        <Link to="/" className="text-primary hover:text-white transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const author = AUTHORS[post.authorId];

  const getProseClass = () => {
    switch(fontSizeLevel) {
      case 0: return 'prose';
      case 1: return 'prose-lg';
      case 2: return 'prose-xl';
      default: return 'prose-lg';
    }
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this adventure: ${post.title}`;

  const handleShare = (platform: 'twitter' | 'email') => {
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    }
  };

  const handleCopy = (source: 'instagram' | 'link') => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedSource(source);
      setTimeout(() => setCopiedSource(null), 2000);
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  };

  return (
    <div className="bg-dark min-h-screen pb-12">
      {/* Hero Header for Post */}
      <div className="relative h-96 w-full">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-gray-300 hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Adventures
            </Link>
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <div className="flex items-center bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                 {author && author.avatar ? (
                    <img 
                        src={author.avatar} 
                        alt={author.name} 
                        className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-400"
                    />
                 ) : (
                    <User className="w-4 h-4 mr-2 text-primary" />
                 )}
                <span className="font-medium text-white">{author ? author.name : 'Unknown Author'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-800">
          
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-700">
             {/* Font Size Controls */}
            <div className="flex items-center space-x-4 bg-dark/50 p-2 rounded-lg border border-gray-700">
               <span className="text-gray-400 text-sm font-medium mr-1 hidden sm:inline">Text Size</span>
               <button 
                onClick={() => setFontSizeLevel(prev => Math.max(0, prev - 1))}
                className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${fontSizeLevel === 0 ? 'text-gray-600' : 'text-gray-300'}`}
                aria-label="Decrease font size"
                disabled={fontSizeLevel === 0}
               >
                 <Minus className="w-4 h-4" />
               </button>
               <Type className="w-4 h-4 text-primary" />
               <button 
                onClick={() => setFontSizeLevel(prev => Math.min(2, prev + 1))}
                className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${fontSizeLevel === 2 ? 'text-gray-600' : 'text-gray-300'}`}
                aria-label="Increase font size"
                disabled={fontSizeLevel === 2}
               >
                 <Plus className="w-4 h-4" />
               </button>
            </div>

            {/* Share Menu */}
            <div className="relative">
              <button 
                onClick={() => setShareOpen(!shareOpen)}
                className="flex items-center space-x-2 bg-primary hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-yellow-900/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {shareOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-dark border border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-fade-in-down z-20">
                  <div className="py-1">
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="flex w-full items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Twitter className="mr-3 h-4 w-4 text-[#1DA1F2]" />
                      Twitter
                    </button>
                    <button 
                      onClick={() => handleShare('email')}
                      className="flex w-full items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Mail className="mr-3 h-4 w-4 text-gray-400" />
                      Email
                    </button>
                    <button 
                      onClick={() => handleCopy('link')}
                      className="flex w-full items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      {copiedSource === 'link' ? (
                        <Check className="mr-3 h-4 w-4 text-green-500" />
                      ) : (
                         <LinkIcon className="mr-3 h-4 w-4 text-gray-400" />
                      )}
                      {copiedSource === 'link' ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post Excerpt */}
          <div className="font-sans text-xl font-light text-primary mb-8 border-l-4 border-primary pl-4 italic bg-card/50 p-4 rounded-r">
            {post.excerpt}
          </div>

          {/* Content */}
          <article className={`prose prose-invert ${getProseClass()} max-w-none prose-headings:font-serif prose-headings:text-white prose-p:text-gray-300 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-blockquote:border-l-primary prose-blockquote:bg-gray-800/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-img:rounded-xl prose-img:shadow-xl`}>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-gray-800">
             <h3 className="text-xl font-serif font-bold text-white mb-6">About the Author</h3>
             <div className="flex items-center space-x-4 bg-dark/30 p-6 rounded-xl border border-gray-700/50">
                {author && author.avatar ? (
                    <img 
                        src={author.avatar} 
                        alt={author.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                    </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-white">{author ? author.name : 'Unknown Author'}</h4>
                  <p className="text-gray-400 text-sm mt-1">{author ? author.bio : ''}</p>
                </div>
             </div>
          </div>

        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-serif font-bold text-white mb-8 border-l-4 border-primary pl-4">
              More Adventures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(related => (
                <Link 
                  key={related.id} 
                  to={`/article/${related.id}`}
                  className="bg-card rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-gray-600 transition-all hover:-translate-y-1 group"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={related.imageUrl} 
                      alt={related.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {related.category}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                      {related.readTime}
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {related.title}
                    </h4>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostDetail;