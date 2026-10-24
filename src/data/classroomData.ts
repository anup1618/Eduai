// ─── CLASSROOM DATA MODELS & MOCK REPOSITORY ──────────────────────────────────
// Provides comprehensive data for Quizzes, Resources, Assignments, and Assessments
// across all academic subjects.

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ClassroomQuiz {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  module: string;
  questionsCount: number;
  timeLimitMinutes: number;
  maxScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  lastScore?: number;
  lastPercentage?: number;
  questions: QuizQuestion[];
}

export interface ClassroomResource {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  category: 'Notes' | 'Slides' | 'Code' | 'Cheat Sheet' | 'Video';
  fileFormat: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  downloadsCount: number;
  description: string;
  topicsCovered: string[];
  externalUrl?: string;
  previewContent?: string;
}

export interface ClassroomAssignment {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  faculty: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  weightagePct: number;
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue';
  instructions: string;
  problemStatement: string;
  submissionDate?: string;
  submittedFileName?: string;
  marksAwarded?: number;
  facultyFeedback?: string;
  rubric: { criterion: string; marks: number }[];
}

export interface ClassroomAssessment {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  type: 'CIE' | 'Mid-Term' | 'Practical / Viva' | 'End-Term';
  date: string;
  timeSlot: string;
  venue: string;
  durationMinutes: number;
  maxMarks: number;
  weightagePct: number;
  status: 'Upcoming' | 'Completed';
  syllabusModules: string[];
  topicsChecklist: { topic: string; completed: boolean }[];
  blueprint: string;
  studentScore?: number;
  classAverage?: number;
  highestScore?: number;
  pastPapersAvailable: boolean;
}

export interface SubjectClassroomInfo {
  code: string;
  name: string;
  faculty: string;
  credits: number;
  semester: string;
  progressPct: number;
  syllabusCoveredPct: number;
  quizzes: ClassroomQuiz[];
  resources: ClassroomResource[];
  assignments: ClassroomAssignment[];
  assessments: ClassroomAssessment[];
}

