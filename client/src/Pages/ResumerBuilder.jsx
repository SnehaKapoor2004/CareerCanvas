import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../configs/api'
import { dummyResumeData } from '../assets/assets'
import {
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  User,
  FileText,
  FolderIcon,
  Sparkles,
  Share2Icon,
  EyeIcon,
  Download,
  DownloadIcon,
  EyeOffIcon
} from 'lucide-react'

import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummary from '../components/ProfessionalSummary'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectFoem from '../components/ProjectFoem'
import SkillsForm from '../components/SkillsForm'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'



const ResumerBuilder = () => {

  const { resumeId } = useParams();
  const { token } = useSelector(state => state.auth )
  const [resumeData, setResumeData]=useState({
    _id: '',
    title: '',
    personal_info: {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  profession: "",
  linkedin: "",
  website: "",
  image: null,
},

   professional_summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
    })
 const loadExistingResume = async () => {
  try {
    const { data } = await api.get(`/api/resumes/get/${resumeId}`, { headers: { Authorization: `Bearer ${token}` } })
    if (data.resume) {
      setResumeData(prev => ({
        ...prev,
        ...data.resume,
        personal_info: {
          ...prev.personal_info,
          ...(data.resume.personal_info || {})
        }
      }))
      document.title = data.resume.title || document.title;
    }
  } catch (error) {
    console.error('Failed to load resume:', error)
  }
}


  const [activeSectionIndex, setActiveSectionIndex]= useState(0)
  const [removeBackground, setRemoveBackground]= useState(false)
  const sections =[
    {id: 'personal', title: 'Personal Info', icon:User},
    {id: 'summary', title: 'Summary', icon:FileText},
    {id: 'experience', title: 'Experience', icon:Briefcase},
    {id: 'education', title: 'Education', icon:GraduationCap},
    {id: 'projects', title: 'Projects', icon:FolderIcon},
    {id: 'skills', title: 'Skills', icon:Sparkles},
  ]

const activeSection = sections[activeSectionIndex] || sections[0]


  useEffect(()=>{
    loadExistingResume()
  }, [resumeId])

  const changeResumeVisibility= async () => {
   try {
      const formdata = new FormData()
      formdata.append("resumeId", resumeId)
      formdata.append("resumeData", JSON.stringify({public : !resumeData.public}))
        const { data } = await api.put(`/api/resumes/update`, formdata,  { headers: { Authorization: `Bearer ${token}` } })
        setResumeData({...resumeData, public: !resumeData.public})
        toast.success(data.message)

  } catch (error) {
   console.log("Error saving resume:", error)
  }
  }

  const handleShare = () =>{
  const frontendUrl = window.location.href.split('/app/')[0];
  const resumeUrl= frontendUrl + '/view/' + resumeId;

  if (navigator.share) {
    navigator.share({
      title: "My Resume",
      url: resumeUrl,
    });
  } else {
    navigator.clipboard.writeText(resumeUrl);
    alert("Resume link copied!");
  }
}

  const downloadResume= ()=>{
    window.print();
  }

  const saveResume = async ()=>{
    try {
      let updatedResumeData = structuredClone(resumeData)

      // remove image from updatedResumeData
      if(typeof resumeData.personal_info.image == 'object')
      {
        delete updatedResumeData.personal_info.image
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId)
      formData.append('resumeData', JSON.stringify(updatedResumeData))
      formData.append("removeBackground", removeBackground ? 'true' : 'false');
      typeof resumeData.personal_info.image == 'object' && formData.append("image", resumeData.personal_info.image)

      const { data } = await api.put('/api/resumes/update', formData, {headers : {Authorization: `Bearer ${token}` }})
      setResumeData(data.resume)
      return { message: data.message }
    } catch (error) {
      console.error("Error saving resume:", error)
      throw error
    }
  }
  
  return(
    <div>
    <div className='max-w-7xl mx-auto px-4 py-6'>
        <Link to={"/app"} className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'> <ArrowLeftIcon className="size-4" />Back to Dashboard</Link>
       </div>

       <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Left Panel */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/*progress bar using activeSectionIndex*/}
              <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200'/>
              <hr className='absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000'
              style={{width: `${activeSectionIndex * 100 / (sections.length-1)}%`}}/>

              {/* section navigation */}
              <div className='flex justify-between items-center mb-6 border-b border-gray-300 py-1'>
                <div className='flex  items-center mb-6 gap-2'> 
                  <TemplateSelector selectedTemplate={resumeData.template} onTemplateChange={(template)=>setResumeData(prev => ({...prev, template}))}/>
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=>setResumeData(prev => ({...prev, accent_color: color}))}/>
  
                </div>
                <div className='flex items-center'>
                  {activeSectionIndex!==0 && (
                    <button onClick={()=> setActiveSectionIndex((prevIndex)=> Math.max(prevIndex-1, 0))} className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex===0}> <ChevronLeft className='size-4'/>Previous</button>
                  )}

                  <button onClick={()=> setActiveSectionIndex((prevIndex)=> Math.min(prevIndex+1, sections.length-1))} className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex===sections.length-1 && `opacity-50`}`} disabled={activeSectionIndex===sections.length-1}> <ChevronRight className='size-4'/>Next</button>
                </div>

              </div>
              {/* form Content */}
              <div className='space-y-6'>
                {activeSection.id==='personal' && (
                 <PersonalInfoForm
  data={resumeData.personal_info}
  onChange={(updatedFields) =>
    setResumeData(prev => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        ...updatedFields
      }
    }))
  }
  removeBackground={removeBackground}
  setRemoveBackground={setRemoveBackground}
/>

                  )}
                  {activeSection.id==='summary' && (
                    <ProfessionalSummary data={resumeData.professional_summary} onChange={(value)=>setResumeData(prev => ({...prev, professional_summary: value}))} />
                  )}
                  {activeSection.id==='experience' && (
                    <ExperienceForm data={resumeData.experience} OnChange={(data)=> setResumeData(prev => ({...prev, experience: data}))}/>
                  )}
                  {activeSection.id==='education' && (
                    <EducationForm data={resumeData.education} OnChange={(data)=> setResumeData(prev => ({...prev, education: data}))}/>
                  )}
                  {activeSection.id==='projects' && (
                    <ProjectFoem data={resumeData.projects} OnChange={(data)=> setResumeData(prev => ({...prev, projects: data}))}/>
                  )}
                  {activeSection.id==='skills' && (
                    <SkillsForm data={resumeData.skills} onChange={(data)=> setResumeData(prev => ({...prev, skills: data}))}/>
                  )}
              </div>
    <div className="mt-4 pl-3">
      <button type="button" onClick={() => toast.promise(saveResume(), {loading: 'Saving....', success: (res) => res?.message || 'Saved', error: (err) => err?.response?.data?.message || 'Failed'})} className='inline-flex items-center px-4 py-2 text-sm bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-1 ring-green-300 hover:ring-green-400 transition-colors shadow-sm'>
        Save Changes
      </button>
    </div>
            </div>
     
          </div>
          {/* Right Panel */}
          <div className='lg:col-span-7 max-lg:mt-6'>
            <div className='relative w-full'>
              
              <div className='absolute bottom-3 right-3 flex items-center justify-end gap-2'>

                {resumeData.public && (
                  <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                    <Share2Icon className="size-4"></Share2Icon>Share
                  </button>

                )}
                <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors'>
                 {resumeData.public ? (
              <EyeIcon className="size-4" />
              ) : (
           <EyeOffIcon className="size-4" />
           )}
             {resumeData.public ? 'Public' : 'Private'}
                </button>
            <button onClick={downloadResume} className='flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
              <DownloadIcon className='size-4'/>Download

            </button>
              </div>
           
            </div>
             <ResumePreview data={resumeData} template={resumeData.template}
             accentColor={resumeData.accent_color}/>

          </div>

        </div>

       </div>
    </div>
  )
}

export default ResumerBuilder