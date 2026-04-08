import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../types';
import { Calendar, Clock, MessageSquare, Star, Target, Award, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function MenteeDashboard() {
  const { user, firebaseUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const q = query(collection(db, 'sessions'), where('menteeId', '==', firebaseUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'requested');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Track your progress and upcoming mentoring sessions.</p>
        </div>
        <Link to="/mentors" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
          Book New Session <Zap size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Sessions */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              Upcoming Sessions
            </h2>
            <div className="space-y-6">
              {upcomingSessions.length === 0 ? (
                <div className="p-12 bg-white rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium mb-6">No sessions booked yet.</p>
                  <Link to="/mentors" className="text-indigo-600 font-bold hover:underline">Find a mentor now</Link>
                </div>
              ) : (
                upcomingSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                          {session.mentorName?.[0] || 'M'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Mentor: {session.mentorName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(session.date), 'MMM d, yyyy')}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(session.date), 'HH:mm')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider ${
                          session.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {session.status}
                        </span>
                        {session.status === 'accepted' && (
                          <Link
                            to={`/session/${session.id}`}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                          >
                            <MessageSquare size={18} /> Join Session
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Learning History</h2>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Mentor</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Topic</th>
                    <th className="px-8 py-4">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pastSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900">{session.mentorName}</td>
                      <td className="px-8 py-6 text-gray-500">{format(new Date(session.date), 'MMM d, yyyy')}</td>
                      <td className="px-8 py-6 text-gray-500">{session.objective || 'General Mentoring'}</td>
                      <td className="px-8 py-6">
                        <button className="text-indigo-600 font-bold hover:text-indigo-700">Write Review</button>
                      </td>
                    </tr>
                  ))}
                  {pastSessions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic">No past sessions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Progress & Goals */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="text-indigo-600" size={20} />
              My Goals
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-sm text-indigo-900 font-medium">Mastering Time Management</p>
                <div className="mt-3 w-full bg-indigo-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-700 font-medium">Public Speaking Confidence</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-all">
              Update Goals
            </button>
          </div>

          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4">Wisdom Points</h3>
            <div className="text-4xl font-black text-indigo-400 mb-2">1,250</div>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              You're in the top 15% of disciplined mentees this month. Keep it up!
            </p>
            <Link to="/rewards" className="flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-colors">
              View Rewards <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
