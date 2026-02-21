import React from 'react';
import { Sparkles, Target, ShieldAlert, ArrowRight, MessageSquareHeart, History, Compass, Flag } from 'lucide-react';
import { motion } from 'motion/react';
import { AUTHORS } from '../authors';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const haiDao = AUTHORS['hai-dao'];

  return (
    <div className="min-h-screen bg-dark py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Developer Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 bg-card/50 p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Compass className="w-64 h-64 text-primary" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <img
              src={haiDao.avatar}
              alt={haiDao.name}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-primary shadow-2xl object-cover"
            />
            <div className="text-center md:text-left">
              <h2 className="font-serif text-4xl font-bold text-white mb-2">{haiDao.name}</h2>
              <p className="text-primary font-medium mb-6 uppercase tracking-widest text-sm">Founder & Developer</p>

              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <span className="text-white font-bold flex items-center gap-2 mb-1"><History className="w-4 h-4 text-primary" /> My History:</span>
                  I started as a software engineer who spent more time in front of screens than in the real world. I realized that while I was building digital worlds, I was missing out on the one I actually lived in. In the process, I came to the realization that many other people are just like me, trapped in the boring and meaningless cycle of waking up and working on things that does not truly align with their life's purpose. This blog was born from a desire to bridge that gap and document the transition from "safe" to "curious."
                </p>
                <p>
                  <span className="text-white font-bold flex items-center gap-2 mb-1"><Compass className="w-4 h-4 text-primary" /> My Motivation:</span>
                  The "What If" Network isn't just a blog; it's a philosophy. I'm motivated by the belief that as we grow up in the world, we came across many challenges and other people with limiting beliefs telling us to be 'practical' and 'safe'. As a result, most of us suppressed our emotions and dreams, too afraid to try something that stand out from the norms. I wanted to create a space that validates the messiness of growth and encourages other people to ask their own "What If" questions.
                </p>
                <p>
                  <span className="text-white font-bold flex items-center gap-2 mb-1"><Flag className="w-4 h-4 text-primary" /> My Goal:</span>
                  My ultimate goal is to build a global community of explorers who support each other's experiments. I want this platform to be a catalyst for real-world action, where stories of failure are just as celebrated as stories of success, as long as they started with a brave question. What is your life's purpose? Most people walked the safe path of working in a stable job their entire life, and despite making hundreds of thousands of dollar, they are still disappointed with their life. Happiness isn't about material riches, it is a state of mind. I hope to reignite that burning fire that has been almost extinguished by the struggles and expectations of life.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-yellow-700 transition-all shadow-lg hover:-translate-y-1"
                >
                  <MessageSquareHeart className="w-5 h-5 mr-2" />
                  Join the Movement & Give Feedback
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">
            The <span className="text-primary italic">"What If"</span> Journey
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A more casual space where I share the raw behind-the-scenes of my experiments,
            the lessons learned in real-time, and the hurdles I'm currently jumping over.
          </p>
        </motion.div>

        <div className="grid gap-12">
          {/* Highlights Section */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 rounded-2xl border border-gray-800 shadow-xl"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary/10 rounded-lg mr-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">Recent Highlights</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                Some of the things I have learned recently.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  "Started this website and social media platform to share my perspective",
                  "Faced my fear (and discover new fear) one step at a time",
                  "Connected with a few other creators in the same niche",
                  "Started documenting all of my personal experiences"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-primary mr-2 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Goal Section */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 rounded-2xl border border-gray-800 shadow-xl"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary/10 rounded-lg mr-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">The Next Big "What If"</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                My goal is to help connect people to help them accomplish things that they would have never even dreamed of.
                Each of us are good at our own things, but together we can be great at everything.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  "Spread the mission to more people on the street",
                  "Ask people to share their personal 'What If' stories",,
                  "Host the first 'What If' community meetup",
                  "Continue stepping outside my comfort zone and embracing the unexpected"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-primary mr-2 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Challenges Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 rounded-2xl border border-gray-800 shadow-xl"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary/10 rounded-lg mr-4">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">The Challenges</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="text-lg leading-relaxed">
                Here are some challenges currently blocking my progress.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  "I want to connect on a deeper level with people by asking more thought-provoking questions",
                  "I want to connect with more adventurous and spontaneous individuals",
                  "I want to get better at being more active with social media to establish a network",
                  "I want to reduce the technical barrier from ideation to creation for this blog"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <ArrowRight className="w-5 h-5 text-primary mr-2 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 text-center"
        >
          <p className="text-gray-500 italic">
            "The only way to find out is to try."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
