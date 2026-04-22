import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc, setDoc, updateDoc, increment, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { MessageCircle, Plus, Search, Tag, Clock, User as UserIcon, ChevronRight, MessageSquareHeart, Heart, LogOut, Filter, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface Question {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: any;
  tags: string[];
  likesCount?: number;
  responsesCount?: number;
}

type SortOption = 'recent' | 'likes' | 'responses';

const getGuestId = () => {
  let guestId = localStorage.getItem('forum_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('forum_guest_id', guestId);
  }
  return guestId;
};

const ForumHome: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        getDoc(userRef).then((docSnap) => {
          if (!docSnap.exists()) {
            setDoc(userRef, {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Anonymous',
              email: currentUser.email,
              avatar: currentUser.photoURL || '',
              role: 'user',
              createdAt: serverTimestamp()
            });
          }
        });
      }
    });

    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribeQuestions = onSnapshot(q, (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(questionsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'questions');
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeQuestions();
    };
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'likes') {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    if (sortBy === 'responses') {
      return (b.responsesCount || 0) - (a.responsesCount || 0);
    }
    // Default to recent
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA;
  });

  const filteredQuestions = sortedQuestions.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-5xl font-bold text-white mb-4">
              The <span className="text-primary italic">"What If"</span> Forum
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              A collaborative space to explore hypothetical scenarios, share approaches, and discuss life impacts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative flex-grow w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-card border border-gray-800 text-white px-10 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none cursor-pointer transition-all hover:bg-gray-800"
              >
                <option value="recent">Most Recent</option>
                <option value="likes">Most Liked</option>
                <option value="responses">Most Responded</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewQuestionModal(true)}
                  className="flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-yellow-700 transition-all shadow-lg hover:-translate-y-1 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ask a Question
                </button>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-3 bg-card border border-gray-800 text-gray-400 hover:text-red-400 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center justify-center px-6 py-3 bg-card border border-gray-800 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-1 whitespace-nowrap"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                Login to Ask
              </button>
            )}
          </div>
        </div>

        {/* Question List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="grid gap-6">
            {filteredQuestions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-gray-800 rounded-2xl p-6 hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-grow">
                    <Link to={`/forum/question/${question.id}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={question.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.authorName)}&background=CA8A04&color=fff`}
                          alt={question.authorName}
                          className="w-8 h-8 rounded-full border border-gray-700"
                        />
                        <span className="text-sm text-gray-400 font-medium">{question.authorName}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {question.createdAt?.toDate().toLocaleDateString()} {question.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h2 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-primary transition-colors">
                        {question.title}
                      </h2>

                      <p className="text-gray-400 line-clamp-2 mb-4">
                        {question.description}
                      </p>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-dark/50 border border-gray-800 rounded-full text-xs text-gray-500 flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <LikeButton questionId={question.id} initialLikes={question.likesCount || 0} user={user} />
                        <Link to={`/forum/question/${question.id}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{question.responsesCount || 0}</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <Link to={`/forum/question/${question.id}`} className="hidden md:flex flex-col justify-center items-end shrink-0">
                    <div className="flex items-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/30 border border-dashed border-gray-800 rounded-3xl">
            <MessageSquareHeart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No questions found</h3>
            <p className="text-gray-500">Be the first to ask a "What If" question!</p>
          </div>
        )}
      </div>

      {/* New Question Modal */}
      <AnimatePresence>
        {showNewQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewQuestionModal(false)}
              className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <h2 className="font-serif text-3xl font-bold text-white mb-6">Ask a "What If" Question</h2>
              <NewQuestionForm
                user={user!}
                onSuccess={() => setShowNewQuestionModal(false)}
                onCancel={() => setShowNewQuestionModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LikeButton: React.FC<{ questionId: string, initialLikes: number, user: FirebaseUser | null }> = ({ questionId, initialLikes, user }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const currentUserId = user?.uid || getGuestId();
  const isMounted = useRef(true);

  const fetchLikeState = async () => {
    try {
      const likeRef = doc(db, 'questions', questionId, 'likes', currentUserId);
      const docSnap = await getDoc(likeRef);
      if (isMounted.current) setIsLiked(docSnap.exists());
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        console.warn("Could not fetch like state:", error);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchLikeState();
    return () => { isMounted.current = false; };
  }, [questionId, currentUserId]);

  useEffect(() => {
    if (isMounted.current) setLikesCount(initialLikes);
  }, [initialLikes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const likeRef = doc(db, 'questions', questionId, 'likes', currentUserId);
    const questionRef = doc(db, 'questions', questionId);

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        await deleteDoc(likeRef);
        await new Promise(resolve => setTimeout(resolve, 50));
        await updateDoc(questionRef, { likesCount: increment(-1) });
      } else {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        await setDoc(likeRef, { uid: currentUserId, createdAt: serverTimestamp() });
        await new Promise(resolve => setTimeout(resolve, 50));
        await updateDoc(questionRef, { likesCount: increment(1) });
      }
    } catch (error) {
      // Revert optimism
      fetchLikeState();
      handleFirestoreError(error, OperationType.WRITE, `questions/${questionId}/likes`);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1.5 transition-all ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likesCount}</span>
    </button>
  );
};

const NewQuestionForm: React.FC<{ user: FirebaseUser, onSuccess: () => void, onCancel: () => void }> = ({ user, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'questions'), {
        title: title.trim(),
        description: description.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || '',
        createdAt: serverTimestamp(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        likesCount: 0,
        responsesCount: 0
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">The Question (Start with "What If...")</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What if I moved to a new country with no plan?"
          className="w-full px-4 py-3 bg-dark border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Context / Details</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain the scenario and why you're curious about it..."
          className="w-full px-4 py-3 bg-dark border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Tags (Comma separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="travel, career, risk"
          className="w-full px-4 py-3 bg-dark border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-grow px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-grow px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-yellow-700 transition-all disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Question'}
        </button>
      </div>
    </form>
  );
};

export default ForumHome;
