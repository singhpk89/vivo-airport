import { QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const HelpSupport = () => {
  const faqs = [
    { question: 'How do I reset my password?', answer: 'Go to Profile Management and click "Change Password".' },
    { question: 'How do I add new users?', answer: 'Navigate to User Management and click the "Add User" button.' },
    { question: 'Where can I view reports?', answer: 'Reports are available in the Reports section of the admin panel.' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Help & Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <QuestionMarkCircleIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">FAQ</h3>
          <p className="text-gray-500">Find answers to common questions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
          <p className="text-gray-500">Chat with our support team</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <DocumentTextIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Documentation</h3>
          <p className="text-gray-500">Read our comprehensive guides</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h3 className="text-sm font-medium text-gray-900">{faq.question}</h3>
              <p className="mt-2 text-sm text-gray-500">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
