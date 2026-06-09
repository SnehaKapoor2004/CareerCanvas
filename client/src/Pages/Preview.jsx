import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { dummyResumeData } from '../assets/assets'
import ResumePreview from '../components/ResumePreview'

const Preview = () => {
  const { resumeId } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)

  const loadResume = () => {
    const resume = dummyResumeData.find(
      resume => resume._id === resumeId
    )
    setResumeData(resume || null)
    setIsLoading(false)
  }

  useEffect(() => {
    loadResume()
  }, [resumeId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!resumeData) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <p className='text-center text-4xl text-slate-400 font-medium'>
          Resume not found
        </p>
        <Link
          to="/"
          className='mt-6 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 ring-1 ring-green-400 flex items-center transition-colors'
        >
          <ArrowLeftIcon className='mr-2 size-4' />
          Go to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className='bg-slate-100 min-h-screen'>
      <div className='max-w-3xl mx-auto py-10'>
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          classes='py-4 bg-white'
        />
      </div>
    </div>
  )
}

export default Preview
