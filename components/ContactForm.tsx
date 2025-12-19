import React, { useState, useRef } from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';

declare global {
  interface Window {
    emailjs: any;
  }
}

const ContactForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    // Check if EmailJS is loaded
    if (!window.emailjs) {
      console.error('EmailJS script not loaded');
      setStatus('error');
      return;
    }

    setStatus('sending');

    // NOTE: Replace these placeholders with your actual EmailJS Service ID, Template ID, and Public Key
    // You can find these in your EmailJS dashboard: https://dashboard.emailjs.com/
    const SERVICE_ID = 'service_atdncm5';
    const TEMPLATE_ID = 'template_nlobklo';
    const PUBLIC_KEY = 'Wj1wGSlJqR_HvHw2U';

    window.emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, {
      publicKey: PUBLIC_KEY,
    })
      .then(
        () => {
          setStatus('success');
          if (formRef.current) formRef.current.reset();
        },
        (error: any) => {
          console.error('EmailJS Error:', error);
          setStatus('error');
        },
      );
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-2">
            Get in Touch
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            Have a "What If" story to share? Or just want to say hi? I'd love to hear from you.
          </p>
        </div>

        <div className="bg-card py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-800">
          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name_from" className="block text-sm font-medium text-gray-300">
                Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="name_from"
                  id="name_from"
                  required
                  className="bg-[#1A1B2E] border border-gray-700 block w-full pl-10 pr-3 py-3 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email_from" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email_from"
                  id="email_from"
                  required
                  className="bg-[#1A1B2E] border border-gray-700 block w-full pl-10 pr-3 py-3 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Message
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="bg-[#1A1B2E] border border-gray-700 block w-full pl-10 pr-3 py-3 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors"
                  placeholder="Tell me about your adventure..."
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-300 ${
                  status === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-primary hover:bg-yellow-700 hover:-translate-y-1 shadow-lg shadow-yellow-900/20'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {status === 'sending' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : status === 'success' ? (
                  'Message Sent!'
                ) : (
                  <span className="flex items-center">
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
            
            {status === 'error' && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                Oops! Something went wrong. Please check your console or try again later.
              </div>
            )}
             {status === 'success' && (
              <div className="text-green-400 text-sm text-center bg-green-900/20 p-2 rounded">
                Thank you! I'll get back to you soon.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;