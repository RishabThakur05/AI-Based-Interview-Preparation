import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Users, Calendar, TrendingUp, Mic, MessageCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="fade-in">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Master Your Interview Skills with AI
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Practice with AI-powered mock interviews, get real-time feedback, and connect with peers 
          for collaborative interview preparation. Transform your career prospects today.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Sign In
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose InterviewAI?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with real human interaction 
            to provide the most comprehensive interview preparation experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Brain className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Questions</h3>
            <p className="text-gray-600">
              Get personalized interview questions based on your role and experience level, 
              powered by advanced AI algorithms.
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Mic className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Voice-to-Text</h3>
            <p className="text-gray-600">
              Practice speaking naturally with our voice recognition system that converts 
              your speech to text for analysis.
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor your improvement over time with detailed analytics and performance 
              metrics to identify areas for growth.
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Flexible Scheduling</h3>
            <p className="text-gray-600">
              Schedule mock interviews with peers or practice on your own time with 
              our flexible calendar system.
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Peer Interviews</h3>
            <p className="text-gray-600">
              Connect with other candidates for realistic mock interviews with video 
              calls and collaborative Q&A sessions.
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Feedback</h3>
            <p className="text-gray-600">
              Receive instant feedback on your answers with detailed analysis and 
              improvement suggestions from our AI system.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50 rounded-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their interview skills 
            and landed their dream jobs with InterviewAI.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;