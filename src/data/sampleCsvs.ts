// Downloadable CSV Templates and Sample Datasets

export const CSV_TEMPLATES: Record<string, { filename: string; template: string; sample: string }> = {
  roster: {
    filename: 'edupulse_full_roster_template.csv',
    template: 'student_id,name,department,academic_year,semester,email,cgpa,internal_marks,backlogs,overall_attendance,aptitude_score,coding_score,mock_interview_score,lms_logins,assignment_completion,technical_skill_score,soft_skill_score\n',
    sample: `student_id,name,department,academic_year,semester,email,cgpa,internal_marks,backlogs,overall_attendance,aptitude_score,coding_score,mock_interview_score,lms_logins,assignment_completion,technical_skill_score,soft_skill_score
STU-NEW-01,Aryan Varma,Computer Science,3rd Year,Sem 6,aryan.varma@edupulse.edu,8.45,88,0,91.5,84,86,80,24,92,85,80
STU-NEW-02,Sneha Patel,Information Technology,3rd Year,Sem 6,sneha.patel@edupulse.edu,7.60,74,0,84.0,72,70,75,18,80,75,78
STU-NEW-03,Karan Malhotra,Electronics,2nd Year,Sem 4,karan.m@edupulse.edu,6.10,56,1,68.5,55,50,58,10,55,60,65
STU-NEW-04,Ananya Deshmukh,Computer Science,3rd Year,Sem 5,ananya.d@edupulse.edu,8.90,92,0,94.0,90,92,88,32,96,88,85
STU-NEW-05,Rohan Mehta,Mechanical,4th Year,Sem 7,rohan.m@edupulse.edu,7.15,65,0,76.0,68,62,70,14,72,70,72
`,
  },
  identity: {
    filename: 'edupulse_student_identity_template.csv',
    template: 'student_id,name,department,academic_year,semester,email\n',
    sample: `student_id,name,department,academic_year,semester,email
STU-NEW-01,Aryan Varma,Computer Science,3rd Year,Sem 6,aryan.varma@edupulse.edu
STU-NEW-02,Sneha Patel,Information Technology,3rd Year,Sem 6,sneha.patel@edupulse.edu
STU-NEW-03,Karan Malhotra,Electronics,2nd Year,Sem 4,karan.m@edupulse.edu
`,
  },
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