export const CLASSROOM_DATA: Record<string, SubjectClassroomInfo> = {
  CS501: {
    code: 'CS501',
    name: 'Machine Learning',
    faculty: 'Dr. Priya Menon',
    credits: 4,
    semester: 'Semester 5',
    progressPct: 82,
    syllabusCoveredPct: 85,
    quizzes: [
      {
        id: 'ML-Q1',
        title: 'Supervised Learning & Regression Fundamentals',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        module: 'Unit 1: Linear Models',
        questionsCount: 5,
        timeLimitMinutes: 10,
        maxScore: 25,
        difficulty: 'Easy',
        dueDate: '2025-10-30',
        status: 'Completed',
        lastScore: 23,
        lastPercentage: 92,
        questions: [
          {
            id: 'ml1-1',
            question: 'In Linear Regression, which loss function is most commonly minimized by Gradient Descent?',
            options: [
              'Mean Squared Error (MSE)',
              'Hinge Loss',
              'Cross-Entropy Loss',
              'Kullback-Leibler Divergence'
            ],
            correctIndex: 0,
            explanation: 'Mean Squared Error (L2 Loss) is the standard differentiable convex cost function used for linear regression.'
          },
          {
            id: 'ml1-2',
            question: 'What happens when the learning rate (alpha) is set too high during gradient descent?',
            options: [
              'The model converges faster to global optimum',
              'The algorithm may oscillate and diverge away from the minimum',
              'Weights are automatically regularized using L1 penalty',
              'Gradient descent converts into stochastic gradient descent'
            ],
            correctIndex: 1,
            explanation: 'An overly large learning rate causes step overshooting, leading to oscillation or divergence.'
          },
          {
            id: 'ml1-3',
            question: 'Which regularization technique promotes feature sparsity by driving coefficients strictly to zero?',
            options: [
              'Ridge Regularization (L2)',
              'Lasso Regularization (L1)',
              'Dropout Regularization',
              'Batch Normalization'
            ],
            correctIndex: 1,
            explanation: 'L1 (Lasso) penalty features a sharp diamond-shaped constraint region that zeroes out irrelevant weights.'
          },
          {
            id: 'ml1-4',
            question: 'High variance in a machine learning model is a primary indicator of what phenomenon?',
            options: [
              'Underfitting the training dataset',
              'Overfitting to training noise and poor generalization on test data',
              'Having too few model parameters',
              'Vanishing gradients in hidden layers'
            ],
            correctIndex: 1,
            explanation: 'High variance indicates the model has over-memorized the training distribution and fails on unseen test sets.'
          },
          {
            id: 'ml1-5',
            question: 'In polynomial regression, what technique is essential before computing powers to avoid numerical instability?',
            options: [
              'Feature Scaling (Z-score Standardization / MinMax)',
              'Target Label Binarization',
              'One-Hot Encoding of continuous variables',
              'Kernel PCA transform'
            ],
            correctIndex: 0,
            explanation: 'Powers of unscaled features expand drastically (e.g., 100^3 vs 10^3), making gradient descent steps unstable without feature scaling.'
          }
        ]
      },
      {
        id: 'ML-Q2',
        title: 'Classification, Logistic Regression & Decision Trees',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        module: 'Unit 2: Classification',
        questionsCount: 5,
        timeLimitMinutes: 12,
        maxScore: 25,
        difficulty: 'Medium',
        dueDate: '2025-11-05',
        status: 'Not Started',
        questions: [
          {
            id: 'ml2-1',
            question: 'What is the output range of the sigmoid activation function used in Logistic Regression?',
            options: [
              '[-1, 1]',
              '[0, 1]',
              '(-infinity, +infinity)',
              '[0, +infinity)'
            ],
            correctIndex: 1,
            explanation: 'Sigmoid maps any real-valued number into probabilities in the open interval (0, 1).'
          },
          {
            id: 'ml2-2',
            question: 'Which splitting criterion in Decision Trees is based on Information Theory and Shannon Entropy?',
            options: [
              'Information Gain',
              'Gini Impurity',
              'Mean Absolute Deviation',
              'Silhouette Coefficient'
            ],
            correctIndex: 0,
            explanation: 'Information Gain equals the reduction in entropy before versus after splitting on a feature.'
          },
          {
            id: 'ml2-3',
            question: 'What does an ROC Curve plot to evaluate a binary classification model?',
            options: [
              'Precision vs Recall across varying thresholds',
              'True Positive Rate vs False Positive Rate across decision thresholds',
              'Training Loss vs Validation Loss across epochs',
              'F1 Score vs Accuracy across classes'
            ],
            correctIndex: 1,
            explanation: 'ROC plots TPR (Sensitivity) on the Y-axis against FPR (1 - Specificity) on the X-axis.'
          },
          {
            id: 'ml2-4',
            question: 'In Random Forests, how does bootstrap aggregation (Bagging) reduce variance without increasing bias?',
            options: [
              'By training sequential trees on residuals of prior trees',
              'By training independent unpruned trees on random sample subsets with replacement and averaging',
              'By forcing all trees to split on the same top feature',
              'By pruning the depth of every decision tree to 2 levels'
            ],
            correctIndex: 1,
            explanation: 'Bagging averages uncorrelated individual models trained on bootstrapped data subsets, drastically lowering variance.'
          },
          {
            id: 'ml2-5',
            question: 'When dealing with severe class imbalance (e.g. 99% Negative, 1% Positive), which evaluation metric is LEAST trustworthy?',
            options: [
              'Raw Classification Accuracy',
              'F1-Score (Macro Average)',
              'Precision-Recall AUC',
              'Balanced Accuracy'
            ],
            correctIndex: 0,
            explanation: 'A naive model predicting only the majority class achieves 99% accuracy while detecting 0 true positives.'
          }
        ]
      },
      {
        id: 'ML-Q3',
        title: 'Neural Networks & Deep Learning Foundations',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        module: 'Unit 3: Deep Neural Networks',
        questionsCount: 5,
        timeLimitMinutes: 15,
        maxScore: 25,
        difficulty: 'Hard',
        dueDate: '2025-11-20',
        status: 'Not Started',
        questions: [
          {
            id: 'ml3-1',
            question: 'Why is ReLU (Rectified Linear Unit) favored over Sigmoid in deep feedforward architectures?',
            options: [
              'ReLU is completely differentiable at the exact point zero',
              'ReLU avoids vanishing gradients for positive inputs and has faster computation',
              'ReLU bounds outputs strictly between 0 and 1',
              'ReLU prevents dead neurons under all learning rates'
            ],
            correctIndex: 1,
            explanation: 'For positive inputs, ReLU derivative is a constant 1, preventing exponential gradient decay through deep layers.'
          },
          {
            id: 'ml3-2',
            question: 'What mathematical rule enables backpropagation to compute layer-wise gradients in neural networks?',
            options: [
              'Cauchy-Schwarz Inequality',
              'Multivariate Calculus Chain Rule',
              'Bayes Theorem',
              'Taylor Series Approximation'
            ],
            correctIndex: 1,
            explanation: 'The calculus chain rule propagates the gradient of the loss backwards layer-by-layer.'
          },
          {
            id: 'ml3-3',
            question: 'How does Dropout regularization function during training iterations?',
            options: [
              'Randomly deactivates a fraction p of hidden units to prevent co-adaptation',
              'Penalizes weights based on their Euclidean norm',
              'Normalizes activations using running batch statistics',
              'Stops training once validation loss starts increasing'
            ],
            correctIndex: 0,
            explanation: 'Dropout randomly zeroes out activations during forward pass, creating an implicit ensemble of thinned networks.'
          },
          {
            id: 'ml3-4',
            question: 'What is the role of the Softmax function in multiclass neural networks?',
            options: [
              'Converts unnormalized logits into normalized probability distribution summing to 1',
              'Calculates Mean Absolute Error for regression tasks',
              'Smooths noisy input feature vectors before convolutions',
              'Regularizes the bias terms of the final dense layer'
            ],
            correctIndex: 0,
            explanation: 'Softmax exponentiates logits and divides by their sum, yielding valid class probabilities.'
          },
          {
            id: 'ml3-5',
            question: 'In Convolutional Neural Networks (CNNs), what does pooling (e.g. Max Pooling) achieve?',
            options: [
              'Doubles the number of color channels',
              'Reduces spatial dimensions, decreases parameters, and provides translation invariance',
              'Multiplies the receptive field by zero',
              'Eliminates the need for nonlinear activation functions'
            ],
            correctIndex: 1,
            explanation: 'Pooling downsamples feature maps, lowering memory usage and rendering features invariant to minor shifts.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'ML-RES-1',
        title: 'Unit 1 & 2 Complete Lecture Notes: Supervised Learning & Cost Formulations',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        category: 'Notes',
        fileFormat: 'PDF',
        fileSize: '4.2 MB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-09-15',
        downloadsCount: 142,
        description: 'Comprehensive 48-page study material detailing loss functions, analytical Normal Equation, iterative Gradient Descent variants, and Regularization.',
        topicsCovered: ['Linear Regression', 'Batch & Stochastic GD', 'L1 vs L2 Norms', 'Bias-Variance Tradeoff'],
        previewContent: 'This document presents the complete mathematical derivation of ordinary least squares (OLS) regression, cost function surface topology, and step size derivations for convergence guarantees.'
      },
      {
        id: 'ML-RES-2',
        title: 'Slide Deck: Optimization Algorithms (Adam, RMSProp & Momentum)',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        category: 'Slides',
        fileFormat: 'PPTX',
        fileSize: '7.8 MB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-10-02',
        downloadsCount: 98,
        description: 'Class presentation slides covering modern gradient optimization techniques, adaptive learning rates, and saddle point escape mechanisms.',
        topicsCovered: ['Momentum', 'Nesterov Accelerated Gradient', 'RMSProp', 'Adam Optimizer', 'Learning Rate Warmup']
      },
      {
        id: 'ML-RES-3',
        title: 'Jupyter Notebook: Gradient Descent & Logistic Regression from Scratch',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        category: 'Code',
        fileFormat: 'IPYNB',
        fileSize: '1.9 MB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-09-28',
        downloadsCount: 175,
        description: 'Fully documented Python Jupyter notebook implementing gradient descent without high-level ML libraries, with step-by-step vectorization and loss surface contour plots.',
        topicsCovered: ['Vectorized Matrix Calculus', 'Cost Tracking', 'Decision Boundary Visualization', 'NumPy Implementations']
      },
      {
        id: 'ML-RES-4',
        title: 'Machine Learning Formula & Metrics Master Cheatsheet',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        category: 'Cheat Sheet',
        fileFormat: 'PDF',
        fileSize: '1.1 MB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-10-05',
        downloadsCount: 220,
        description: 'Two-page laminated quick revision guide with formulas for Precision, Recall, F1, Log-Loss, Gini Index, Information Gain, and backprop update equations.',
        topicsCovered: ['Confusion Matrix Formulas', 'Entropy & Gini', 'Backpropagation Calculus', 'Cross-Validation Steps']
      },
      {
        id: 'ML-RES-5',
        title: 'Recorded Seminar: Neural Network Backpropagation & Computational Graphs',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        category: 'Video',
        fileFormat: 'MP4',
        fileSize: '340 MB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-10-12',
        downloadsCount: 89,
        description: '52-minute live classroom recording breaking down chain-rule forward and backward passes across multi-layer perceptrons with numerical examples.',
        topicsCovered: ['Chain Rule', 'Computational Graphs', 'Activation Derivatives', 'Matrix Dimensions in Layers']
      }
    ],
    assignments: [
      {
        id: 'ML-ASN-1',
        title: 'Assignment 1: Polynomial Regression & Ridge vs Lasso Comparison',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        faculty: 'Dr. Priya Menon',
        assignedDate: '2025-09-18',
        dueDate: '2025-09-30',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Graded',
        submissionDate: '2025-09-29',
        submittedFileName: 'CS21B021_ML_Assignment1.ipynb',
        marksAwarded: 9.5,
        facultyFeedback: 'Excellent analysis of the regularization parameter lambda. Residual plots and cross-validation curves were exceptionally clear.',
        instructions: 'Implement polynomial features up to degree 5 on the Boston Housing dataset. Benchmark OLS vs Ridge vs Lasso and plot coefficient shrinkage paths.',
        problemStatement: 'Investigate how varying alpha across 10^-4 to 10^4 influences test RMSE and identify which features are zeroed out first by Lasso.',
        rubric: [
          { criterion: 'Data Preprocessing & Scaling', marks: 2 },
          { criterion: 'Implementation of Ridge & Lasso', marks: 4 },
          { criterion: 'Shrinkage Path Visualizations', marks: 2 },
          { criterion: 'Insightful Discussion & Inference', marks: 2 }
        ]
      },
      {
        id: 'ML-ASN-2',
        title: 'Assignment 2: Binary & Multiclass Classification with Decision Trees',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        faculty: 'Dr. Priya Menon',
        assignedDate: '2025-10-14',
        dueDate: '2025-11-04',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Pending',
        instructions: 'Build a Decision Tree classifier from scratch using Information Gain. Compare your custom implementation with scikit-learn DecisionTreeClassifier on the Breast Cancer Wisconsin dataset.',
        problemStatement: 'Evaluate tree performance with and without pre-pruning (max_depth=3, min_samples_split=10). Generate the confusion matrix and ROC-AUC curve.',
        rubric: [
          { criterion: 'Scratch Entropy & Split Logic', marks: 4 },
          { criterion: 'Pruning Mechanism & Overfitting Mitigation', marks: 3 },
          { criterion: 'Evaluation Metrics (ROC, Precision-Recall)', marks: 3 }
        ]
      },
      {
        id: 'ML-ASN-3',
        title: 'Assignment 3: Multi-Layer Perceptron & Hyperparameter Tuning',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        faculty: 'Dr. Priya Menon',
        assignedDate: '2025-11-08',
        dueDate: '2025-11-25',
        maxMarks: 15,
        weightagePct: 10,
        status: 'Pending',
        instructions: 'Train an MLP on the Fashion-MNIST dataset. Experiment with batch sizes, learning rate schedules, and Dropout rates. Report test accuracy and training convergence curves.',
        problemStatement: 'Achieve at least 88% test accuracy while keeping total trainable parameters under 200,000.',
        rubric: [
          { criterion: 'Network Architecture & Parameter Budget', marks: 5 },
          { criterion: 'Optimization & Regularization Strategies', marks: 5 },
          { criterion: 'Error Analysis & Confusion Matrix', marks: 5 }
        ]
      }
    ],
    assessments: [
      {
        id: 'ML-ASM-1',
        title: 'Continuous Internal Evaluation 1 (CIE-1)',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        type: 'CIE',
        date: '2025-10-04',
        timeSlot: '10:00 AM - 11:30 AM',
        venue: 'Exam Hall A-101',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Completed',
        studentScore: 18,
        classAverage: 14.6,
        highestScore: 20,
        syllabusModules: ['Unit 1: Linear Models & Cost Functions', 'Unit 2: Optimization & Gradient Descent'],
        topicsChecklist: [
          { topic: 'OLS Analytical Formulation & Normal Equation', completed: true },
          { topic: 'Batch, Mini-batch, and Stochastic GD convergence', completed: true },
          { topic: 'Ridge (L2) and Lasso (L1) derivations', completed: true },
          { topic: 'Learning rate step bounds and oscillation', completed: true }
        ],
        blueprint: 'Part A: 5 Compulsory Short Questions (2 marks each = 10 marks). Part B: 2 Analytical Derivations out of 3 (5 marks each = 10 marks).',
        pastPapersAvailable: true
      },
      {
        id: 'ML-ASM-2',
        title: 'Continuous Internal Evaluation 2 (CIE-2)',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        type: 'CIE',
        date: '2025-11-12',
        timeSlot: '02:00 PM - 03:30 PM',
        venue: 'Exam Hall A-204',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Upcoming',
        syllabusModules: ['Unit 3: Decision Trees & Random Forests', 'Unit 4: Support Vector Machines & Kernels'],
        topicsChecklist: [
          { topic: 'Information Gain and Gini Impurity calculations', completed: true },
          { topic: 'Tree Pruning strategies (cost-complexity)', completed: false },
          { topic: 'SVM Maximum Margin Hyperplane & Dual Problem', completed: false },
          { topic: 'Kernel Trick (RBF, Polynomial, Sigmoid)', completed: false }
        ],
        blueprint: 'Part A: 5 Conceptual Questions (2 marks each = 10 marks). Part B: 2 Numerical Problems on Information Gain and SVM Karush-Kuhn-Tucker conditions (5 marks each = 10 marks).',
        pastPapersAvailable: true
      },
      {
        id: 'ML-ASM-3',
        title: 'End-Semester Theory Examination',
        subjectCode: 'CS501',
        subjectName: 'Machine Learning',
        type: 'End-Term',
        date: '2025-12-16',
        timeSlot: '09:30 AM - 12:30 PM',
        venue: 'Main Academic Auditorium',
        durationMinutes: 180,
        maxMarks: 100,
        weightagePct: 50,
        status: 'Upcoming',
        syllabusModules: ['Units 1 to 5: Complete Prescribed Syllabus'],
        topicsChecklist: [
          { topic: 'Regression & Regularization', completed: true },
          { topic: 'Classification & Trees', completed: true },
          { topic: 'SVM & Kernel Methods', completed: false },
          { topic: 'Unsupervised Learning (K-Means, PCA)', completed: false },
          { topic: 'Neural Networks & Deep Learning', completed: false }
        ],
        blueprint: 'Standard University Scheme: 10 Questions across 5 Modules with internal choice (20 marks per module). Total 100 marks.',
        pastPapersAvailable: true
      }
    ]
  },

  CS502: {
    code: 'CS502',
    name: 'Computer Networks',
    faculty: 'Prof. Suresh Kumar',
    credits: 4,
    semester: 'Semester 5',
    progressPct: 74,
    syllabusCoveredPct: 78,
    quizzes: [
      {
        id: 'CN-Q1',
        title: 'OSI Architecture & Physical/Data Link Layers',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        module: 'Unit 1: Fundamentals & Physical/DLL',
        questionsCount: 5,
        timeLimitMinutes: 10,
        maxScore: 25,
        difficulty: 'Easy',
        dueDate: '2025-10-28',
        status: 'Completed',
        lastScore: 21,
        lastPercentage: 84,
        questions: [
          {
            id: 'cn1-1',
            question: 'Which layer of the OSI model handles logical addressing and end-to-end routing?',
            options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
            correctIndex: 1,
            explanation: 'The Network Layer (Layer 3) handles logical IP addressing and packet routing across heterogeneous networks.'
          },
          {
            id: 'cn1-2',
            question: 'What is the primary purpose of the Address Resolution Protocol (ARP)?',
            options: [
              'Map a known IP address to its corresponding physical MAC address',
              'Convert domain names into IP addresses',
              'Encrypt transport layer socket segments',
              'Allocate dynamic IP addresses to clients on boot'
            ],
            correctIndex: 0,
            explanation: 'ARP translates a 32-bit IPv4 address into a 48-bit Ethernet MAC address for local frame delivery.'
          },
          {
            id: 'cn1-3',
            question: 'In CRC (Cyclic Redundancy Check), what mathematical operation is used for error detection?',
            options: ['Polynomial Binary Division modulo-2', 'Addition with carry', 'Bitwise bit-shift rotation', 'Hamming distance subtraction'],
            correctIndex: 0,
            explanation: 'CRC treats bit streams as polynomial coefficients and performs modulo-2 binary division without carries.'
          },
          {
            id: 'cn1-4',
            question: 'What technique does CSMA/CD use when a packet collision is detected on a shared Ethernet segment?',
            options: [
              'Binary Exponential Backoff algorithm before retransmitting',
              'Immediate unconditional retransmission at full power',
              'Switching the channel frequency from 2.4GHz to 5GHz',
              'Dropping all packets and resetting the network adapter'
            ],
            correctIndex: 0,
            explanation: 'CSMA/CD sends a jam signal and waits for a randomized binary exponential backoff period to prevent repeated collisions.'
          },
          {
            id: 'cn1-5',
            question: 'What is the maximum payload size (MTU) of a standard Ethernet frame?',
            options: ['512 bytes', '1500 bytes', '4096 bytes', '65535 bytes'],
            correctIndex: 1,
            explanation: 'Standard Ethernet specifies a Maximum Transmission Unit (MTU) of 1500 bytes for the data payload.'
          }
        ]
      },
      {
        id: 'CN-Q2',
        title: 'IP Addressing, VLSM & Routing Algorithms',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        module: 'Unit 2: Network Layer & Routing',
        questionsCount: 5,
        timeLimitMinutes: 12,
        maxScore: 25,
        difficulty: 'Medium',
        dueDate: '2025-11-06',
        status: 'Not Started',
        questions: [
          {
            id: 'cn2-1',
            question: 'How many usable host IP addresses are available in a subnet with a /27 prefix?',
            options: ['32', '30', '28', '16'],
            correctIndex: 1,
            explanation: 'A /27 subnet has 32 - 27 = 5 host bits. 2^5 = 32 total addresses, minus Network and Broadcast addresses = 30 usable hosts.'
          },
          {
            id: 'cn2-2',
            question: 'What serious convergence problem plagues the Distance Vector routing algorithm (RIP)?',
            options: ['Count-to-Infinity problem', 'BGP Path Hijacking', 'Deadlock in sliding window', 'DNS Cache Poisoning'],
            correctIndex: 0,
            explanation: 'Distance Vector algorithms suffer from slow convergence and routing loops known as the Count-to-Infinity problem.'
          },
          {
            id: 'cn2-3',
            question: 'Which interior gateway routing protocol uses Dijkstra’s Shortest Path First algorithm?',
            options: ['OSPF (Open Shortest Path First)', 'RIPv2', 'BGP', 'ICMP'],
            correctIndex: 0,
            explanation: 'OSPF distributes link-state advertisements and runs Dijkstra’s algorithm to compute the shortest-path tree.'
          },
          {
            id: 'cn2-4',
            question: 'What is the default subnet mask for a Class C IPv4 network?',
            options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.240'],
            correctIndex: 2,
            explanation: 'Class C uses 24 bits for network and 8 bits for host, corresponding to 255.255.255.0.'
          },
          {
            id: 'cn2-5',
            question: 'Which field in the IPv4 header prevents packets from circulating endlessly in routing loops?',
            options: ['Time to Live (TTL)', 'Differentiated Services Code Point', 'Identification', 'Header Checksum'],
            correctIndex: 0,
            explanation: 'Every router decrements the TTL field by 1; when TTL hits 0, the packet is discarded and an ICMP Time Exceeded message is returned.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'CN-RES-1',
        title: 'Comprehensive VLSM & Subnetting Guide with 25 Solved Problems',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        category: 'Notes',
        fileFormat: 'PDF',
        fileSize: '3.6 MB',
        uploadedBy: 'Prof. Suresh Kumar',
        uploadedDate: '2025-09-22',
        downloadsCount: 168,
        description: 'Step-by-step tutorial on Variable-Length Subnet Masking, supernetting, CIDR prefix conversions, and allocating subnets without IP wastage.',
        topicsCovered: ['VLSM Allocation', 'CIDR Notation', 'Broadcast & Network IP Calculation', 'Practical Enterprise Topologies']
      },
      {
        id: 'CN-RES-2',
        title: 'Cisco Packet Tracer Lab Configurations & Topology Walkthrough',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        category: 'Code',
        fileFormat: 'ZIP',
        fileSize: '12.4 MB',
        uploadedBy: 'Prof. Suresh Kumar',
        uploadedDate: '2025-10-04',
        downloadsCount: 115,
        description: 'Complete PKT topology files configuring static routing, OSPF Area 0, DHCP server pools, and VLAN tagging on 2960 switches.',
        topicsCovered: ['Switch VLAN Configuration', 'Inter-VLAN Routing (Router on a Stick)', 'OSPF Single Area', 'NAT Overload']
      },
      {
        id: 'CN-RES-3',
        title: 'Wireshark Network Packet Analysis Quick Reference',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        category: 'Cheat Sheet',
        fileFormat: 'PDF',
        fileSize: '1.4 MB',
        uploadedBy: 'Prof. Suresh Kumar',
        uploadedDate: '2025-10-09',
        downloadsCount: 195,
        description: 'Filter cheatsheet for TCP 3-way handshakes, SYN floods, DNS lookups, ARP resolution, and HTTP/HTTPS headers.',
        topicsCovered: ['Display Filters', 'TCP Stream Following', 'Packet Inspection', 'Latency Troubleshooting']
      }
    ],
    assignments: [
      {
        id: 'CN-ASN-1',
        title: 'Assignment 1: Multi-threaded TCP Client-Server Chat Application in C/Python',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        faculty: 'Prof. Suresh Kumar',
        assignedDate: '2025-09-20',
        dueDate: '2025-10-05',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Graded',
        submissionDate: '2025-10-04',
        submittedFileName: 'CS21B021_SocketProg.zip',
        marksAwarded: 8.5,
        facultyFeedback: 'Good socket communication and multi-client threading. Make sure to gracefully handle EOF on socket closure.',
        instructions: 'Write a TCP server that supports concurrent communication with up to 10 clients using select() or threading.',
        problemStatement: 'Implement broadcast messaging, private room messaging, and /quit commands with zero memory leaks.',
        rubric: [
          { criterion: 'Socket Lifecycle & Bind/Listen', marks: 3 },
          { criterion: 'Concurrent Client Handling', marks: 4 },
          { criterion: 'Graceful Error Handling & Teardown', marks: 3 }
        ]
      },
      {
        id: 'CN-ASN-2',
        title: 'Assignment 2: Campus Network VLSM Subnet Plan & Cisco Packet Tracer Simulation',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        faculty: 'Prof. Suresh Kumar',
        assignedDate: '2025-10-18',
        dueDate: '2025-11-06',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Pending',
        instructions: 'Given 172.16.0.0/16, create a VLSM design accommodating 4 academic departments, 2 hostel blocks, and admin offices with minimal address waste.',
        problemStatement: 'Submit the subnet table (Network ID, Usable Range, Broadcast IP, Mask) and the working .pkt file.',
        rubric: [
          { criterion: 'Subnet Math Accuracy', marks: 4 },
          { criterion: 'Packet Tracer Connectivity & Ping Test', marks: 4 },
          { criterion: 'Documentation & Diagram', marks: 2 }
        ]
      }
    ],
    assessments: [
      {
        id: 'CN-ASM-1',
        title: 'Continuous Internal Evaluation 1 (CIE-1)',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        type: 'CIE',
        date: '2025-10-06',
        timeSlot: '02:00 PM - 03:30 PM',
        venue: 'Exam Hall B-102',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Completed',
        studentScore: 15,
        classAverage: 13.9,
        highestScore: 19,
        syllabusModules: ['Unit 1: Physical Layer & Data Link Layer', 'Unit 2: MAC Protocols & Ethernet'],
        topicsChecklist: [
          { topic: 'OSI vs TCP/IP Layers & Encapsulation', completed: true },
          { topic: 'Framing, Bit Stuffing, and Byte Stuffing', completed: true },
          { topic: 'CRC Error Detection Polynomial Division', completed: true },
          { topic: 'CSMA/CD and Sliding Window Protocols', completed: false }
        ],
        blueprint: 'Part A: 5 Definitions (2 marks = 10 marks). Part B: 2 Problems on CRC and Stop-and-Wait throughput (5 marks = 10 marks).',
        pastPapersAvailable: true
      },
      {
        id: 'CN-ASM-2',
        title: 'Continuous Internal Evaluation 2 (CIE-2)',
        subjectCode: 'CS502',
        subjectName: 'Computer Networks',
        type: 'CIE',
        date: '2025-11-14',
        timeSlot: '10:00 AM - 11:30 AM',
        venue: 'Exam Hall B-102',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Upcoming',
        syllabusModules: ['Unit 3: Network Layer & IP Addressing', 'Unit 4: Routing Protocols (RIP, OSPF, BGP)'],
        topicsChecklist: [
          { topic: 'IPv4 vs IPv6 Header differences', completed: true },
          { topic: 'Subnetting, Supernetting, and CIDR', completed: true },
          { topic: 'Dijkstra Link State Routing', completed: false },
          { topic: 'Distance Vector and Count-to-Infinity solutions', completed: false }
        ],
        blueprint: 'Part A: 5 Short Questions (10 marks). Part B: 2 Problems on VLSM Table generation and Shortest Path graph routing (10 marks).',
        pastPapersAvailable: true
      }
    ]
  },

  CS503: {
    code: 'CS503',
    name: 'Operating Systems',
    faculty: 'Dr. Anita Bose',
    credits: 4,
    semester: 'Semester 5',
    progressPct: 88,
    syllabusCoveredPct: 90,
    quizzes: [
      {
        id: 'OS-Q1',
        title: 'Process Management, Scheduling & CPU Scheduling Algorithms',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        module: 'Unit 1: Process Management & CPU Scheduling',
        questionsCount: 5,
        timeLimitMinutes: 10,
        maxScore: 25,
        difficulty: 'Easy',
        dueDate: '2025-10-25',
        status: 'Completed',
        lastScore: 25,
        lastPercentage: 100,
        questions: [
          {
            id: 'os1-1',
            question: 'Which scheduling algorithm is provably optimal with respect to minimum average waiting time?',
            options: [
              'Shortest Job First (SJF / SRTF)',
              'First Come First Served (FCFS)',
              'Round Robin with large quantum',
              'Priority Scheduling with aging'
            ],
            correctIndex: 0,
            explanation: 'SJF always produces the minimal average waiting time for a given set of stationary processes.'
          },
          {
            id: 'os1-2',
            question: 'What is the Convoy Effect in CPU scheduling?',
            options: [
              'Short processes stuck waiting behind a CPU-intensive long process under FCFS',
              'Deadlock between competing threads in user space',
              'Thrashing caused by low available RAM',
              'Starvation in round robin due to tiny time quantum'
            ],
            correctIndex: 0,
            explanation: 'In FCFS, when one long process holds the CPU, short I/O bound processes queue up idle behind it, tanking device utilization.'
          },
          {
            id: 'os1-3',
            question: 'What happens during a Process Context Switch?',
            options: [
              'Current CPU register state is saved to the PCB and the new process state is restored',
              'The operating system kernel is re-installed from disk',
              'All processes in RAM are swapped out to swap space',
              'Virtual memory pages are wiped clean'
            ],
            correctIndex: 0,
            explanation: 'A context switch saves CPU registers, program counter, and stack pointers to the Process Control Block (PCB).'
          },
          {
            id: 'os1-4',
            question: 'Which IPC (Inter-Process Communication) mechanism provides the fastest data transfer between processes on the same machine?',
            options: ['Shared Memory', 'Unix Domain Sockets', 'Message Queues', 'Named Pipes'],
            correctIndex: 0,
            explanation: 'Shared memory involves no kernel-space buffer copying once mapped into both processes address spaces.'
          },
          {
            id: 'os1-5',
            question: 'What data structure represents an executing process inside the operating system kernel?',
            options: ['Process Control Block (PCB)', 'File Allocation Table (FAT)', 'Translation Lookaside Buffer (TLB)', 'Page Table Entry (PTE)'],
            correctIndex: 0,
            explanation: 'The PCB contains PID, process state, program counter, CPU registers, CPU scheduling info, and open file pointers.'
          }
        ]
      },
      {
        id: 'OS-Q2',
        title: 'Synchronization, Deadlocks & Memory Management',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        module: 'Unit 2: Synchronization & Deadlocks',
        questionsCount: 5,
        timeLimitMinutes: 12,
        maxScore: 25,
        difficulty: 'Medium',
        dueDate: '2025-11-08',
        status: 'Not Started',
        questions: [
          {
            id: 'os2-1',
            question: 'Which of the following is NOT one of the 4 Coffman conditions required for a Deadlock to occur?',
            options: [
              'Preemption of resources by kernel scheduler',
              'Mutual Exclusion',
              'Hold and Wait',
              'Circular Wait'
            ],
            correctIndex: 0,
            explanation: 'The 4 conditions are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot persist.'
          },
          {
            id: 'os2-2',
            question: 'What classic algorithm is used for Deadlock Avoidance in systems with multiple instances of each resource type?',
            options: ['Banker’s Algorithm', 'Peterson’s Algorithm', 'Dekker’s Algorithm', 'Lamport’s Bakery Algorithm'],
            correctIndex: 0,
            explanation: 'Dijkstra’s Banker’s Algorithm simulates resource allocation to verify whether a system remains in a Safe State.'
          },
          {
            id: 'os2-3',
            question: 'What is Belady’s Anomaly in page replacement algorithms?',
            options: [
              'Allocating more page frames results in MORE page faults under FIFO',
              'LRU performs worse than Random replacement on cyclic references',
              'Page size doubling causes TLB thrashing',
              'Dirty pages failing to flush during context switches'
            ],
            correctIndex: 0,
            explanation: 'Belady’s anomaly shows that for FIFO, increasing physical frames can paradoxically increase the number of page faults.'
          },
          {
            id: 'os2-4',
            question: 'What hardware component accelerates virtual-to-physical address translation in the MMU?',
            options: ['Translation Lookaside Buffer (TLB)', 'Direct Memory Access (DMA)', 'L3 Cache Bus', 'Memory Data Register (MDR)'],
            correctIndex: 0,
            explanation: 'The TLB is a high-speed associative hardware cache storing recent virtual-to-physical page frame mappings.'
          },
          {
            id: 'os2-5',
            question: 'What causes Thrashing in virtual memory systems?',
            options: [
              'A process spends more time swapping pages in and out than executing instructions',
              'Disk head collisions during random writes',
              'Overheating of memory bus during DMA transfers',
              'Having too many user threads in the ready queue'
            ],
            correctIndex: 0,
            explanation: 'When the sum of working sets exceeds physical RAM, the OS is consumed by continuous page fault servicing.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'OS-RES-1',
        title: 'Operating System Principles: Unit 1 to 3 Master Reference Notes',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        category: 'Notes',
        fileFormat: 'PDF',
        fileSize: '5.8 MB',
        uploadedBy: 'Dr. Anita Bose',
        uploadedDate: '2025-09-10',
        downloadsCount: 184,
        description: 'Comprehensive course handbook covering process lifecycle states, IPC, thread synchronization, semaphores, and memory paging.',
        topicsCovered: ['PCB Architecture', 'POSIX Threads', 'Binary & Counting Semaphores', 'Virtual Memory & Paging']
      },
      {
        id: 'OS-RES-2',
        title: 'Slide Deck: Banker’s Deadlock Avoidance Algorithm Step-by-Step with 3 Examples',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        category: 'Slides',
        fileFormat: 'PPTX',
        fileSize: '6.4 MB',
        uploadedBy: 'Dr. Anita Bose',
        uploadedDate: '2025-09-29',
        downloadsCount: 140,
        description: 'Visual matrix walkthrough showing Allocation, Max, Available, and Need matrices with safe sequence generation.',
        topicsCovered: ['Safe State Verification', 'Resource Request Algorithm', 'Need Matrix Computation']
      },
      {
        id: 'OS-RES-3',
        title: 'C Source Code: CPU Scheduling Simulator (FCFS, SJF, Priority, Round Robin)',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        category: 'Code',
        fileFormat: 'C',
        fileSize: '320 KB',
        uploadedBy: 'Dr. Anita Bose',
        uploadedDate: '2025-10-01',
        downloadsCount: 210,
        description: 'Clean ANSI C implementation with Gantt chart ASCII printer and average turnaround/waiting time computation.',
        topicsCovered: ['Gantt Chart Generation', 'Preemptive vs Non-Preemptive', 'Time Quantum Benchmark']
      }
    ],
    assignments: [
      {
        id: 'OS-ASN-1',
        title: 'Assignment 1: Simulating Classical Synchronization Problems with POSIX Mutexes',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        faculty: 'Dr. Anita Bose',
        assignedDate: '2025-09-15',
        dueDate: '2025-09-28',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Graded',
        submissionDate: '2025-09-27',
        submittedFileName: 'CS21B021_SyncLab.c',
        marksAwarded: 10,
        facultyFeedback: 'Exceptional solution to the Producer-Consumer problem using circular buffers and sem_wait/sem_post.',
        instructions: 'Implement the Bounded Buffer Producer-Consumer problem and Readers-Writers problem in C using pthread and semaphore.h.',
        problemStatement: 'Ensure zero race conditions under heavy multi-threaded stress and verify starvation-free execution.',
        rubric: [
          { criterion: 'Mutex & Semaphore Usage', marks: 4 },
          { criterion: 'Race Condition Prevention', marks: 4 },
          { criterion: 'Code Cleanliness & Comments', marks: 2 }
        ]
      },
      {
        id: 'OS-ASN-2',
        title: 'Assignment 2: Page Replacement Simulator & Hit-Ratio Comparison (FIFO, LRU, Optimal)',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        faculty: 'Dr. Anita Bose',
        assignedDate: '2025-10-15',
        dueDate: '2025-11-05',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Pending',
        instructions: 'Write a program in Python or C++ simulating FIFO, LRU, and Optimal page replacement algorithms for reference strings of length 50+ across 3 to 7 frames.',
        problemStatement: 'Demonstrate Belady’s anomaly on a chosen reference string under FIFO and plot hit ratio vs frame count curves.',
        rubric: [
          { criterion: 'Algorithm Accuracy (FIFO, LRU, Opt)', marks: 5 },
          { criterion: 'Belady’s Anomaly Demonstration', marks: 3 },
          { criterion: 'Comparative Hit Ratio Plotting', marks: 2 }
        ]
      }
    ],
    assessments: [
      {
        id: 'OS-ASM-1',
        title: 'Continuous Internal Evaluation 1 (CIE-1)',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        type: 'CIE',
        date: '2025-10-02',
        timeSlot: '10:00 AM - 11:30 AM',
        venue: 'Exam Hall A-301',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Completed',
        studentScore: 20,
        classAverage: 15.2,
        highestScore: 20,
        syllabusModules: ['Unit 1: Process Concept & CPU Scheduling', 'Unit 2: Inter-Process Communication'],
        topicsChecklist: [
          { topic: 'Process State Transition Diagram', completed: true },
          { topic: 'FCFS, SJF, SRTF, Round Robin Gantt charts', completed: true },
          { topic: 'Waiting Time & Turnaround Time equations', completed: true },
          { topic: 'Context switching hardware costs', completed: true }
        ],
        blueprint: 'Part A: 5 Short Answer Questions (10 marks). Part B: 2 Full Scheduling Problems with Gantt charts (10 marks).',
        pastPapersAvailable: true
      },
      {
        id: 'OS-ASM-2',
        title: 'Continuous Internal Evaluation 2 (CIE-2)',
        subjectCode: 'CS503',
        subjectName: 'Operating Systems',
        type: 'CIE',
        date: '2025-11-10',
        timeSlot: '02:00 PM - 03:30 PM',
        venue: 'Exam Hall A-301',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Upcoming',
        syllabusModules: ['Unit 3: Synchronization & Deadlocks', 'Unit 4: Main Memory & Paging'],
        topicsChecklist: [
          { topic: 'Critical Section Problem & Peterson Solution', completed: true },
          { topic: 'Semaphores & Classical Sync problems', completed: true },
          { topic: 'Bankers Algorithm Safe State Verification', completed: false },
          { topic: 'Paging, Segmentation, and TLB Hit Ratio', completed: false }
        ],
        blueprint: 'Part A: 5 Questions (10 marks). Part B: 1 Banker’s numerical and 1 Page Table address translation numerical (10 marks).',
        pastPapersAvailable: true
      }
    ]
  },

  CS504: {
    code: 'CS504',
    name: 'Database Systems',
    faculty: 'Dr. Priya Menon',
    credits: 4,
    semester: 'Semester 5',
    progressPct: 78,
    syllabusCoveredPct: 80,
    quizzes: [
      {
        id: 'DB-Q1',
        title: 'Relational Model, ER Diagrams & Relational Algebra',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        module: 'Unit 1: Data Modeling & Relational Algebra',
        questionsCount: 5,
        timeLimitMinutes: 10,
        maxScore: 25,
        difficulty: 'Easy',
        dueDate: '2025-10-26',
        status: 'Completed',
        lastScore: 23,
        lastPercentage: 92,
        questions: [
          {
            id: 'db1-1',
            question: 'What Relational Algebra operation selects rows from a relation that satisfy a given predicate?',
            options: ['Selection (sigma)', 'Projection (pi)', 'Join (bowtie)', 'Cartesian Product (X)'],
            correctIndex: 0,
            explanation: 'Selection (sigma) is a unary operator that filters tuples based on a boolean condition.'
          },
          {
            id: 'db1-2',
            question: 'Which key is minimal — meaning no proper subset of its attributes is a superkey?',
            options: ['Candidate Key', 'Primary Key', 'Foreign Key', 'Composite Key'],
            correctIndex: 0,
            explanation: 'A candidate key is a minimal superkey that uniquely identifies tuples without redundant attributes.'
          },
          {
            id: 'db1-3',
            question: 'In an Entity-Relationship (ER) diagram, what does a diamond symbol represent?',
            options: ['Relationship Set', 'Entity Set', 'Multi-valued Attribute', 'Weak Entity'],
            correctIndex: 0,
            explanation: 'Diamonds depict relationship sets connecting entity sets in Peter Chen notation.'
          },
          {
            id: 'db1-4',
            question: 'What constraint ensures referential integrity between two tables?',
            options: ['FOREIGN KEY references PRIMARY KEY', 'CHECK constraint on columns', 'NOT NULL constraint', 'UNIQUE constraint on non-keys'],
            correctIndex: 0,
            explanation: 'A Foreign Key constrains values to exist in the referenced table’s primary or candidate key.'
          },
          {
            id: 'db1-5',
            question: 'What is the result of the Cartesian Product (R X S) between a table with 5 rows and a table with 4 rows?',
            options: ['20 rows', '9 rows', '5 rows', '1 row'],
            correctIndex: 0,
            explanation: 'The Cartesian product multiplies row counts: 5 x 4 = 20 tuples.'
          }
        ]
      },
      {
        id: 'DB-Q2',
        title: 'SQL, Normalization (1NF to BCNF) & Indexing',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        module: 'Unit 2: Normalization & Query Tuning',
        questionsCount: 5,
        timeLimitMinutes: 12,
        maxScore: 25,
        difficulty: 'Medium',
        dueDate: '2025-11-07',
        status: 'Not Started',
        questions: [
          {
            id: 'db2-1',
            question: 'A relation is in 2nd Normal Form (2NF) if it is in 1NF and what additional condition holds?',
            options: [
              'No non-prime attribute is partially dependent on any candidate key',
              'No transitive dependency exists between non-prime attributes',
              'Every determinant is a superkey',
              'All attributes are multi-valued'
            ],
            correctIndex: 0,
            explanation: '2NF eliminates partial functional dependencies on composite candidate keys.'
          },
          {
            id: 'db2-2',
            question: 'In B-Tree and B+ Tree indexing, what is the primary structural advantage of B+ Trees over B-Trees?',
            options: [
              'All data record pointers are stored only in leaf nodes connected by a linked list',
              'Leaf nodes have zero child pointers',
              'B+ Trees require no logarithmic re-balancing',
              'Non-leaf nodes store entire row tuples'
            ],
            correctIndex: 0,
            explanation: 'B+ Trees store actual pointers only in leaves, maximizing fanout and allowing fast sequential range scans via leaf links.'
          },
          {
            id: 'db2-3',
            question: 'What ACID property guarantees that all operations within a transaction either succeed completely or roll back entirely?',
            options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
            correctIndex: 0,
            explanation: 'Atomicity ensures all-or-nothing execution of transactional operations.'
          },
          {
            id: 'db2-4',
            question: 'Which concurrency control protocol guarantees Conflict Serializability?',
            options: ['Two-Phase Locking (2PL)', 'Timestamp Ordering without rollback', 'Optimistic Concurrency without validation', 'Read Committed Snapshot'],
            correctIndex: 0,
            explanation: 'Rigorous and strict 2PL guarantee that any concurrent schedule is equivalent to a serial execution order.'
          },
          {
            id: 'db2-5',
            question: 'What SQL clause filters groups produced by the GROUP BY statement?',
            options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
            correctIndex: 0,
            explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows before aggregation.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'DB-RES-1',
        title: 'Mastering Database Normalization: 1NF, 2NF, 3NF & BCNF with 10 Worked Cases',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        category: 'Notes',
        fileFormat: 'PDF',
        fileSize: '4.8 MB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-09-19',
        downloadsCount: 230,
        description: 'Complete decomposition guide explaining closure sets, canonical covers, lossless-join decomposition, and dependency preservation tests.',
        topicsCovered: ['Attribute Closure', 'Minimal Covers', 'Lossless Joins', 'BCNF vs 3NF Tradeoffs']
      },
      {
        id: 'DB-RES-2',
        title: 'PostgreSQL Performance Optimization & B+ Tree Index Tuning Manual',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        category: 'Notes',
        fileFormat: 'PDF',
        fileSize: '3.1 MB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-10-03',
        downloadsCount: 165,
        description: 'Deep dive into EXPLAIN ANALYZE query plans, sequential scans vs index scans, composite index column order, and vacuuming.',
        topicsCovered: ['Query Execution Plans', 'Clustered vs Non-Clustered Indexes', 'Hash & GiST Indexes', 'Buffer Cache Optimization']
      },
      {
        id: 'DB-RES-3',
        title: 'SQL DDL & DML Practice Repository: University Schema Scripts',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        category: 'Code',
        fileFormat: 'SQL',
        fileSize: '450 KB',
        uploadedBy: 'Dr. Priya Menon',
        uploadedDate: '2025-09-25',
        downloadsCount: 280,
        description: 'Standard SQL scripts creating 8 interconnected tables with sample data, constraints, and 30 benchmark analytical queries.',
        topicsCovered: ['DDL Constraints', 'Subqueries & CTEs', 'Window Functions', 'Trigger & Stored Procedure Templates']
      }
    ],
    assignments: [
      {
        id: 'DB-ASN-1',
        title: 'Assignment 1: Relational Schema Design & Normalization for Hospital Management System',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        faculty: 'Dr. Priya Menon',
        assignedDate: '2025-09-17',
        dueDate: '2025-10-02',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Graded',
        submissionDate: '2025-10-01',
        submittedFileName: 'CS21B021_DB_Hospital_Schema.pdf',
        marksAwarded: 9.0,
        facultyFeedback: 'Clean BCNF decomposition and accurate functional dependency closure. Good use of surrogate keys.',
        instructions: 'Design the full ER diagram for an inpatient hospital. Normalize all relations up to BCNF and prove lossless join property.',
        problemStatement: 'Include patient admissions, doctor rounds, medication prescriptions, and billing invoice generation.',
        rubric: [
          { criterion: 'ER Diagram & Cardinality', marks: 3 },
          { criterion: 'Functional Dependency Proofs', marks: 4 },
          { criterion: 'SQL DDL with Referential Actions', marks: 3 }
        ]
      },
      {
        id: 'DB-ASN-2',
        title: 'Assignment 2: Complex SQL Queries, Window Functions & Index Benchmark Report',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        faculty: 'Dr. Priya Menon',
        assignedDate: '2025-10-16',
        dueDate: '2025-11-04',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Pending',
        instructions: 'Write 15 complex queries utilizing CTEs, DENSE_RANK(), and partition over clauses. Measure execution times before and after creating B+ tree composite indexes.',
        problemStatement: 'Submit query scripts and EXPLAIN ANALYZE execution cost comparison charts.',
        rubric: [
          { criterion: 'SQL Query Correctness', marks: 4 },
          { criterion: 'Window Function Implementation', marks: 3 },
          { criterion: 'Index Benchmark & Speedup Analysis', marks: 3 }
        ]
      }
    ],
    assessments: [
      {
        id: 'DB-ASM-1',
        title: 'Continuous Internal Evaluation 1 (CIE-1)',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        type: 'CIE',
        date: '2025-10-08',
        timeSlot: '10:00 AM - 11:30 AM',
        venue: 'Exam Hall B-201',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Completed',
        studentScore: 17,
        classAverage: 14.8,
        highestScore: 20,
        syllabusModules: ['Unit 1: ER Model & Relational Algebra', 'Unit 2: SQL DDL & DML'],
        topicsChecklist: [
          { topic: 'ER Modeling and Chen vs Crow’s Foot notation', completed: true },
          { topic: 'Relational Algebra (Select, Project, Cartesian, Join)', completed: true },
          { topic: 'SQL Joins, Group By, and Having clauses', completed: true },
          { topic: 'Correlated vs Uncorrelated Subqueries', completed: true }
        ],
        blueprint: 'Part A: 5 Concepts (10 marks). Part B: 2 Relational Algebra & SQL conversion problems (10 marks).',
        pastPapersAvailable: true
      },
      {
        id: 'DB-ASM-2',
        title: 'Continuous Internal Evaluation 2 (CIE-2)',
        subjectCode: 'CS504',
        subjectName: 'Database Systems',
        type: 'CIE',
        date: '2025-11-16',
        timeSlot: '02:00 PM - 03:30 PM',
        venue: 'Exam Hall B-201',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Upcoming',
        syllabusModules: ['Unit 3: Normalization & Functional Dependencies', 'Unit 4: Transaction Processing & Concurrency Control'],
        topicsChecklist: [
          { topic: 'Attribute Closure and Minimal Cover', completed: true },
          { topic: '3NF and BCNF Decomposition algorithms', completed: false },
          { topic: 'ACID Properties and Serializability', completed: false },
          { topic: 'Two-Phase Locking (2PL) and Deadlock Handling', completed: false }
        ],
        blueprint: 'Part A: 5 Short Questions (10 marks). Part B: 1 Normalization decomposition problem and 1 Precedence Graph conflict serializability test (10 marks).',
        pastPapersAvailable: true
      }
    ]
  },

  CS505: {
    code: 'CS505',
    name: 'Software Engineering',
    faculty: 'Prof. Suresh Kumar',
    credits: 3,
    semester: 'Semester 5',
    progressPct: 70,
    syllabusCoveredPct: 75,
    quizzes: [
      {
        id: 'SE-Q1',
        title: 'Software Process Models (Agile, Scrum, Waterfall & Spiral)',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        module: 'Unit 1: Process Models & Agile',
        questionsCount: 5,
        timeLimitMinutes: 10,
        maxScore: 25,
        difficulty: 'Easy',
        dueDate: '2025-10-27',
        status: 'Completed',
        lastScore: 22,
        lastPercentage: 88,
        questions: [
          {
            id: 'se1-1',
            question: 'Which software development lifecycle model places the strongest emphasis on formal risk analysis at every iteration?',
            options: ['Spiral Model', 'Waterfall Model', 'V-Model', 'Rapid Application Development (RAD)'],
            correctIndex: 0,
            explanation: 'Barry Boehm’s Spiral Model is risk-driven and evaluates operational and financial risks at every spiral loop.'
          },
          {
            id: 'se1-2',
            question: 'In Scrum Agile methodology, what is the recommended duration of a standard Sprint?',
            options: ['1 to 4 weeks', '6 to 12 months', '1 day', 'Until all backlog items are completely finished'],
            correctIndex: 0,
            explanation: 'Scrum specifies fixed-length timeboxes typically between 1 to 4 weeks.'
          },
          {
            id: 'se1-3',
            question: 'What is the primary document specifying all functional and non-functional software requirements in IEEE format?',
            options: [
              'Software Requirements Specification (SRS) - IEEE 830',
              'Software Design Description (SDD)',
              'Test Plan Document (TPD)',
              'User Acceptance Criteria Document (UAC)'
            ],
            correctIndex: 0,
            explanation: 'IEEE 830 outlines the structure and content of a formal Software Requirements Specification.'
          },
          {
            id: 'se1-4',
            question: 'What does the V-Model illustrate in software engineering?',
            options: [
              'Direct relationship between each development phase and its corresponding testing phase',
              'The vector velocity of a scrum development team',
              'Code volume growth over time',
              'Branching and merging workflows in Git'
            ],
            correctIndex: 0,
            explanation: 'The V-model pairs design phases on the left with verification and validation testing phases on the right.'
          },
          {
            id: 'se1-5',
            question: 'Which agile ceremony is held at the end of a sprint to reflect and continuously improve team processes?',
            options: ['Sprint Retrospective', 'Daily Standup', 'Sprint Planning', 'Product Backlog Refinement'],
            correctIndex: 0,
            explanation: 'Sprint Retrospectives focus on what went well, what could be improved, and actionable commitments for the next sprint.'
          }
        ]
      },
      {
        id: 'SE-Q2',
        title: 'Software Testing, Metrics & Quality Assurance',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        module: 'Unit 2: Testing & QA',
        questionsCount: 5,
        timeLimitMinutes: 12,
        maxScore: 25,
        difficulty: 'Medium',
        dueDate: '2025-11-09',
        status: 'Not Started',
        questions: [
          {
            id: 'se2-1',
            question: 'Which testing technique evaluates internal code structures, logic branches, and cyclomatic complexity?',
            options: ['White Box Testing', 'Black Box Testing', 'Monkey Testing', 'Acceptance Testing'],
            correctIndex: 0,
            explanation: 'White box (structural) testing requires direct knowledge and inspection of source code paths.'
          },
          {
            id: 'se2-2',
            question: 'What metric measures the quantitative structural complexity of code by counting linearly independent execution paths?',
            options: ['McCabe’s Cyclomatic Complexity', 'Function Points (FP)', 'Halstead Software Science', 'Lines of Code (LOC)'],
            correctIndex: 0,
            explanation: 'Cyclomatic Complexity V(G) = E - N + 2P computes the number of independent basis paths.'
          },
          {
            id: 'se2-3',
            question: 'In Black Box Testing, dividing the input domain into groups of valid and invalid values is known as what?',
            options: ['Equivalence Class Partitioning', 'Mutation Testing', 'Control Flow Graphing', 'Stress Testing'],
            correctIndex: 0,
            explanation: 'Equivalence Partitioning divides inputs into classes where all elements are assumed to be treated identically by the system.'
          },
          {
            id: 'se2-4',
            question: 'What is Regression Testing?',
            options: [
              'Re-running existing tests to verify that new code modifications have not broken existing functionality',
              'Testing mathematical linear regressions in AI code',
              'Testing older versions of operating systems for backwards compatibility',
              'Simulating hardware degradation under stress'
            ],
            correctIndex: 0,
            explanation: 'Regression testing ensures bug fixes or new features do not introduce unintended side effects in existing code.'
          },
          {
            id: 'se2-5',
            question: 'In Object-Oriented Design, High Cohesion and Low Coupling signify what quality attribute?',
            options: [
              'Clean, maintainable, modular, and testable software architecture',
              'Slow execution performance due to too many classes',
              'High susceptibility to memory leaks',
              'Inability to scale horizontally'
            ],
            correctIndex: 0,
            explanation: 'High cohesion (focused responsibilities) and low coupling (minimal inter-class dependencies) are hallmarks of robust architecture.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'SE-RES-1',
        title: 'Agile & Scrum Engineering Playbook: Epics, User Stories & Story Points',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        category: 'Notes',
        fileFormat: 'PDF',
        fileSize: '3.2 MB',
        uploadedBy: 'Prof. Suresh Kumar',
        uploadedDate: '2025-09-14',
        downloadsCount: 154,
        description: 'Practical guide to writing INVEST-compliant user stories, acceptance criteria, velocity calculation, and burndown charts.',
        topicsCovered: ['User Stories', 'Planning Poker', 'Burndown & Burnup Charts', 'CI/CD Pipeline Integration']
      },
      {
        id: 'SE-RES-2',
        title: 'Software Testing & Quality Assurance Cheatsheet: Black Box vs White Box',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        category: 'Cheat Sheet',
        fileFormat: 'PDF',
        fileSize: '1.2 MB',
        uploadedBy: 'Prof. Suresh Kumar',
        uploadedDate: '2025-10-06',
        downloadsCount: 188,
        description: 'Complete comparison matrix of Equivalence Partitioning, Boundary Value Analysis, Basis Path Testing, and Code Coverage metrics.',
        topicsCovered: ['BVA Techniques', 'Statement vs Branch Coverage', 'Mutation Testing', 'Test Case Design Templates']
      }
    ],
    assignments: [
      {
        id: 'SE-ASN-1',
        title: 'Assignment 1: Software Requirements Specification (SRS) Document for FinTech App',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        faculty: 'Prof. Suresh Kumar',
        assignedDate: '2025-09-16',
        dueDate: '2025-09-29',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Graded',
        submissionDate: '2025-09-28',
        submittedFileName: 'CS21B021_FinTech_SRS.pdf',
        marksAwarded: 8.0,
        facultyFeedback: 'Good functional breakdown and use cases. Pay extra attention to security and encryption non-functional requirements.',
        instructions: 'Author a complete IEEE 830-compliant SRS document for a digital wallet application with peer-to-peer transfers.',
        problemStatement: 'Include Use Case diagrams, Data Flow Diagrams (Level 0 and 1), and explicit performance response time SLAs.',
        rubric: [
          { criterion: 'IEEE 830 Format & Structure', marks: 3 },
          { criterion: 'Use Case & DFD Clarity', marks: 4 },
          { criterion: 'Non-Functional Requirements', marks: 3 }
        ]
      },
      {
        id: 'SE-ASN-2',
        title: 'Assignment 2: Automated JUnit Test Suite & Cyclomatic Complexity Analysis',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        faculty: 'Prof. Suresh Kumar',
        assignedDate: '2025-10-17',
        dueDate: '2025-11-06',
        maxMarks: 10,
        weightagePct: 5,
        status: 'Pending',
        instructions: 'Write a comprehensive test suite in JUnit 5 achieving 90%+ branch and statement coverage on an e-commerce cart service.',
        problemStatement: 'Compute McCabe’s cyclomatic complexity for all service methods and attach JaCoCo code coverage report.',
        rubric: [
          { criterion: 'JUnit Test Case Design', marks: 4 },
          { criterion: '90%+ JaCoCo Coverage', marks: 4 },
          { criterion: 'Complexity Graph Calculation', marks: 2 }
        ]
      }
    ],
    assessments: [
      {
        id: 'SE-ASM-1',
        title: 'Continuous Internal Evaluation 1 (CIE-1)',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        type: 'CIE',
        date: '2025-10-07',
        timeSlot: '02:00 PM - 03:30 PM',
        venue: 'Exam Hall B-101',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Completed',
        studentScore: 16,
        classAverage: 14.1,
        highestScore: 19,
        syllabusModules: ['Unit 1: Process Models & Methodologies', 'Unit 2: Requirement Engineering'],
        topicsChecklist: [
          { topic: 'Waterfall, Agile, Spiral, and RAD Comparison', completed: true },
          { topic: 'Scrum Roles, Artifacts, and Ceremonies', completed: true },
          { topic: 'Functional vs Non-Functional Requirements', completed: true },
          { topic: 'Use Case and Data Flow Diagrams', completed: true }
        ],
        blueprint: 'Part A: 5 Short Questions (10 marks). Part B: 2 Analytical Scenario Questions on Agile sprint planning and DFD design (10 marks).',
        pastPapersAvailable: true
      },
      {
        id: 'SE-ASM-2',
        title: 'Continuous Internal Evaluation 2 (CIE-2)',
        subjectCode: 'CS505',
        subjectName: 'Software Engineering',
        type: 'CIE',
        date: '2025-11-18',
        timeSlot: '10:00 AM - 11:30 AM',
        venue: 'Exam Hall B-101',
        durationMinutes: 90,
        maxMarks: 20,
        weightagePct: 20,
        status: 'Upcoming',
        syllabusModules: ['Unit 3: Design Patterns & Architecture', 'Unit 4: Software Testing & Maintenance'],
        topicsChecklist: [
          { topic: 'Cohesion, Coupling, and Modularity', completed: true },
          { topic: 'Equivalence Partitioning and BVA', completed: false },
          { topic: 'Cyclomatic Complexity and Basis Path Testing', completed: false },
          { topic: 'Software Maintenance Types (Corrective, Adaptive, etc.)', completed: false }
        ],
        blueprint: 'Part A: 5 Questions (10 marks). Part B: 1 Cyclomatic complexity flow graph and 1 Boundary Value Analysis test suite problem (10 marks).',
        pastPapersAvailable: true
      }
    ]
  }
};
