import hbs from "hbs";
import mongoose from "mongoose";
const ResumeSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title: {type: String, default: "My Resume"},
    public: {type: Boolean, default: false},
    template: {type: String, default: "classic"},
    accent_color: {type: String, default: "#3B82F6"},
    professional_summary: {type: String, default: ""},
    skills: [{type: String}],
    personal_info: {
        image: {type: String, default: ""},
        full_name: {type: String, default: ""},
        profession: {type: String, default: ""},
        email: {type: String, default: ""},
        phone: {type: String, default: ""},
        location: {type: String, default: ""},
        linkedin: {type: String, default: ""},
        website: {type: String, default: ""},
    },
    experience: [
        {
            company: {type: String, default: ""},
            position: {type: String, default: ""},
            start_date: {type: String, default: ""},    
            end_date: {type: String, default: ""},
            description: {type: String, default: ""},
            is_current: {type: Boolean, default: false},

        }
    ],
    projects: [
        {
            name: {type: String, default: ""},  
            description: {type: String, default: ""},
           type: {type: String, default: ""},

        }
    ],
    education: [
        {
            institution: {type: String, default: ""},  
            degree: {type: String, default: ""},
            field: {type: String, default: ""},
            graduation_date: {type: String, default: ""},
            gpa: {type: String, default: ""},
        } 
        ],
}, {timestamps: true, minimize: false});

const Resume = mongoose.model("Resume", ResumeSchema);
export default Resume;