import React from 'react'
import StatsCard from './_components/stats-card'  
import { getAssessments } from '@/actions/interview'
import PerformanceChart from './_components/performance-chart'
import QuizList from './_components/quiz-list'

const InterviewPage = async () => {  // Add async here

  try {
    const assessments = await getAssessments();

    return (
      <div>
        <h1 className='text-6xl font-bold gradient-title mb-5'>
          Interview Preparation
        </h1>
        <div className='space-y-6'>
          {/* Fixed component name and prop name */}
          <StatsCard assessments={assessments} />
          <PerformanceChart assessments={assessments} />
          <QuizList assessments={assessments} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading assessments:", error);
    return (
      <div>
        <h1 className='text-6xl font-bold gradient-title mb-5'>
          Interview Preparation
        </h1>
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-600">Error loading assessment data. Please try again.</p>
        </div>
      </div>
    );
  }
}

export default InterviewPage;