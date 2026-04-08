import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Shield, Target, Users, Zap, ArrowRight, Star, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold mb-8 border border-indigo-100">
              <Star size={16} fill="currentColor" />
              <span>The #1 Platform for Disciplined Mentoring</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
              Bridge the Gap Between <br />
              <span className="text-indigo-600">Potential and Mastery</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              WisdomBridge connects you with elite mentors for 1-on-1 guidance. 
              Transform your life through discipline, confidence, and the correct way of working.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/mentors"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
              >
                Find Your Mentor <ArrowRight size={20} />
              </Link>
              <Link
                to="/signup?role=mentor"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                Become a Mentor
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Mentors', value: '500+' },
              { label: 'Success Stories', value: '10k+' },
              { label: 'Avg. Rating', value: '4.9/5' },
              { label: 'Hours Mentored', value: '50k+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Built on Four Pillars of Excellence</h2>
            <p className="text-lg text-gray-600">We don't just teach skills; we transform characters through a structured, personal approach.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="text-indigo-600" size={32} />,
                title: 'Discipline',
                desc: 'Learn the habits that separate the elite from the average.'
              },
              {
                icon: <Zap className="text-indigo-600" size={32} />,
                title: 'Confidence',
                desc: 'Build unwavering self-belief through competence and action.'
              },
              {
                icon: <Target className="text-indigo-600" size={32} />,
                title: 'Correct Work',
                desc: 'Master the methods and systems for maximum efficiency.'
              },
              {
                icon: <Users className="text-indigo-600" size={32} />,
                title: 'Personalized',
                desc: '1-on-1 sessions tailored to your unique character and goals.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Start Your Transformation?</h2>
              <p className="text-xl text-indigo-100 mb-12">Join thousands of mentees who have already bridged the gap to their best selves.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
                >
                  Get Started Today
                </Link>
                <Link
                  to="/mentors"
                  className="w-full sm:w-auto px-10 py-4 bg-indigo-500 text-white rounded-2xl font-bold text-lg hover:bg-indigo-400 transition-all border border-indigo-400"
                >
                  View All Mentors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
