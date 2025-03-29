import React from 'react'

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">How do I create a new project?</h3>
            <p className="text-gray-600">Navigate to the dashboard and click on the "New Project" button. Fill in the required details and submit the form.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">How do I track my time?</h3>
            <p className="text-gray-600">Select your project and use the timer controls to start/stop time tracking. You can also manually add time entries.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Need Support?</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="mb-4">Our support team is available Monday to Friday, 9 AM - 5 PM EST.</p>
          <p className="text-blue-600">Email: support@timelith.com</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Getting Started Guide</h2>
        <div className="prose">
          <ul className="list-disc pl-4">
            <li className="mb-2">Create your account and verify your email</li>
            <li className="mb-2">Set up your first project</li>
            <li className="mb-2">Add team members if needed</li>
            <li className="mb-2">Start tracking your time</li>
            <li className="mb-2">Generate reports and analyze your data</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default Help
