// controller for creating a new resume

import Resume from "../models/Resume.js";
import fs from "fs";
import path from "path";
import imagekit from "../config/imageKit.js";


// post: /api/resumes/create 
    export const createResume = async (req, res) => {
        try {
            const userId = req.userId;
            const {title} = req.body;
            // create new resume
            const newResume = await Resume.create({userId, title});
            return res.status(201).json({message: "Resume created successfully", resume: newResume});
        } catch (error) {
           return res.status(400).json({message: error.message}); 
        }
    }

    //  controller for deleting a resume
    // delete: /api/resumes/delete
    export const deleteResume = async (req, res) => {
        try {
            const userId = req.userId;
            const {resumeId} = req.params;
            // delete the resume
            await Resume.findOneAndDelete({userId, _id: resumeId});
            // return success message
            return res.status(200).json({message: "Resume deleted successfully"});
        } catch (error) {
           return res.status(400).json({message: error.message}); 
        }
    }

    // get user resume by id
    // get: /api/resumes/get
    export const getResumebyId = async (req, res) => {
        try {
            const userId = req.userId;
            const {resumeId} = req.params;
            // get the resume
            const resume = await Resume.findOne({userId, _id: resumeId});
            if(!resume){
                return res.status(404).json({message: "Resume not found"});
            }

            resume.__v = undefined;
            resume.createdAt = undefined;
            resume.updatedAt = undefined;

            return res.status(200).json({resume});
        } catch (error) {
           return res.status(400).json({message: error.message}); 
        }
    }

    // get resume by id public
    // get: /api/resumes/public
    export const getPublicResumebyId = async (req, res) => {
        try {
            const {resumeId} = req.params;
            // get the resume
            const resume = await Resume.findOne({ _id: resumeId, public: true});
            if(!resume){
                return res.status(404).json({message: "Resume not found or is not public"});
            }
            return res.status(200).json({resume});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }
    // controller for updating a resume
    // put: /api/resumes/update
    export const updateResume = async (req, res) => {
        try {
            const userId = req.userId;
            // Accept fields from body (when client sends JSON) or params (when using multipart)
            const resumeId = req.body?.resumeId || req.params?.resumeId;
            const removeBackground = req.body?.removeBackground || req.params?.removeBackground;
            const removeBgFlag = String(removeBackground) === 'true';
            console.log('updateResume: removeBackground raw=', removeBackground, ' -> flag=', removeBgFlag);
            const image = req.file;

            // resumeData may come as an object (JSON request) or as a JSON string (multipart/form-data)
            let resumeDataRaw = req.body?.resumeData || req.params?.resumeData;
            let resumeDataCopy = {};

            if (typeof resumeDataRaw === 'string') {
                try {
                    resumeDataCopy = JSON.parse(resumeDataRaw || '{}');
                } catch (err) {
                    return res.status(400).json({ message: 'Invalid resumeData JSON' });
                }
            } else if (typeof resumeDataRaw === 'object' && resumeDataRaw !== null) {
                resumeDataCopy = resumeDataRaw;
            }

            if (image) {
                const imagePath = image.path;
                console.log('imagekit type:', typeof imagekit, 'keys:', Object.keys(imagekit || {}));
                console.log('imagekit.upload:', typeof imagekit.upload, 'imagekit.uploader.upload:', typeof (imagekit.uploader?.upload));

                const uploadParams = {
                    file: fs.createReadStream(imagePath),
                    fileName: 'resume.png',
                    folder: 'user-resumes',
                    transformation: {
                        // use compact format without spaces; append e-bgremove when requested
                        pre: 'w-300,h-300,fo-face,z-0.75' + (removeBgFlag ? ',e-bgremove' : '')
                    }
                };

                let uploadedUrl = null;
                try {
                    let response;
                    if (typeof imagekit.upload === 'function') {
                        response = await imagekit.upload(uploadParams);
                    } else if (imagekit.uploader && typeof imagekit.uploader.upload === 'function') {
                        response = await imagekit.uploader.upload(uploadParams);
                    } else {
                        throw new Error('no imagekit upload method');
                    }
                    console.log('ImageKit upload response:', response && (response.url || response.data || response.response || response));
                    uploadedUrl = response?.url || response?.data?.url || response?.response?.url;
                } catch (err) {
                    console.error('ImageKit upload failed:', err?.message || err);
                    // Fallback: serve the uploaded file from local uploads folder
                    const filename = path.basename(imagePath);
                    const host = req.protocol + '://' + req.get('host');
                    uploadedUrl = host + '/uploads/' + filename;
                }

                resumeDataCopy.personal_info = resumeDataCopy.personal_info || {};
                resumeDataCopy.personal_info.image = uploadedUrl;
            }

            const resume = await Resume.findOneAndUpdate({ userId, _id: resumeId }, resumeDataCopy, { new: true });

            return res.status(200).json({ message: "Resume updated successfully", resume });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }