import React, { useState, useMemo } from 'react';
import {
  GraduationCap, BookOpen, HelpCircle, FileText, CheckCircle2,
  Clock, Download, Eye, Award, Sparkles, Filter, Search,
  ChevronRight, Calendar, AlertCircle, UploadCloud, X, ArrowRight,
  RotateCcw, Check, FileCheck, Layers, ExternalLink, Play, Tag,
  BarChart2, Zap
} from 'lucide-react';
import {
  CLASSROOM_DATA,
  SubjectClassroomInfo,
  ClassroomQuiz,
  ClassroomResource,
  ClassroomAssignment,
  ClassroomAssessment
} from '../../data/classroomData';
import { useCurrentStudent } from '../../context/CampusDataContext';
import { useActionInfo } from '../../context/ActionInfoContext';
import { SpecPageHeader, SpecKpiCard } from '../../components/common/SpecComponents';

export function StudentClassroomPage() {
  const currentStudent = useCurrentStudent();
  const { showActionInfo } = useActionInfo();

  // Find all subjects from student profile or default to our 5 subjects
  const subjectCodes = Object.keys(CLASSROOM_DATA);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(subjectCodes[0] || 'CS501');
  const [activeTab, setActiveTab] = useState<'quizzes' | 'resources' | 'assignments' | 'assessments'>('quizzes');

  // Resource filters
  const [resourceCategory, setResourceCategory] = useState<string>('All');
  const [resourceSearch, setResourceSearch] = useState<string>('');
  const [previewResource, setPreviewResource] = useState<ClassroomResource | null>(null);

  // Assignment filters & submission modal
  const [assignmentFilter, setAssignmentFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Graded'>('All');
  const [submittingAssignment, setSubmittingAssignment] = useState<ClassroomAssignment | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Interactive Quiz state
  const [activeQuiz, setActiveQuiz] = useState<ClassroomQuiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ score: number; maxScore: number; percentage: number } | null>(null);

  // Assessment filter & revision checklist tracking
  const [assessmentFilter, setAssessmentFilter] = useState<'All' | 'Upcoming' | 'Completed'>('All');
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  // Dynamic classroom state per subject (to allow live submissions and quiz retakes)
  const [classroomDataState, setClassroomDataState] = useState<Record<string, SubjectClassroomInfo>>(CLASSROOM_DATA);

  // Notification toast helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const subjectData: SubjectClassroomInfo = classroomDataState[selectedSubjectCode] || CLASSROOM_DATA['CS501'];

  // Global KPI Metrics across all subjects
  const globalMetrics = useMemo(() => {
    let totalQuizzes = 0;
    let completedQuizzes = 0;
    let totalScore = 0;
    let totalAssignments = 0;
    let submittedAssignments = 0;
    let pendingAssignments = 0;
    let upcomingAssessmentsCount = 0;

    Object.values(classroomDataState).forEach(sub => {
      sub.quizzes.forEach(q => {
        totalQuizzes++;
        if (q.status === 'Completed' && q.lastPercentage !== undefined) {
          completedQuizzes++;
          totalScore += q.lastPercentage;
        }
      });
      sub.assignments.forEach(a => {
        totalAssignments++;
        if (a.status === 'Submitted' || a.status === 'Graded') submittedAssignments++;
        if (a.status === 'Pending') pendingAssignments++;
      });
      sub.assessments.forEach(asm => {
        if (asm.status === 'Upcoming') upcomingAssessmentsCount++;
      });
    });

    const avgQuizScore = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0;

    return {
      totalSubjects: Object.keys(classroomDataState).length,
      totalQuizzes,
      completedQuizzes,
      avgQuizScore,
      totalAssignments,
      submittedAssignments,
      pendingAssignments,
      upcomingAssessmentsCount
    };
  }, [classroomDataState]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return subjectData.resources.filter(res => {
      const matchesCat = resourceCategory === 'All' || res.category === resourceCategory;
      const matchesSearch =
        !resourceSearch.trim() ||
        res.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        res.description.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        res.topicsCovered.some(t => t.toLowerCase().includes(resourceSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [subjectData.resources, resourceCategory, resourceSearch]);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return subjectData.assignments.filter(asn => {
      if (assignmentFilter === 'All') return true;
      return asn.status === assignmentFilter;
    });
  }, [subjectData.assignments, assignmentFilter]);

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return subjectData.assessments.filter(asm => {
      if (assessmentFilter === 'All') return true;
      return asm.status === assessmentFilter;
    });
  }, [subjectData.assessments, assessmentFilter]);

  // ─── QUIZ HANDLERS ────────────────────────────────────────────────────────────

  const startQuiz = (quiz: ClassroomQuiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const pct = Math.round((correctCount / activeQuiz.questions.length) * 100);
    const earnedScore = Math.round((pct / 100) * activeQuiz.maxScore);

    setQuizScore({
      score: earnedScore,
      maxScore: activeQuiz.maxScore,
      percentage: pct
    });
    setQuizSubmitted(true);

    // Update state for this quiz
    setClassroomDataState(prev => {
      const currentSub = prev[selectedSubjectCode];
      if (!currentSub) return prev;
      const updatedQuizzes = currentSub.quizzes.map(q => {
        if (q.id === activeQuiz.id) {
          return {
            ...q,
            status: 'Completed' as const,
            lastScore: earnedScore,
            lastPercentage: pct
          };
        }
        return q;
      });
      return {
        ...prev,
        [selectedSubjectCode]: {
          ...currentSub,
          quizzes: updatedQuizzes
        }
      };
    });

    showToast(`Quiz completed! You scored ${earnedScore}/${activeQuiz.maxScore} (${pct}%)`);
  };

  // ─── ASSIGNMENT SUBMISSION HANDLER ────────────────────────────────────────────

  const handleOpenSubmitAssignment = (asn: ClassroomAssignment) => {
    setSubmittingAssignment(asn);
    setSubmissionFileName(`${currentStudent.roll_no}_${asn.subjectCode}_Assignment.pdf`);
    setSubmissionNotes('');
    setSubmissionSuccess(null);
  };

  const handleConfirmAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    const todayStr = new Date().toISOString().split('T')[0];

    setClassroomDataState(prev => {
      const currentSub = prev[selectedSubjectCode];
      if (!currentSub) return prev;
      const updatedAsn = currentSub.assignments.map(a => {
        if (a.id === submittingAssignment.id) {
          return {
            ...a,
            status: 'Submitted' as const,
            submissionDate: todayStr,
            submittedFileName: submissionFileName
          };
        }
        return a;
      });
      return {
        ...prev,
        [selectedSubjectCode]: {
          ...currentSub,
          assignments: updatedAsn
        }
      };
    });

    setSubmissionSuccess(`Successfully submitted "${submittingAssignment.title}"!`);
    showToast(`Assignment "${submittingAssignment.title}" submitted successfully!`);
    setTimeout(() => {
      setSubmittingAssignment(null);
      setSubmissionSuccess(null);
    }, 1200);
  };

  // ─── CHECKLIST TOGGLE ─────────────────────────────────────────────────────────

  const toggleChecklistTopic = (topicKey: string) => {
    setCheckedTopics(prev => ({
      ...prev,
      [topicKey]: !prev[topicKey]
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-xl backdrop-blur-md animate-slide-in">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <SpecPageHeader
        title="Classroom & Subject Hub"
        subtitle={`Interactive quizzes, lecture resources, assignments, and exam assessments for ${currentStudent.name} (${currentStudent.roll_no})`}
        semesterChip="Semester 5"
        standingChip={{ text: 'Enrolled & Active', variant: 'accent' }}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-text-muted">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>5 Core CS Modules</span>
          </div>
        }
      />

      {/* Top Classroom Global KPIs */}
      <div className="grid grid-cols-12 gap-4">
        <SpecKpiCard
          label="ACTIVE SUBJECTS"
          number={globalMetrics.totalSubjects}
          caption="All 5 core CS modules enrolled"
          icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
          statusChip={{ text: '5 Courses', variant: 'accent' }}
          percent={100}
        />
        <SpecKpiCard
          label="QUIZZES MASTERED"
          number={`${globalMetrics.completedQuizzes}/${globalMetrics.totalQuizzes}`}
          caption={`Avg accuracy: ${globalMetrics.avgQuizScore}%`}
          icon={<Award className="w-5 h-5 text-emerald-400" />}
          statusChip={{ text: `${globalMetrics.avgQuizScore}%`, variant: 'success' }}
          percent={globalMetrics.avgQuizScore}
        />
        <SpecKpiCard
          label="ASSIGNMENTS DONE"
          number={`${globalMetrics.submittedAssignments}/${globalMetrics.totalAssignments}`}
          caption={`${globalMetrics.pendingAssignments} pending submission`}
          icon={<FileCheck className="w-5 h-5 text-blue-400" />}
          statusChip={
            globalMetrics.pendingAssignments > 0
              ? { text: `${globalMetrics.pendingAssignments} Due`, variant: 'warning' }
              : { text: 'All Submitted', variant: 'success' }
          }
          percent={Math.round((globalMetrics.submittedAssignments / (globalMetrics.totalAssignments || 1)) * 100)}
        />
        <SpecKpiCard
          label="UPCOMING EXAMS"
          number={globalMetrics.upcomingAssessmentsCount}
          caption="CIE-2 exams approaching"
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
          statusChip={{ text: 'Nov 2025', variant: 'neutral' }}
        />
      </div>

      {/* Subject Switcher Cards / Tabs */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Select Academic Subject</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Instructor: <strong className="text-foreground">{subjectData.faculty}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {subjectCodes.map(code => {
            const sub = classroomDataState[code] || CLASSROOM_DATA[code];
            const isSelected = selectedSubjectCode === code;
            const pendingAsnCount = sub.assignments.filter(a => a.status === 'Pending').length;

            return (
              <button
                key={code}
                onClick={() => {
                  setSelectedSubjectCode(code);
                  setActiveQuiz(null);
                }}
                className={`relative flex flex-col items-start p-3.5 rounded-xl text-left transition-all duration-200 border ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-card-hover/40 border-border hover:border-cyan-500/30 hover:bg-card-hover'
                }`}
              >
                {pendingAsnCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {pendingAsnCount} due
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-cyan-400">{sub.code}</span>
                <span className="text-sm font-semibold text-foreground line-clamp-1 mt-0.5">{sub.name}</span>
                <span className="text-[11px] text-muted-foreground truncate w-full mt-1">{sub.faculty}</span>

                {/* Progress Mini Bar */}
                <div className="w-full mt-2.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Syllabus</span>
                    <span className="font-medium text-foreground">{sub.syllabusCoveredPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${sub.syllabusCoveredPct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Core Module Navigation Tabs (Quizzes, Resources, Assignments, Assessments) */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'quizzes'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Interactive Quizzes</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 font-bold">
            {subjectData.quizzes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Study Resources</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 font-bold">
            {subjectData.resources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Assignments</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 font-bold">
            {subjectData.assignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'assessments'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Assessments & Exams</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 font-bold">
            {subjectData.assessments.length}
          </span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. QUIZZES SECTION                                                         */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Active Quiz Runner Modal / Inline View */}
          {activeQuiz ? (
            <div className="p-6 rounded-2xl bg-card border border-cyan-500/40 shadow-xl space-y-6 animate-fade-in">
              {/* Quiz Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300">
                      {activeQuiz.subjectCode}
                    </span>
                    <span className="text-xs text-muted-foreground">{activeQuiz.module}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-1">{activeQuiz.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-hover border border-border text-xs text-muted-foreground">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Time Limit: {activeQuiz.timeLimitMinutes} mins</span>
                  </div>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quiz Results Screen */}
              {quizSubmitted && quizScore ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent border border-cyan-500/30 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
                      <Award className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground">Quiz Completed!</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Great effort! Your score has been calculated and updated in your academic performance records.
                    </p>

                    <div className="flex items-center justify-center gap-8 pt-3">
                      <div>
                        <div className="text-3xl font-extrabold text-cyan-400">{quizScore.score}/{quizScore.maxScore}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Points Earned</div>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <div>
                        <div className="text-3xl font-extrabold text-emerald-400">{quizScore.percentage}%</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Accuracy Rate</div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => startQuiz(activeQuiz)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-md"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Quiz</span>
                      </button>
                    </div>
                  </div>

                  {/* Detailed Question Review */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Detailed Solutions & Explanations ({activeQuiz.questions.length} Questions)
                    </h5>

                    {activeQuiz.questions.map((q, idx) => {
                      const studentSelected = selectedAnswers[idx];
                      const isCorrect = studentSelected === q.correctIndex;

                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-xl border ${
                            isCorrect
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : 'bg-rose-500/5 border-rose-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-sm font-semibold text-foreground">
                              {idx + 1}. {q.question}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${
                                isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {isCorrect ? 'Correct (+5)' : 'Incorrect (0)'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                            {q.options.map((opt, optIdx) => {
                              const isThisCorrect = optIdx === q.correctIndex;
                              const isThisSelected = optIdx === studentSelected;

                              let optClass = 'bg-card/50 border-border text-muted-foreground';
                              if (isThisCorrect) optClass = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold';
                              else if (isThisSelected && !isThisCorrect) optClass = 'bg-rose-500/15 border-rose-500/50 text-rose-300';

                              return (
                                <div key={optIdx} className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${optClass}`}>
                                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-card border border-border">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-3 p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground">
                            <strong className="text-cyan-400">Concept Explanation: </strong>
                            {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Question Carousel / Step-by-Step Question Interface */
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Question <strong className="text-foreground">{currentQuestionIdx + 1}</strong> of{' '}
                      <strong className="text-foreground">{activeQuiz.questions.length}</strong>
                    </span>
                    <span>
                      Answered: {Object.keys(selectedAnswers).length} / {activeQuiz.questions.length}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%`
                      }}
                    />
                  </div>

                  {/* Active Question */}
                  {(() => {
                    const q = activeQuiz.questions[currentQuestionIdx];
                    if (!q) return null;
                    const selectedOpt = selectedAnswers[currentQuestionIdx];

                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-card-hover/40 border border-border">
                          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                            Question {currentQuestionIdx + 1}
                          </span>
                          <h4 className="text-base font-semibold text-foreground">{q.question}</h4>
                        </div>

                        {/* Options */}
                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedOpt === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(currentQuestionIdx, optIdx)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm'
                                    : 'bg-card hover:bg-card-hover border-border text-foreground'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${
                                    isSelected
                                      ? 'bg-cyan-500 text-black border-cyan-400'
                                      : 'bg-card-hover border-border text-muted-foreground'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="text-sm font-medium">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation & Submit Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIdx === 0}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-card-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-sm"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Quiz for Grading</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quizzes List Cards */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Available Quizzes for {subjectData.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Test your conceptual understanding and earn continuous evaluation points.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectData.quizzes.map(quiz => {
                  const isCompleted = quiz.status === 'Completed';

                  return (
                    <div
                      key={quiz.id}
                      className="p-5 rounded-2xl bg-card border border-border hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {quiz.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              quiz.difficulty === 'Easy'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : quiz.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {quiz.difficulty}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-foreground line-clamp-2">{quiz.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{quiz.module}</p>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{quiz.questionsCount} Questions</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{quiz.timeLimitMinutes} Mins</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Max {quiz.maxScore} Pts</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Due {quiz.dueDate}</span>
                          </div>
                        </div>

                        {/* Past Score Badge if completed */}
                        {isCompleted && quiz.lastScore !== undefined && (
                          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                            <span className="text-emerald-400 font-medium">Completed Score:</span>
                            <span className="font-extrabold text-emerald-300">
                              {quiz.lastScore}/{quiz.maxScore} ({quiz.lastPercentage}%)
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => startQuiz(quiz)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                          isCompleted
                            ? 'bg-card border border-border text-foreground hover:bg-card-hover hover:border-cyan-500/40'
                            : 'bg-cyan-500 text-black hover:bg-cyan-400'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Review / Retake Quiz</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Interactive Quiz</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. RESOURCES SECTION                                                       */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Resource Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Notes', 'Slides', 'Code', 'Cheat Sheet', 'Video'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setResourceCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    resourceCategory === cat
                      ? 'bg-cyan-500 text-black'
                      : 'bg-card-hover text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes, slides, code..."
                value={resourceSearch}
                onChange={e => setResourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(res => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {res.fileFormat} · {res.fileSize}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-card-hover text-muted-foreground border border-border">
                      {res.category}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-foreground line-clamp-2">{res.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{res.description}</p>

                  {/* Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {res.topicsCovered.map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-card-hover text-muted-foreground border border-border">
                        #{topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border">
                    <span>Uploaded by {res.uploadedBy}</span>
                    <span>{res.downloadsCount} downloads</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreviewResource(res)}
                    className="py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-card-hover hover:border-cyan-500/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Downloading "${res.title}" (${res.fileSize})...`);
                      showActionInfo({
                        title: `Course Resource Prepared: ${res.title}`,
                        badge: `${res.fileFormat} · ${res.fileSize}`,
                        category: 'export',
                        message: `Official digital curriculum asset ready for offline student reference. Verified by ${res.uploadedBy}.`,
                        details: [
                          `Course: ${subjectData.name} (${subjectData.code})`,
                          `Topic: ${res.category}`,
                          `File Format: ${res.fileFormat}`,
                          `File Size: ${res.fileSize}`,
                          `Institutional License: Open Academic Access`
                        ]
                      });
                    }}
                    className="py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Download Course File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-card border border-border text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
              <p className="text-sm font-medium">No resources match your search criteria.</p>
            </div>
          )}

          {/* Resource Preview Modal */}
          {previewResource && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-2xl rounded-2xl bg-card border border-cyan-500/40 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300">
                      {previewResource.category} · {previewResource.fileFormat}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mt-1">{previewResource.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {previewResource.uploadedBy} on {previewResource.uploadedDate} ({previewResource.fileSize})
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewResource(null)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-hover"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-card-hover/40 border border-border text-sm text-foreground space-y-2">
                  <h5 className="font-semibold text-cyan-400 text-xs uppercase tracking-wider">Document Synopsis</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{previewResource.description}</p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Core Topics & Concepts Covered:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewResource.topicsCovered.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-foreground">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {previewResource.previewContent && (
                  <div className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground font-mono space-y-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Content Excerpt</span>
                    <p className="text-[11px] leading-relaxed text-foreground">{previewResource.previewContent}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setPreviewResource(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-card-hover"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      showToast(`Downloading "${previewResource.title}"...`);
                      showActionInfo({
                        title: `Resource Download: ${previewResource.title}`,
                        badge: `${previewResource.fileFormat} · ${previewResource.fileSize}`,
                        category: 'export',
                        message: `Prepared "${previewResource.title}" for offline revision. Authored by ${previewResource.uploadedBy}.`,
                        details: [
                          `Course: ${subjectData.name}`,
                          `Format: ${previewResource.fileFormat}`,
                          `Size: ${previewResource.fileSize}`
                        ]
                      });
                      setPreviewResource(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full File</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 3. ASSIGNMENTS SECTION                                                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Assignment Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto p-4 rounded-2xl bg-card border border-border">
            {(['All', 'Pending', 'Submitted', 'Graded'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setAssignmentFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  assignmentFilter === filter
                    ? 'bg-cyan-500 text-black'
                    : 'bg-card-hover text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.map(asn => {
              const isGraded = asn.status === 'Graded';
              const isSubmitted = asn.status === 'Submitted';
              const isPending = asn.status === 'Pending';

              return (
                <div
                  key={asn.id}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {asn.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isGraded
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isSubmitted
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {asn.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-foreground">{asn.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Assigned by {asn.faculty} · Due date: <strong className="text-foreground">{asn.dueDate}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-xs text-muted-foreground">Weightage</div>
                        <div className="text-sm font-bold text-cyan-400">{asn.weightagePct}% (Max {asn.maxMarks}m)</div>
                      </div>

                      {isPending && (
                        <button
                          onClick={() => handleOpenSubmitAssignment(asn)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-sm"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Submit Work</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Problem statement & Instructions */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-cyan-400">Problem Statement: </span>
                      <span className="text-muted-foreground">{asn.problemStatement}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Instructions: </span>
                      <span className="text-muted-foreground">{asn.instructions}</span>
                    </div>
                  </div>

                  {/* Rubric Breakdown */}
                  <div className="p-3 rounded-xl bg-card-hover/40 border border-border">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                      Grading Rubric
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {asn.rubric.map((r, i) => (
                        <div key={i} className="p-2 rounded-lg bg-card border border-border text-xs">
                          <span className="text-muted-foreground block truncate">{r.criterion}</span>
                          <span className="font-bold text-cyan-400">{r.marks} Marks</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* If Graded or Submitted Status Banner */}
                  {isGraded && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-emerald-400 block mb-0.5">Faculty Evaluation & Feedback</span>
                        <p className="text-muted-foreground italic">"{asn.facultyFeedback}"</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Awarded Score</span>
                        <span className="text-xl font-extrabold text-emerald-400">{asn.marksAwarded} / {asn.maxMarks}</span>
                      </div>
                    </div>
                  )}

                  {isSubmitted && !isGraded && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>Submitted on {asn.submissionDate} · File: {asn.submittedFileName}</span>
                      </div>
                      <span className="font-medium text-xs text-blue-400">Under Faculty Review</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Assignment Modal */}
          {submittingAssignment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-lg rounded-2xl bg-card border border-cyan-500/40 p-6 shadow-2xl space-y-4 animate-scale-in">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300">
                      {submittingAssignment.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-1">
                      Submit: {submittingAssignment.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSubmittingAssignment(null)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-hover"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleConfirmAssignmentSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Selected Solution Document / Source Archive
                    </label>
                    <input
                      type="text"
                      value={submissionFileName}
                      onChange={e => setSubmissionFileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-card-hover border border-border text-xs text-foreground font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  {/* Drag and Drop Simulator Box */}
                  <div className="p-6 rounded-xl border-2 border-dashed border-border hover:border-cyan-500/50 bg-card-hover/20 text-center cursor-pointer transition-colors">
                    <UploadCloud className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Click or drop assignment PDF/ZIP here</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Maximum file size: 25 MB</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      Submission Notes / Repository Link (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Include instructions to run code, GitHub repository link, or special notes for Dr. Priya Menon..."
                      value={submissionNotes}
                      onChange={e => setSubmissionNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300">
                    <Sparkles className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                    <span>Submissions automatically run plagiarism and syntax verification on upload.</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setSubmittingAssignment(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-card-hover"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Upload Submission</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 4. ASSESSMENTS SECTION                                                     */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          {/* Assessment Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto p-4 rounded-2xl bg-card border border-border">
            {(['All', 'Upcoming', 'Completed'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setAssessmentFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  assessmentFilter === filter
                    ? 'bg-cyan-500 text-black'
                    : 'bg-card-hover text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Assessment Cards */}
          <div className="space-y-5">
            {filteredAssessments.map(asm => {
              const isCompleted = asm.status === 'Completed';

              return (
                <div
                  key={asm.id}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/40 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {asm.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          }`}
                        >
                          {asm.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-foreground">{asm.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {asm.venue} · Duration: {asm.durationMinutes} minutes · Max Marks: {asm.maxMarks} ({asm.weightagePct}% weightage)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Exam Schedule</span>
                        <span className="text-sm font-bold text-foreground">{asm.date}</span>
                        <span className="text-[11px] text-muted-foreground block">{asm.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Completed Exam Performance Card */}
                  {isCompleted && asm.studentScore !== undefined && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent border border-cyan-500/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                            Student Evaluation Score
                          </span>
                          <div className="text-2xl font-extrabold text-foreground mt-0.5">
                            {asm.studentScore} / {asm.maxMarks}{' '}
                            <span className="text-sm font-semibold text-emerald-400">
                              ({Math.round((asm.studentScore / asm.maxMarks) * 100)}%)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs">
                          <div>
                            <span className="text-muted-foreground block">Class Average</span>
                            <span className="font-bold text-foreground">{asm.classAverage} / {asm.maxMarks}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Highest Score</span>
                            <span className="font-bold text-emerald-400">{asm.highestScore} / {asm.maxMarks}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blueprint and Question Structure */}
                  <div className="p-3.5 rounded-xl bg-card-hover/40 border border-border text-xs text-muted-foreground">
                    <strong className="text-cyan-400">Question Paper Blueprint: </strong>
                    <span>{asm.blueprint}</span>
                  </div>

                  {/* Interactive Syllabus Revision Checklist */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground uppercase tracking-wider">
                        Syllabus Revision Checklist
                      </span>
                      <span className="text-muted-foreground">
                        {asm.topicsChecklist.filter((t, i) => checkedTopics[`${asm.id}_${i}`] ?? t.completed).length} /{' '}
                        {asm.topicsChecklist.length} Topics Revised
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {asm.topicsChecklist.map((item, idx) => {
                        const key = `${asm.id}_${idx}`;
                        const isDone = checkedTopics[key] ?? item.completed;

                        return (
                          <button
                            key={idx}
                            onClick={() => toggleChecklistTopic(key)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-colors ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-card hover:bg-card-hover border-border text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-muted-foreground'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-medium">{item.topic}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Past Papers Button */}
                  {asm.pastPapersAvailable && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          showToast(`Downloading past question paper blueprint for ${asm.title}...`);
                          showActionInfo({
                            title: `Past Exam Papers & Solution Keys: ${asm.title}`,
                            badge: 'Exam Prep Blueprint',
                            category: 'export',
                            message: `Institutional past examination papers and model solution rubrics for ${asm.title} (${subjectData.name}).`,
                            details: [
                              `Course: ${subjectData.name} (${subjectData.code})`,
                              `Weightage: ${asm.weightagePct}% of final semester grade`,
                              `Includes: 3 full past question papers with step-by-step solutions`,
                              `Syllabus Modules Covered: 1, 2, 3, and 4`
                            ]
                          });
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-card border border-border hover:border-cyan-500/40 text-cyan-300 transition-colors cursor-pointer"
                        title="Download Past Papers & Model Solutions"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Past Year Papers & Model Solutions</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
