// Downloadable CSV Templates and Sample Datasets

export const CSV_TEMPLATES: Record<string, { filename: string; template: string; sample: string }> = {
  academic: {
    filename: 'edupulse_academic_template.csv',
    template: 'student_id,cgpa,internal_marks,backlogs\n',
    sample: `student_id,cgpa,internal_marks,backlogs
EP-CS-001,8.95,92,0
EP-CS-002,7.20,68,1
EP-IT-003,5.40,44,2
EP-EC-004,8.10,85,0
EP-ME-005,6.15,55,1
`,
  },
  attendance: {
    filename: 'edupulse_attendance_template.csv',
    template: 'student_id,overall_attendance\n',
    sample: `student_id,overall_attendance
EP-CS-001,94.5
EP-CS-002,78.0
EP-IT-003,58.2
EP-EC-004,89.0
EP-ME-005,64.0
`,
  },
  lms: {
    filename: 'edupulse_lms_template.csv',
    template: 'student_id,lms_logins,assignment_completion\n',
    sample: `student_id,lms_logins,assignment_completion
EP-CS-001,35,95
EP-CS-002,18,75
EP-IT-003,6,42
EP-EC-004,28,90
EP-ME-005,8,48
`,
  },
  placement: {
    filename: 'edupulse_placement_template.csv',
    template: 'student_id,aptitude_score,coding_score,mock_interview_score,placement_preparation_participation\n',
    sample: `student_id,aptitude_score,coding_score,mock_interview_score,placement_preparation_participation
EP-CS-001,88,92,85,true
EP-CS-002,62,58,65,true
EP-IT-003,45,38,50,false
EP-EC-004,78,74,80,true
EP-ME-005,52,48,55,false
`,
  },
  skills: {
    filename: 'edupulse_skills_template.csv',
    template: 'student_id,technical_skill_score,soft_skill_score\n',
    sample: `student_id,technical_skill_score,soft_skill_score
EP-CS-001,90,85
EP-CS-002,65,70
EP-IT-003,48,55
EP-EC-004,82,80
EP-ME-005,58,62
`,
  },
  engagement: {
    filename: 'edupulse_engagement_template.csv',
    template: 'student_id,events_participated,club_participation,hackathons,certifications\n',
    sample: `student_id,events_participated,club_participation,hackathons,certifications
EP-CS-001,3,2,2,3
EP-CS-002,1,1,0,1
EP-IT-003,0,0,0,0
EP-EC-004,2,1,1,2
EP-ME-005,1,0,0,1
`,
  },
  feedback: {
    filename: 'edupulse_feedback_template.csv',
    template: 'student_id,student_satisfaction,faculty_feedback\n',
    sample: `student_id,student_satisfaction,faculty_feedback
EP-CS-001,4.8,Excellent
EP-CS-002,3.8,Good
EP-IT-003,2.5,Needs Attention
EP-EC-004,4.2,Good
EP-ME-005,3.0,Average
`,
  },
};
