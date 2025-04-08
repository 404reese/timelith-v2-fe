import React from 'react'

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      
      <section className="mb-8">
        <a href="">
        <button className="">
          Talk to agent
        </button>
        </a>
        
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <div className="prose bg-gray-50 p-6 rounded-lg">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Account Setup</strong>
              <p className="text-gray-600 ml-4">Sign up and verify your email address to activate your account.</p>
            </li>
            <li>
              <strong>Profile Configuration</strong>
              <p className="text-gray-600 ml-4">Complete your profile settings including timezone and working hours.</p>
            </li>
            <li>
              <strong>Create Your First Project</strong>
              <p className="text-gray-600 ml-4">Click "New Project" from the dashboard and fill in project details.</p>
            </li>
            <li>
              <strong>Invite Team Members</strong>
              <p className="text-gray-600 ml-4">Go to Team Settings to add collaborators with appropriate permissions.</p>
            </li>
            <li>
              <strong>Start Tracking Time</strong>
              <p className="text-gray-600 ml-4">Use the timer or manually log hours against projects and tasks.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">How do I reset my password?</h3>
            <p className="text-gray-600">Click "Forgot Password" on the login page and follow the instructions sent to your email.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Can I change my project settings after creation?</h3>
            <p className="text-gray-600">Yes, navigate to Project Settings from the project dashboard to modify details.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">How do I export my time data?</h3>
            <p className="text-gray-600">Go to Reports, select your date range and projects, then click "Export" to download CSV or PDF.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">What browsers are supported?</h3>
            <p className="text-gray-600">We support Chrome, Firefox, Safari, and Edge (latest versions).</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">How do I set up integrations?</h3>
            <p className="text-gray-600">Visit the Integrations section in Settings to connect with other tools like Slack, Jira, or Google Calendar.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Video Tutorials</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Basic Setup Walkthrough</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded mb-2">
              {/* Video placeholder - replace with actual embed */}
              <div className="flex items-center justify-center h-full text-gray-500">
                [Video Embed]
              </div>
            </div>
            <p className="text-gray-600">5 min • Beginner</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Advanced Reporting Features</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded mb-2">
              <div className="flex items-center justify-center h-full text-gray-500">
                [Video Embed]
              </div>
            </div>
            <p className="text-gray-600">12 min • Advanced</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
          <h3 className="font-medium mb-2">Common Issues</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Timer not syncing? Try refreshing the page or clearing your browser cache</li>
            <li>Missing project data? Check your filters in the reports section</li>
            <li>Invitation emails not arriving? Verify the email address and check spam folder</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Need Support?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-medium mb-3">Contact Options</h3>
            <p className="mb-2"><span className="font-semibold">Email:</span> support@timelith.com</p>
            <p className="mb-2"><span className="font-semibold">Live Chat:</span> Available in-app during business hours</p>
            <p className="mb-2"><span className="font-semibold">Phone:</span> (800) 555-1234 (9AM-5PM EST)</p>
            <p className="text-sm text-gray-500">Average response time: 2 hours during business days</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-medium mb-3">Community Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-green-600 hover:underline">Knowledge Base</a></li>
              <li><a href="#" className="text-green-600 hover:underline">User Forum</a></li>
              <li><a href="#" className="text-green-600 hover:underline">Feature Requests</a></li>
              <li><a href="#" className="text-green-600 hover:underline">Upcoming Webinars</a></li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Still Need Help?</h2>
          <p className="mb-4">Submit a support ticket and we'll get back to you as soon as possible.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Open Support Ticket
          </button>
        </div>
      </section>
    </div>
  )
}

export default Help