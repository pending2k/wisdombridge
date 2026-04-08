import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { MentorProfile, User, Review, Availability } from '../types';
import { Star, Globe, DollarSign, Award, Calendar, MessageSquare, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, firebaseUser } = useAuth();
  const navigate = useNavigate();
  
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [mentorUser, setMentorUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const mentorDoc = await getDoc(doc(db, 'mentorProfiles', id));
        const userDoc = await getDoc(doc(db, 'users', id));
        const availDoc = await getDoc(doc(db, 'availability', id));
        
        if (mentorDoc.exists()) setMentor(mentorDoc.data() as MentorProfile);
        if (userDoc.exists()) setMentorUser(userDoc.data() as User);
        if (availDoc.exists()) setAvailability(availDoc.data() as Availability);

        // Fetch reviews
        const reviewsQuery = query(collection(db, 'reviews'), where('mentorId', '==', id));
        const reviewsSnap = await getDocs(reviewsQuery);
        setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      } catch (err) {
        console.error("Error fetching mentor profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBookSession = async () => {
    if (!firebaseUser) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const sessionDate = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.split(':');
      sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await addDoc(collection(db, 'sessions'), {
        mentorId: id,
        menteeId: firebaseUser.uid,
        mentorName: mentorUser?.name,
        menteeName: currentUser?.name,
        date: sessionDate.toISOString(),
        duration: 60,
        status: 'requested',
        createdAt: new Date().toISOString()
      });

      navigate('/dashboard/mentee');
    } catch (err: any) {
      setError(err.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!mentor || !mentorUser) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900">Mentor not found</h2>
      <button onClick={() => navigate('/mentors')} className="text-indigo-600 font-bold mt-4">Back to Mentors</button>
    </div>
  );

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 text-white pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 bg-gray-800 rounded-[3rem] overflow-hidden border-4 border-gray-800 shadow-2xl">
              {mentor.photoUrl ? (
                <img src={mentor.photoUrl} alt={mentorUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Award size={80} />
                </div>
              )}
            </div>
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                {mentor.domains.map(d => (
                  <span key={d} className="px-4 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
                    {d}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{mentorUser.name}</h1>
              <p className="text-2xl text-gray-400 font-medium mb-8">{mentor.title}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-8 text-gray-300">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400" size={20} fill="currentColor" />
                  <span className="font-bold text-white">{mentor.rating || 'New'}</span>
                  <span className="text-sm">({mentor.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-indigo-400" />
                  <span>{mentor.languages.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-green-400" />
                  <span>Verified Mentor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Award size={20} />
                </div>
                About the Mentor
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {mentor.description}
              </p>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Experience</h4>
                  <p className="text-gray-600">{mentor.experience}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Philosophy</h4>
                  <p className="text-gray-600">Focused on discipline, character, and correct work habits.</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
                  <Star size={20} />
                </div>
                Mentees Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to work with {mentorUser.name}!</p>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-8 border-b border-gray-50 last:border-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                            {review.menteeName?.[0] || 'M'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{review.menteeName || 'Anonymous'}</div>
                            <div className="text-xs text-gray-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-indigo-50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Per Session</span>
                    <span className="text-4xl font-black text-gray-900">${mentor.price}</span>
                  </div>
                  <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100">
                    60 Min Session
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-indigo-600" />
                      Select Date
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {next7Days.map((date) => (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center transition-all ${
                            isSameDay(date, selectedDate)
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase">{format(date, 'EEE')}</span>
                          <span className="text-lg font-bold">{format(date, 'd')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-indigo-600" />
                      Available Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 rounded-xl text-sm font-bold transition-all border ${
                            selectedSlot === slot
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-600'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleBookSession}
                  disabled={bookingLoading}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                >
                  {bookingLoading ? 'Processing...' : 'Reserve Session'}
                </button>
                
                <p className="text-center text-gray-400 text-xs mt-6 px-4">
                  By booking, you agree to our terms of service and discipline policy.
                </p>
              </div>

              <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-400" size={20} />
                  WisdomBridge Guarantee
                </h3>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>100% Satisfaction or full refund on your first session.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>Secure video calls and integrated chat.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>Direct access to mentor materials and notes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
