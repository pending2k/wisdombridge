import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, MentorProfile, Session } from '../types';
import { Shield, Users, Award, Calendar, CheckCircle2, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [mentorProfiles, setMentorProfiles] = useState<MentorProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as User));
    });

    const mentorsUnsub = onSnapshot(collection(db, 'mentorProfiles'), (snapshot) => {
      setMentorProfiles(snapshot.docs.map(doc => doc.data() as MentorProfile));
    });

    const sessionsUnsub = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session)));
      setLoading(false);
    });

    return () => {
      usersUnsub();
      mentorsUnsub();
      sessionsUnsub();
    };
  }, []);

  const handleApproveMentor = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'mentorProfiles', userId), { status: 'active' });
    } catch (err) {
      console.error("Error approving mentor:", err);
    }
  };

  const pendingMentors = mentorProfiles.filter(m => m.status === 'pending');
  const activeMentors = mentorProfiles.filter(m => m.status === 'active');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            Admin Control Panel
          </h1>
          <p className="text-gray-500">Oversee users, mentors, and platform health.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', value: users.length, icon: <Users className="text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Active Mentors', value: activeMentors.length, icon: <Award className="text-indigo-600" />, color: 'bg-indigo-50' },
          { label: 'Total Sessions', value: sessions.length, icon: <Calendar className="text-violet-600" />, color: 'bg-violet-50' },
          { label: 'Pending Approvals', value: pendingMentors.length, icon: <AlertCircle className="text-red-600" />, color: 'bg-red-50' },
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
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              Mentor Approvals
              {pendingMentors.length > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                  {pendingMentors.length} Pending
                </span>
              )}
            </h2>
            <div className="space-y-6">
              {pendingMentors.length === 0 ? (
                <div className="p-12 bg-gray-50 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200">
                  <CheckCircle2 className="mx-auto text-green-400 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">All mentor applications processed.</p>
                </div>
              ) : (
                pendingMentors.map((mentor) => {
                  const mentorUser = users.find(u => u.uid === mentor.userId);
                  return (
                    <motion.div
                      key={mentor.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-xl">
                            {mentorUser?.name?.[0] || 'M'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{mentorUser?.name}</h3>
                            <p className="text-indigo-600 font-medium text-sm">{mentor.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApproveMentor(mentor.userId)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 size={18} /> Approve
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />
              Recent Users
            </h3>
            <div className="space-y-4">
              {users.slice(0, 5).map(u => (
                <div key={u.uid} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                    {u.name[0]}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-gray-900 truncate">{u.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
