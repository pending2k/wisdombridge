import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { MentorProfile, User } from '../types';
import { Search, Filter, Star, Globe, DollarSign, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function MentorList() {
  const [mentors, setMentors] = useState<(MentorProfile & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const domains = ['All', 'Business', 'Technology', 'Personal Growth', 'Leadership', 'Discipline'];

  useEffect(() => {
    const q = query(collection(db, 'mentorProfiles'), where('status', '==', 'active'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const mentorData = snapshot.docs.map(doc => doc.data() as MentorProfile);
      
      // Fetch user names for each mentor
      const mentorsWithUsers = await Promise.all(
        mentorData.map(async (mentor) => {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', mentor.userId)));
          const userData = userDoc.docs[0]?.data() as User;
          return { ...mentor, user: userData };
        })
      );
      
      setMentors(mentorsWithUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || m.domains.includes(selectedDomain);
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Guide</h1>
          <p className="text-gray-500">Connect with elite mentors dedicated to your transformation.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none cursor-pointer"
            >
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-gray-100 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMentors.map((mentor) => (
              <motion.div
                key={mentor.userId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 overflow-hidden border-2 border-white shadow-md">
                      {mentor.photoUrl ? (
                        <img src={mentor.photoUrl} alt={mentor.user?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Award size={40} />
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                      <Star size={14} fill="currentColor" />
                      {mentor.rating || 'New'}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {mentor.user?.name}
                  </h3>
                  <p className="text-indigo-600 font-semibold mb-4">{mentor.title}</p>
                  
                  <p className="text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                    {mentor.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {mentor.domains.slice(0, 3).map(d => (
                      <span key={d} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-bold uppercase">Price per session</span>
                      <span className="text-xl font-bold text-gray-900">${mentor.price}</span>
                    </div>
                    <Link
                      to={`/mentor/${mentor.userId}`}
                      className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredMentors.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No mentors found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
