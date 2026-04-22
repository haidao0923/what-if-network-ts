import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, increment, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { ArrowLeft, Clock, User as UserIcon, Send, Sparkles, Target, ShieldAlert, MessageSquareHeart, Heart, MessageCircle, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

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

interface Response {
  id: string;
  content: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  isVerified: boolean;
  isAnonymous: boolean;
  createdAt: any;
  parentId?: string;
}

const getGuestId = () => {
  let guestId = localStorage.getItem('forum_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('forum_guest_id', guestId);
  }
  return guestId;
};

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Response | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const currentUserId = user?.uid || getGuestId();
  const isMounted = useRef(true);

  const ANONYMOUS_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  useEffect(() => {
    isMounted.current = true;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted.current) setUser(currentUser);
    });

    if (!id) return;

    // Question listener
    const docRef = doc(db, 'questions', id);
    const unsubscribeQuestion = onSnapshot(docRef, (docSnap) => {
      if (!isMounted.current) return;
      if (docSnap.exists()) {
        setQuestion({ id: docSnap.id, ...docSnap.data() } as Question);
      } else {
        navigate('/forum');
      }
    }, (error) => {
      if (isMounted.current) {
        handleFirestoreError(error, OperationType.GET, `questions/${id}`);
      }
    });

    // Responses listener
    const responsesPath = `questions/${id}/responses`;
    const q = query(collection(db, 'questions', id, 'responses'), orderBy('createdAt', 'desc'));
    const unsubscribeResponses = onSnapshot(q, (snapshot) => {
      if (!isMounted.current) return;
      const responsesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Response[];
      setResponses(responsesData);
      setLoading(false);
    }, (error) => {
      if (isMounted.current) {
        handleFirestoreError(error, OperationType.LIST, responsesPath);
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribeAuth();
      unsubscribeQuestion();
      unsubscribeResponses();
    };
  }, [id, navigate]);

  // Remove the auto-fix responsesCount useEffect as it causes redundant writes and potential race conditions

  const fetchQuestionLikeState = async () => {
    if (!id) return;
    try {
      const likeRef = doc(db, 'questions', id, 'likes', currentUserId);
      const docSnap = await getDoc(likeRef);
      if (isMounted.current) setIsLiked(docSnap.exists());
    } catch (error: any) {
      // Silence permission errors during fetch to avoid console storm
      if (error?.code !== 'permission-denied') {
        console.warn("Could not fetch question like state:", error);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestionLikeState();
    }
  }, [id, currentUserId]);

  const handleLike = async () => {
    if (!id) return;
    const likeRef = doc(db, 'questions', id, 'likes', currentUserId);
    const questionRef = doc(db, 'questions', id);

    try {
      if (isLiked) {
        setIsLiked(false);
        setQuestion(prev => prev ? { ...prev, likesCount: (prev.likesCount || 0) - 1 } : null);
        await deleteDoc(likeRef);
        await new Promise(resolve => setTimeout(resolve, 50));
        await updateDoc(questionRef, { likesCount: increment(-1) });
      } else {
        setIsLiked(true);
        setQuestion(prev => prev ? { ...prev, likesCount: (prev.likesCount || 0) + 1 } : null);
        await setDoc(likeRef, { uid: currentUserId, createdAt: serverTimestamp() });
        await new Promise(resolve => setTimeout(resolve, 50));
        await updateDoc(questionRef, { likesCount: increment(1) });
      }
    } catch (error) {
      fetchQuestionLikeState();
      handleFirestoreError(error, OperationType.WRITE, `questions/${id}/likes`);
    }
  };

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

  if (loading && !question) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) return null;

  // Sorting logic
  const sortedResponses = [...responses].sort((a, b) => {
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;

    if (sortBy === 'oldest') return timeA - timeB;
    return timeB - timeA; // newest
  });

  const rootResponses = sortedResponses.filter(r => !r.parentId);
  const getReplies = (parentId: string) => sortedResponses.filter(r => r.parentId === parentId);

  const renderResponse = (response: Response, depth = 0) => {
    const replies = getReplies(response.id);
    const isReplying = replyingTo?.id === response.id;

    return (
      <div key={response.id} className={`${depth > 0 ? 'ml-4 md:ml-8 mt-2 border-l border-gray-800 pl-4' : 'mb-4'}`}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card/50 border border-gray-800/50 rounded-xl p-4 shadow-sm hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src={response.isAnonymous && !response.authorAvatar ? ANONYMOUS_AVATAR : (response.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.authorName)}&background=CA8A04&color=fff`)}
                alt={response.authorName}
                className="w-8 h-8 rounded-full border border-gray-700"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm">{response.authorName}</span>
                  {response.isVerified && (
                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20 flex items-center gap-1">
                      <ShieldAlert className="w-2 h-2" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  {response.isAnonymous ? 'Anonymous' : 'Contributor'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-gray-500">
              {response.createdAt?.toDate().toLocaleDateString()} {response.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {response.content}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setReplyingTo(isReplying ? null : response)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${isReplying ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {isReplying ? 'Cancel' : 'Reply'}
              </button>
            </div>
          </div>
        </motion.div>

        {isReplying && (
          <div className="mt-2 ml-4">
            <ResponseForm
              questionId={question.id}
              user={user}
              parentId={response.id}
              onCancelReply={() => setReplyingTo(null)}
              replyingToName={response.authorName}
              compact
            />
          </div>
        )}

        {replies.map(reply => renderResponse(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/forum')}
            className="flex items-center text-gray-400 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Forum
          </button>

          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center text-gray-400 hover:text-primary transition-colors text-sm font-medium"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Sign In
            </button>
          )}
        </div>

        {/* Question Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-gray-800 rounded-3xl p-6 md:p-10 mb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={question.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.authorName)}&background=CA8A04&color=fff`}
                alt={question.authorName}
                className="w-10 h-10 rounded-full border-2 border-primary"
              />
              <div>
                <h3 className="text-white font-bold text-base">{question.authorName}</h3>
                <p className="text-gray-500 text-xs flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Asked on {question.createdAt?.toDate().toLocaleDateString()} {question.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-bold text-sm">{question.likesCount || 0}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="w-5 h-5" />
                <span className="font-bold text-sm">{responses.length}</span>
              </div>
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
            {question.title}
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            {question.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-dark/50 border border-gray-800 rounded-full text-xs text-primary font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Response Form (Root) */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="w-6 h-6 text-primary mr-2" />
            Contribute Your Perspective
          </h2>

          <ResponseForm
            questionId={question.id}
            user={user}
          />
        </div>

        {/* Responses List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl font-bold text-white">
              {responses.length} {responses.length === 1 ? 'Response' : 'Responses'}
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-dark border border-gray-800 text-gray-300 rounded px-2 py-1 outline-none focus:border-primary transition-colors"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {rootResponses.length > 0 ? (
            rootResponses.map((response) => renderResponse(response))
          ) : (
            <div className="text-center py-10 bg-card/20 border border-gray-800 rounded-2xl">
              <MessageSquareHeart className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm italic">No responses yet. Be the first to contribute!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ResponseForm: React.FC<{
  questionId: string,
  user: FirebaseUser | null,
  parentId?: string,
  onCancelReply?: () => void,
  replyingToName?: string,
  compact?: boolean
}> = ({ questionId, user, parentId, onCancelReply, replyingToName, compact }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const responseData: any = {
        questionId,
        content: content.trim(),
        isVerified: !!user,
        isAnonymous: user ? isAnonymous : true,
        createdAt: serverTimestamp()
      };

      if (parentId) {
        responseData.parentId = parentId;
      }

      if (user) {
        responseData.authorId = user.uid;
        if (isAnonymous) {
          responseData.authorName = 'Anonymous';
          responseData.authorAvatar = '';
        } else {
          responseData.authorName = user.displayName || 'Anonymous';
          responseData.authorAvatar = user.photoURL || '';
        }
      } else {
        responseData.authorName = 'Anonymous';
        responseData.authorAvatar = '';
      }

      // We use addDoc and updateDoc separately instead of writeBatch to avoid a known Firestore SDK
      // internal assertion error (ID: ca9) that can occur when mixing serverTimestamp in a batch
      // with parent document updates while listeners are active.
      await addDoc(collection(db, 'questions', questionId, 'responses'), responseData);

      // Update response count on parent question
      const questionRef = doc(db, 'questions', questionId);
      await new Promise(resolve => setTimeout(resolve, 50));
      await updateDoc(questionRef, {
        responsesCount: increment(1)
      });

      if (isMounted.current) {
        setContent('');
        if (onCancelReply) onCancelReply();
      }
    } catch (error) {
      if (isMounted.current) {
        handleFirestoreError(error, OperationType.WRITE, `questions/${questionId}/responses`);
      }
    } finally {
      if (isMounted.current) setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-card border border-gray-800 rounded-2xl shadow-xl space-y-4 ${compact ? 'p-4' : 'p-6'}`}>
      {parentId && (
        <div className="flex items-center justify-between bg-dark/50 px-3 py-1.5 rounded-lg border border-gray-800">
          <span className="text-xs text-gray-400">Replying to <span className="text-primary font-bold">{replyingToName}</span></span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      <div>
        {!compact && (
          <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
            Share your perspective
          </label>
        )}
        <textarea
          required
          rows={compact ? 3 : 4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write your reply..." : "How would you approach this what if challenge?"}
          className="w-full px-3 py-2 bg-dark border border-gray-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        {user ? (
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-4 h-4 border-2 border-gray-700 rounded bg-dark peer-checked:bg-primary peer-checked:border-primary transition-all" />
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Post anonymously</span>
          </label>
        ) : (
          <p className="text-[10px] text-gray-500 italic">
            Posting as guest (anonymous).
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full sm:w-auto flex items-center justify-center bg-primary text-white font-bold rounded-xl hover:bg-yellow-700 transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 ${compact ? 'px-6 py-2 text-xs' : 'px-8 py-3 text-sm'}`}
        >
          {submitting ? 'Submitting...' : (
            <>
              {parentId ? 'Post Reply' : 'Share Perspective'}
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default QuestionDetail;
