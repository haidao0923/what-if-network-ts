import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
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
  const currentUserId = user?.uid || getGuestId();

  const ANONYMOUS_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    if (!id) return;

    const fetchQuestion = async () => {
      try {
        const docRef = doc(db, 'questions', id);
        const unsubscribeQuestion = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setQuestion({ id: docSnap.id, ...docSnap.data() } as Question);
          } else {
            navigate('/forum');
          }
        });
        return unsubscribeQuestion;
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    let unsubscribeQuestion: any;
    fetchQuestion().then(unsub => unsubscribeQuestion = unsub);

    const q = query(collection(db, 'questions', id, 'responses'), orderBy('createdAt', 'asc'));
    const unsubscribeResponses = onSnapshot(q, (snapshot) => {
      const responsesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Response[];
      setResponses(responsesData);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeQuestion) unsubscribeQuestion();
      unsubscribeResponses();
    };
  }, [id, navigate]);

  useEffect(() => {
    // Auto-fix responsesCount if it's out of sync
    if (id && question && responses.length !== question.responsesCount) {
      const questionRef = doc(db, 'questions', id);
      updateDoc(questionRef, {
        responsesCount: responses.length
      }).catch(err => console.error("Error auto-fixing responsesCount:", err));
    }
  }, [id, question?.responsesCount, responses.length]);

  useEffect(() => {
    if (id) {
      const likeRef = doc(db, 'questions', id, 'likes', currentUserId);
      const unsubscribeLike = onSnapshot(likeRef, (docSnap) => {
        setIsLiked(docSnap.exists());
      });
      return () => unsubscribeLike();
    }
  }, [id, currentUserId]);

  const handleLike = async () => {
    if (!id) return;
    const likeRef = doc(db, 'questions', id, 'likes', currentUserId);
    const questionRef = doc(db, 'questions', id);

    try {
      if (isLiked) {
        await deleteDoc(likeRef);
        await updateDoc(questionRef, {
          likesCount: increment(-1)
        });
      } else {
        await setDoc(likeRef, { uid: currentUserId, createdAt: serverTimestamp() });
        await updateDoc(questionRef, {
          likesCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
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

  const rootResponses = responses.filter(r => !r.parentId);
  const getReplies = (parentId: string) => responses.filter(r => r.parentId === parentId);

  const renderResponse = (response: Response, depth = 0) => {
    const replies = getReplies(response.id);

    return (
      <div key={response.id} className={`${depth > 0 ? 'ml-6 md:ml-12 mt-4 border-l-2 border-gray-800 pl-4 md:pl-8' : 'mb-8'}`}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img
                src={response.isAnonymous && !response.authorAvatar ? ANONYMOUS_AVATAR : (response.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.authorName)}&background=CA8A04&color=fff`)}
                alt={response.authorName}
                className="w-10 h-10 rounded-full border border-gray-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{response.authorName}</span>
                  {response.isVerified && (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20 flex items-center gap-1">
                      <ShieldAlert className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  {response.isAnonymous ? 'Anonymous Contributor' : 'Contributor'}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {response.createdAt?.toDate().toLocaleDateString()} {response.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {response.content}
            </p>

            <button
              onClick={() => {
                setReplyingTo(response);
                document.getElementById('response-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Reply
            </button>
          </div>
        </motion.div>

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
          className="bg-card border border-gray-800 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={question.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.authorName)}&background=CA8A04&color=fff`}
                alt={question.authorName}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
              <div>
                <h3 className="text-white font-bold text-lg">{question.authorName}</h3>
                <p className="text-gray-500 text-sm flex items-center">
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
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-bold">{question.likesCount || 0}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="w-6 h-6" />
                <span className="font-bold">{responses.length}</span>
              </div>
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
            {question.title}
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            {question.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, i) => (
              <span key={i} className="px-4 py-1.5 bg-dark/50 border border-gray-800 rounded-full text-sm text-primary font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Response Form */}
        <div className="mb-16" id="response-form">
          <h2 className="font-serif text-3xl font-bold text-white mb-8 flex items-center">
            <Sparkles className="w-8 h-8 text-primary mr-3" />
            {replyingTo ? `Reply to ${replyingTo.authorName}` : 'Contribute Your Perspective'}
          </h2>

          <ResponseForm
            questionId={question.id}
            user={user}
            parentId={replyingTo?.id}
            onCancelReply={() => setReplyingTo(null)}
            replyingToName={replyingTo?.authorName}
          />
        </div>

        {/* Responses List */}
        <div className="space-y-4">
          <h2 className="font-serif text-3xl font-bold text-white mb-8">
            {responses.length} {responses.length === 1 ? 'Response' : 'Responses'}
          </h2>

          {rootResponses.length > 0 ? (
            rootResponses.map((response) => renderResponse(response))
          ) : (
            <div className="text-center py-12 bg-card/20 border border-gray-800 rounded-2xl">
              <MessageSquareHeart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 italic">No responses yet. Be the first to contribute!</p>
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
  replyingToName?: string
}> = ({ questionId, user, parentId, onCancelReply, replyingToName }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

      await addDoc(collection(db, 'questions', questionId, 'responses'), responseData);

      // Update response count
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        responsesCount: increment(1)
      });

      setContent('');
      if (onCancelReply) onCancelReply();
    } catch (error) {
      console.error("Error adding response:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
      {parentId && (
        <div className="flex items-center justify-between bg-dark/50 px-4 py-2 rounded-lg border border-gray-800">
          <span className="text-sm text-gray-400">Replying to <span className="text-primary font-bold">{replyingToName}</span></span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Cancel Reply
          </button>
        </div>
      )}
      <div>
        <label className="block text-sm font-bold text-primary uppercase tracking-widest mb-3">
          {parentId ? 'Your Reply' : 'Have you attempted this before and/or how would you approach this what if challenge?'}
        </label>
        <textarea
          required
          rows={parentId ? 4 : 6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write your reply..." : "Share your perspective, strategy, or experience..."}
          className="w-full px-4 py-3 bg-dark border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {user ? (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-gray-700 rounded bg-dark peer-checked:bg-primary peer-checked:border-primary transition-all" />
              <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Post anonymously</span>
          </label>
        ) : (
          <p className="text-sm text-gray-500 italic">
            You are posting as a guest. Your response will be anonymous.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-yellow-700 transition-all shadow-lg hover:-translate-y-1 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : (
            <>
              {parentId ? 'Post Reply' : 'Share Perspective'}
              <Send className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default QuestionDetail;
