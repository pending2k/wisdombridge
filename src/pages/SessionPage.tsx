import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../types';
import { MessageSquare, Video, FileText, Send, CheckCircle2, Clock, Shield, User, Award, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !firebaseUser) return;

    // Fetch Session
    const sessionUnsub = onSnapshot(doc(db, 'sessions', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Session;
        setSession({ id: docSnap.id, ...data });
        setNotes(data.notes || '');
      }
      setLoading(false);
    });

    // Fetch Chat
    const chatQuery = query(collection(db, `sessions/${id}/messages`), orderBy('createdAt', 'asc'));
    const chatUnsub = onSnapshot(chatQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    return () => {
      sessionUnsub();
      chatUnsub();
    };
  }, [id, firebaseUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !firebaseUser) return;

    try {
      await addDoc(collection(db, `sessions/${id}/messages`), {
        senderId: firebaseUser.uid,
        text: newMessage,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'sessions', id), { notes });
    } catch (err) {
      console.error("Error saving notes:", err);
    }
  };

  const handleCompleteSession = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'sessions', id), { status: 'completed' });
      navigate(user?.role === 'mentor' ? '/dashboard/mentor' : '/dashboard/mentee');
    } catch (err) {
      console.error("Error completing session:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!session) return <div className="text-center py-20">Session not found.</div>;

  const isMentor = user?.role === 'mentor';
  const partnerName = isMentor ? session.menteeName : session.mentorName;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            {partnerName?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Session with {partnerName}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Clock size={12} /> 60 Minutes</span>
              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-bold uppercase tracking-wider">{session.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={session.videoLink || 'https://meet.google.com/new'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Video size={18} /> Join Video Call
          </a>
          {isMentor && session.status !== 'completed' && (
            <button
              onClick={handleCompleteSession}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={18} /> Complete Session
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" />
              Session Chat
            </h2>
            <span className="text-xs text-gray-400">Messages are end-to-end encrypted</span>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === firebaseUser?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                    msg.senderId === firebaseUser?.uid
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  <div className={`text-[10px] mt-1 opacity-60 ${msg.senderId === firebaseUser?.uid ? 'text-right' : 'text-left'}`}>
                    {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-6 pr-16 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Notes Area */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              Session Notes
            </h2>
            {isMentor && (
              <button
                onClick={handleSaveNotes}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Save
              </button>
            )}
          </div>
          
          <div className="flex-grow p-6">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              readOnly={!isMentor}
              placeholder={isMentor ? "Write session notes, action items, and goals for the mentee..." : "Your mentor will provide notes and action items here."}
              className="w-full h-full bg-gray-50 border-none rounded-2xl p-6 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="p-6 bg-indigo-50 border-t border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Award size={16} />
              </div>
              <span className="text-sm font-bold text-indigo-900">WisdomBridge Protocol</span>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Focus on the 1-on-1 transformation. Use these notes to track discipline, confidence, and work quality progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
