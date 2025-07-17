import React, { useState } from 'react';

const CareerCoach = () => {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [resumeFeedback, setResumeFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    targetRole: '',
    experienceLevel: '',
    careerGoal: ''
  });

  // Helper to read file as text (PDF/DOCX support is limited in-browser; for production, send to backend)
  const handleFileChange = async (e) => {
    setFileError('');
    setResumeFeedback(null);
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Please upload a PDF, DOCX, DOC, or TXT file.');
      setResumeText('');
      return;
    }
    // For demo: only read text files in-browser. For PDF/DOCX, send to backend for parsing.
    if (file.type === 'text/plain') {
      const text = await file.text();
      setResumeText(text);
    } else {
      setResumeText('(Resume file uploaded. Will be sent to backend for analysis.)');
    }
  };

  // Placeholder handlers for future AI integration
  const handleAnalyzeResume = async () => {
    setLoading(true);
    // TODO: Send resumeFile to backend for analysis
    setTimeout(() => {
      setResumeFeedback({
        tips: ['Add more quantifiable achievements.', 'Highlight relevant projects.'],
        skillGaps: ['System Design', 'Cloud Computing'],
        recommendations: ['Take a course on AWS', 'Practice system design interviews']
      });
      setLoading(false);
    }, 1500);
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    // TODO: Call backend AI API for roadmap generation using userDetails
    setTimeout(() => {
      setRoadmap([
        `Step 1: Review core concepts for ${userDetails.targetRole || 'your target role'}`,
        userDetails.experienceLevel ? `Step 2: Focus on ${userDetails.experienceLevel} level interview questions` : 'Step 2: Practice interview questions',
        userDetails.careerGoal ? `Step 3: Work towards your goal: ${userDetails.careerGoal}` : 'Step 3: Set a clear career goal',
        'Step 4: Build and deploy a relevant project',
        'Step 5: Network and apply for positions'
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="career-coach-container fade-in" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">AI Career Coach</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Personalized Roadmap</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <input
            type="text"
            className="form-input flex-1"
            placeholder="Target Role (e.g., Frontend Developer)"
            value={userDetails.targetRole}
            onChange={e => setUserDetails({ ...userDetails, targetRole: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            className="form-input flex-1"
            placeholder="Experience Level (e.g., Junior, Mid, Senior)"
            value={userDetails.experienceLevel}
            onChange={e => setUserDetails({ ...userDetails, experienceLevel: e.target.value })}
            disabled={loading}
          />
          <input
            type="text"
            className="form-input flex-1"
            placeholder="Career Goal (e.g., Become a Tech Lead)"
            value={userDetails.careerGoal}
            onChange={e => setUserDetails({ ...userDetails, careerGoal: e.target.value })}
            disabled={loading}
          />
        </div>
        <button className="btn btn-primary mb-2" onClick={handleGenerateRoadmap} disabled={loading || !userDetails.targetRole}>
          {loading ? 'Generating...' : 'Generate My Roadmap'}
        </button>
        {roadmap && (
          <ol className="list-decimal ml-6 mt-2">
            {roadmap.map((step, idx) => <li key={idx}>{step}</li>)}
          </ol>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Resume Analysis & Tips</h2>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="form-input mb-2"
          onChange={handleFileChange}
          disabled={loading}
        />
        {fileError && <div className="text-red-600 mb-2">{fileError}</div>}
        {resumeFile && (
          <div className="mb-2 text-sm text-gray-700">Selected file: {resumeFile.name}</div>
        )}
        <button className="btn btn-secondary mb-2" onClick={handleAnalyzeResume} disabled={loading || !resumeFile}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
        {resumeFeedback && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">Resume Tips</h3>
            <ul className="list-disc ml-6 mb-2">
              {resumeFeedback.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
            <h3 className="font-semibold mb-1">Skill Gaps</h3>
            <ul className="list-disc ml-6 mb-2">
              {resumeFeedback.skillGaps.map((gap, idx) => <li key={idx}>{gap}</li>)}
            </ul>
            <h3 className="font-semibold mb-1">Learning Recommendations</h3>
            <ul className="list-disc ml-6">
              {resumeFeedback.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default CareerCoach; 