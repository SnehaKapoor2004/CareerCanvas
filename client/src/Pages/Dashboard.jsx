import React, { useEffect, useState} from 'react'
import {
  FilePenLineIcon,
  LoaderCircle,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon
} from 'lucide-react'
import { dummyResumeData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
  import api from '../configs/api'


const Dashboard = () => {
   //console.log(import.meta.env.VITE_BASE_URL)
 const {user, token } = useSelector(state => state.auth)
  const colors = ["#7c3aed", "#f59e0b", "#ef4444", "#0284c7", "#16a34a"]


  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] =useState('')
  const [isLoading, setIsLoading] = useState(false)



  const navigate = useNavigate()

  const loadAllResumes = async(event) => {
    try{
   const { data } = await api.get('/api/users/resumes', {headers: {  Authorization: `Bearer ${token}` }})
    setAllResumes(data.resumes)
    }
    catch (error){
     toast.error(error?.response?.data?.message || error.messgae)
    }
  }

  const createResume = async (event) => {
   try {
      event.preventDefault()
      const {data} = await api.post('/api/resumes/create', {title}, {headers: {
        Authorization: `Bearer ${token}`
      }})
      setAllResumes(prev => [data.resume, ...prev])
      setTitle('')
      setShowCreateResume(false)
      navigate(`/app/builder/${data.resume._id}`)
   } catch (error) {
    toast.error(error?.response?.data?.message || error.message)
   }
  }

  const uploadResume = async (event) => {
  event.preventDefault()

  if (!resume) {
    toast.error("Please select a resume file")
    return
  }

  if (!title) {
    toast.error("Please enter a resume title")
    return
  }

  setIsLoading(true)

  try {
    const formData = new FormData()
    formData.append('resume', resume)
    formData.append('title', title)

    const { data } = await api.post(
      '/api/ai/upload-resume',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        // AI parsing can take longer than default timeouts; allow up to 2 minutes for uploads
        timeout: 120000,
      }
    )

    // if server returned the saved resume, use it directly; otherwise fetch it
    let newResumeId = null
    if (data.resume) {
      setAllResumes(prev => [data.resume, ...prev])
      newResumeId = data.resume._id || data.resumeId || null
    } else if (data.resumeId) {
      try {
        const { data: resumeResp } = await api.get(`/api/resumes/get/${data.resumeId}`, { headers: { Authorization: `Bearer ${token}` } })
        setAllResumes(prev => [resumeResp.resume, ...prev])
        newResumeId = data.resumeId
      } catch (err) {
        console.warn('Failed to fetch new resume after upload', err)
      }
    }

    setTitle('')
    setResume(null)
    setShowUploadResume(false)

    // navigate to builder for the newly created resume if we have an id
    if (newResumeId) navigate(`/app/builder/${newResumeId}`)
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message)
  } finally {
    setIsLoading(false)
  }
}


  const editTitle = async (event) => {
  try {
    event.preventDefault()
    const { data } = await api.put(
      `/api/resumes/update/`,
      { resumeId: editResumeId, resumeData: { title } },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    // Replace the updated resume with the server response to ensure all fields match
    setAllResumes(prev => prev.map(resume => resume._id === editResumeId ? data.resume : resume))
     setTitle('')
     setEditResumeId('')
     toast.success(data.message)
  } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
  }
  }

  const deleteResume = async (resumeId) => {
    try {
       const confirmDelete = window.confirm("Are you sure you want to delete this resume?")
    if (confirmDelete) {
     const { data } = await api.delete(
  `/api/resumes/delete/${resumeId}`,
  { headers: { Authorization: `Bearer ${token}` } }
)

      setAllResumes(prev => prev.filter(resume => resume._id !== resumeId))
      toast.success(data.message)
    }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    loadAllResumes()
  }, [])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
          Welcome, {user?.name || 'Guest'}
        </p>

        {/* Create / Upload Buttons */}
        <div className='flex gap-4'>
          <button
            onClick={() => setShowCreateResume(true)}
            className='flex w-full bg-white sm:max-w-36 h-48 flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <PlusIcon className='size-11 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-indigo-600'>Create Resume</p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className='flex w-full bg-white sm:max-w-36 h-48 flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <UploadCloudIcon className='size-11 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-purple-600'>Upload Existing</p>
          </button>

            <button
    onClick={() => navigate("/ats-checker")}
    className='flex w-full bg-white sm:max-w-36 h-48 flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer'
  >
    <div className='size-11 p-2.5 bg-gradient-to-br from-green-300 to-green-500 text-white rounded-full flex items-center justify-center'>
      📄
    </div>

    <p className='text-sm group-hover:text-green-600'>
      ATS Checker
    </p>
  </button>
        </div>

        <hr className='border-slate-300 my-6 sm:w-[305px]' />

        {/* Resume Cards */}
        <div className='grid grid-cols-2 sm:flex flex-wrap gap-4'>
          {allResumes.map((resume, index) => {
            const baseColor = colors[index % colors.length]

            return (
              <button
                key={resume._id}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-xl gap-2 border group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer'
                style={{
                  background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                  borderColor: baseColor + '40'
                }}
              >
                <FilePenLineIcon className="size-8 mb-1" style={{ color: baseColor }} />

                <p className='text-sm font-medium text-center' style={{ color: baseColor }}>
                  {resume.title}
                </p>

                <p className='absolute bottom-2 text-[11px] text-slate-500'>
                  Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                </p>

                <div
                  onClick={e => e.stopPropagation()}
                  className='absolute top-1 right-1 hidden group-hover:flex items-center'
                >
                  <Trash2Icon
                    onClick={() => deleteResume(resume._id)}
                    className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700'
                  />
                  <PencilIcon
                    onClick={() => {
                      setEditResumeId(resume._id)
                      setTitle(resume.title)
                    }}
                    className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700'
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Create Modal */}
          {
            showCreateResume && (
              <form onSubmit={createResume} onClick={()=> setShowCreateResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center' >
              <div onClick={e =>e.stopPropagation()} className='relative bg-slate-0 border shadow-md rounded-lg w-full max-w-sm p-6' >
                <h2 className='text-xl font-bold mb-4'>Create a Resume</h2>
                <input  onChange={(e)=>setTitle(e.target.value)} value={title}type="text" placeholder='Enter resume title' className='
                w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />
                <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>Create Resume</button>
                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=>
                  {setShowCreateResume(false); setTitle(' ')}
                }/>
              </div>
              </form>  
            )
          }      

        {/* Upload Modal */}
              {
            showUploadResume && (
              <form onSubmit={uploadResume} onClick={()=> setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center' >
              <div onClick={e =>e.stopPropagation()} className='relative bg-slate-0 border shadow-md rounded-lg w-full max-w-sm p-6' >
                <h2 className='text-xl font-bold mb-4'>Upload Resume</h2>
                <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='
                w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />
                <div>
                  <label htmlFor='resume-input' className='block text-sm text-slate-700'>
                    Select resume file
                    <div className='flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors'>

                    {resume ? (
                      <p className='text-green-700'>{resume.name}</p>
                    ) :(
                      <>
                      <UploadCloudIcon className='size-14 stroke-1' />
                      <p>upload resume</p>
                      </>
                    )}
                    </div>
                  </label>
                  <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e) => setResume(e.target.files[0])}/>
                </div>
                <button disabled={isLoading} className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify center gap-2'>
                  {isLoading && <LoaderCircle className='animate-spin size-4 text-white'/>}
                  {isLoading ? 'Uploading...' : 'Upload Resume' }
                  Upload Resume
                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=>
                  {setShowUploadResume(false); setTitle(' ')}
                }/>
                </button>
              </div>
              </form>  
            )
          }   
        {/* Edit Modal */}
         {
            editResumeId && (
              <form onSubmit={editTitle} onClick={()=> setEditResumeId(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center' >
              <div onClick={e =>e.stopPropagation()} className='relative bg-slate-0 border shadow-md rounded-lg w-full max-w-sm p-6' >
                <h2 className='text-xl font-bold mb-4'>Edit Resume Title </h2>
                <input  onChange={(e)=>setTitle(e.target.value)} value={title}type="text" placeholder='Enter resume title' className='
                w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />
                <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>Upload Resume</button>
                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=>
                  {setEditResumeId(false); setTitle(' ')}
                }/>
              </div>
              </form>  
            )
          }    

      </div>
    </div>
  )
}

export default Dashboard
