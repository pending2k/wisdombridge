import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Session, MentorProfile } from '../types';
import { Calendar, Clock, CheckCircle2, XCircle, MessageSquare, DollarSign, Star, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function MentorDashboard() {
  const { user, firebaseUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    // Fetch Mentor Profile
    const profileUnsub = onSnapshot(doc(db, 'mentorProfiles', firebaseUser.uid), (docSnap) => {
      if (docSnap.exists()) setProfile(docSnap.data() as MentorProfile);
    });

    // Fetch Sessions
    const q = query(collection(db, 'sessions'), where('mentorId', '==', firebaseUser.uid));
    const sessionsUnsub = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session)));
      setLoading(false);
    });

    return () => {
      profileUnsub();
      sessionsUnsub();
    };
  }, [firebaseUser]);

  const handleSessionAction = async (sessionId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), { status });
    } catch (err) {
      console.error("Error updating session status:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'requested');
  const pastSessions = sessions.filter(s => s.status === 'completed');
  const pendingRequests = sessions.filter(s => s.status === 'requested');

  const totalEarnings = pastSessions.reduce((acc, s) => acc + (profile?.price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mentor Dashboard</h1>
          <p className="text-gray-500">Manage your sessions, mentees, and growth.</p>
        </div>
        <div className="flex gap-4">
          <Link to={`/mentor/${firebaseUser?.uid}`} className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-indigo-600 transition-all">
            View Public Profile
          </Link>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Earnings', value: `$${totalEarnings}`, icon: <DollarSign className="text-green-600" />, color: 'bg-green-50' },
          { label: 'Avg. Rating', value: profile?.rating || 'N/A', icon: <Star className="text-yellow-600" />, color: 'bg-yellow-50' },
          { label: 'Active Mentees', value: profile?.activeMentees || 0, icon: <Users className="text-indigo-600" />, color: 'bg-indigo-50' },
          { label: 'Completed Sessions', value: pastSessions.length, icon: <TrendingUp className="text-violet-600" />, color: 'bg-violet-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Sessions */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              Upcoming Sessions
              {pendingRequests.length > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  {pendingRequests.length} New Requests
                </span>
              )}
            </h2>
            <div className="space-y-6">
              {upcomingSessions.length === 0 ? (
                <div className="p-12 bg-gray-50 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">No upcoming sessions scheduled.</p>
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
                          {session.menteeName?.[0] || 'M'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{session.menteeName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(session.date), 'MMM d, yyyy')}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(session.date), 'HH:mm')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {session.status === 'requested' ? (
                          <>
                            <button
                              onClick={() => handleSessionAction(session.id, 'accepted')}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 size={18} /> Accept
                            </button>
                            <button
                              onClick={() => handleSessionAction(session.id, 'rejected')}
                              className="px-6 py-3 bg-white border border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                            >
                              <XCircle size={18} /> Decline
                            </button>
                          </>
                        ) : (
                          <Link
                            to={`/session/${session.id}`}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                          >
                            <MessageSquare size={18} /> Enter Session
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
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Past Sessions</h2>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Mentee</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Duration</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pastSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900">{session.menteeName}</td>
                      <td className="px-8 py-6 text-gray-500">{format(new Date(session.date), 'MMM d, yyyy')}</td>
                      <td className="px-8 py-6 text-gray-500">{session.duration} min</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase">
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pastSessions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic">No past sessions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar: Availability & Profile */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Availability</h3>
            <div className="space-y-4">
              {['Monday', 'Wednesday', 'Friday'].map(day => (
                <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="font-bold text-gray-700">{day}</span>
                  <span className="text-sm text-indigo-600 font-bold">09:00 - 17:00</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">
              Update Availability
            </button>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
            <h3 className="text-xl font-bold mb-4">Mentor Tip</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              "Discipline is the bridge between goals and accomplishment." 
              Remember to set clear objectives for your mentees before each session.
            </p>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all border border-white/20">
              Read Mentor Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
