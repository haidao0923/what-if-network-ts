import React, { useState, useEffect, useMemo } from 'react';
import { BlogPost } from '../types';
import { AUTHORS } from '../authors';
import { Clock, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogGridProps {
  posts: BlogPost[];
}

const POSTS_PER_PAGE = 6;

const BlogGrid: React.FC<BlogGridProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const uniqueCats = new Set(posts.map(post => post.category));
    return ['All', ...Array.from(uniqueCats).sort()];
  }, [posts]);

  // Filter posts based on search query and selected category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Reset to page 1 when search query or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Calculate pagination details
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Smooth scroll to top of grid when changing pages
    const gridElement = document.getElementById('blog-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="blog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col items-start sm:flex-row sm:items-center gap-4">
          <h2 className="text-3xl font-serif font-bold text-white whitespace-nowrap">Latest Adventures</h2>
          <div className="relative inline-block w-fit">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-3 w-3 text-primary" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-card border border-gray-700 text-gray-300 py-1.5 pl-9 pr-8 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:bg-gray-800 transition-colors shadow-sm"
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-800 flex-grow mx-6 hidden md:block rounded-full"></div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-card text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
            placeholder="Search titles or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map((post) => {
              const author = AUTHORS[post.authorId];
              return (
                <Link
                  to={`/article/${post.id}`}
                  key={post.id}
                  className="group bg-card rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:shadow-2xl hover:border-gray-700 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm bg-primary/90 text-white backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-gray-400 mb-3 space-x-4">
                      <span className="flex items-center">
                         {post.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-center justify-between">
                      <div className="flex items-center">
                        {author && author.avatar && (
                            <img
                                src={author.avatar}
                                alt={author.name}
                                className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-600"
                            />
                        )}
                        <span className="text-sm font-medium text-gray-300">{author ? author.name : 'Unknown Author'}</span>
                      </div>
                      <span className="text-primary text-sm font-semibold group-hover:underline">Read Story &rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage === 1
                    ? 'border-gray-800 text-gray-600 cursor-not-allowed'
                    : 'border-gray-700 text-gray-300 hover:border-primary hover:text-primary bg-card hover:bg-gray-800'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`w-10 h-10 rounded-lg border font-medium transition-all ${
                    currentPage === number
                      ? 'bg-primary border-primary text-white shadow-lg shadow-yellow-900/20'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white bg-card hover:bg-gray-800'
                  }`}
                  aria-label={`Page ${number}`}
                  aria-current={currentPage === number ? 'page' : undefined}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage === totalPages
                    ? 'border-gray-800 text-gray-600 cursor-not-allowed'
                    : 'border-gray-700 text-gray-300 hover:border-primary hover:text-primary bg-card hover:bg-gray-800'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-card p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No adventures found</h3>
          <p className="text-gray-400 max-w-sm">
            We couldn't find any stories matching your search or selected category.
          </p>
          <button
             onClick={() => {
                 setSearchQuery('');
                 setSelectedCategory('All');
             }}
             className="mt-4 text-primary hover:text-yellow-400 text-sm font-medium"
          >
              Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogGrid;