import dotenv from 'dotenv';
dotenv.config();

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface StudyChatRequest {
  message: string;
  subject?: string;
  conversationHistory?: ChatMessage[];
  studentId?: string;
  studentName?: string;
}

export interface StudyChatResponse {
  success: boolean;
  requestId: string;
  reply: string;
  subject: string;
  aiProvider: {
    configured: boolean;
    provider: 'gemini' | 'openai' | 'none';
    model: string;
    mode: 'live-generative-ai' | 'offline-academic-engine';
    setupInstructions?: string;
  };
  contextUsed: {
    historyLength: number;
    subject: string;
    followUpDetected: boolean;
  };
  timestamp: string;
}

// ─── OFFLINE ACADEMIC KNOWLEDGE BASE & CONTEXT ENGINE ─────────────────────────
// Dedicated, rich academic engine for CS/IT engineering subjects when live AI key is not set.

function getOfflineAcademicAnswer(
  rawQuery: string,
  subject: string,
  history: ChatMessage[]
): string {
  const q = rawQuery.toLowerCase().trim();

  // Inspect previous turn in conversation history for follow-up context
  const previousAssistantMsg = [...history]
    .reverse()
    .find((m) => m.role === 'assistant')?.content || '';
  const previousUserMsg = [...history]
    .reverse()
    .find((m) => m.role === 'user')?.content || '';

  const isFollowUp = history.length > 0;
  const prevLower = (previousUserMsg + ' ' + previousAssistantMsg).toLowerCase();

  // ── 1. FOLLOW-UP: "EXPLAIN IN SIMPLE WORDS / SIMPLIFY" ──────────────────────
  if (
    q.includes('simple words') ||
    q.includes('simpler words') ||
    q.includes('simplify') ||
    q.includes('explain simply') ||
    q.includes('in layman') ||
    q.includes('easy explanation')
  ) {
    if (prevLower.includes('normalization') || prevLower.includes('normal form') || q.includes('normalization')) {
      return `### 💡 Normalization Explained in Simple Words

Imagine you run a college library and write everything in **one giant spreadsheet**:
Whenever a student borrows a book, you write:
\`Student Name | Student Phone | Student Address | Book Title | Author | Date\`

**The Problem:**
If Arjun Sharma borrows 10 books, you write his phone number and address **10 separate times**!
- If Arjun changes his phone number, you have to update it in all 10 places. Miss one, and you have conflicting records (**Update Anomaly**).
- If Arjun returns his only book and you delete that row, you accidentally delete Arjun's contact details from college records (**Delete Anomaly**)!

**The Solution — Normalization:**
Instead of one messy sheet, split it into **two clean, connected tables**:
1. **Students Table:** \`StudentID | Name | Phone | Address\` (Each student listed once).
2. **Borrow Records Table:** \`BorrowID | StudentID | BookID | Date\`

**Key Takeaways:**
1. **1NF:** No multiple phone numbers jammed into one cell (one value per box).
2. **2NF:** Every detail in the table belongs to the main ID (no partial leftovers).
3. **3NF:** No chain reactions (e.g. department head shouldn't depend on course name if course depends on student ID).

In simple terms: **"Put every fact in exactly one place and link them using keys."**`;
    }

    if (prevLower.includes('binary search') || q.includes('binary search')) {
      return `### 💡 Binary Search Explained in Simple Words

Think of guessing a secret number between **1 and 100**:
- If you guess sequentially: 1, 2, 3, 4... you might need **100 guesses** (Linear Search).
- Instead, you guess **50** (the middle).
  - The host says: *"Too low!"*
  - Now you instantly eliminate numbers 1 through 50!
  - Your next guess is **75** (middle of 51–100).
  - The host says: *"Too high!"*
  - You eliminate 75 through 100.
  - Now you only check 51 to 74.

Within just **7 guesses**, you can find any number from 1 to 100!
That is Binary Search: **Cut the search space in half with every single step.**
Condition: The list **must be sorted** first.`;
    }

    if (prevLower.includes('dbms') || q.includes('dbms')) {
      return `### 💡 DBMS Explained in Simple Words

Think of a **DBMS (Database Management System)** like a professional, secure digital bank vault for information.
- Without DBMS (Old file system): You keep loose Excel files on a desktop. Anyone can delete them, two people editing at once causes conflicts, and there is no backup if the power cuts.
- With DBMS: A dedicated digital librarian oversees the vault. It guarantees:
  1. **Security:** Only authorized users see specific data.
  2. **Concurrency:** 1,000 students can check exam results at the exact same second without crashing.
  3. **Reliability (ACID):** If money is deducted from your bank account during an online payment, it is guaranteed to either reach the college or revert back—never lost in limbo.`;
    }

    return `### 💡 Simplified Summary of Previous Concept

Here is the concept stripped of heavy technical jargon:

1. **The Core Purpose:** It solves the headache of unorganized, redundant, or inefficient manual tracking.
2. **How It Works:** Break down complex systems into modular, well-defined components connected by clear rules.
3. **Everyday Analogy:** Think of an organized kitchen spice rack where each jar has one label, versus throwing all ingredients into a single drawer.

*Feel free to ask for a specific code example, exam notes, or diagram!*`;
  }

  // ── 2. FOLLOW-UP: "EXPLAIN THIS PROGRAM LINE BY LINE" ──────────────────────
  if (
    (q.includes('line by line') || q.includes('explain this program') || q.includes('explain code') || q.includes('step by step')) &&
    (prevLower.includes('binary search') || prevLower.includes('def binary_search') || q.includes('binary search'))
  ) {
    return `### 🔍 Line-by-Line Explanation of the Binary Search Program

Here is how each line of the Python binary search algorithm works:

\`\`\`python
def binary_search(arr, target):
\`\`\`
- **Line 1:** Declares the function named \`binary_search\` accepting two parameters: \`arr\` (a sorted list) and \`target\` (the value to locate).

\`\`\`python
    low = 0
    high = len(arr) - 1
\`\`\`
- **Lines 2–3:** Initializes two boundary pointers:
  - \`low\`: Points to the start index (\`0\`).
  - \`high\`: Points to the last valid index (\`len(arr) - 1\`).

\`\`\`python
    while low <= high:
\`\`\`
- **Line 4:** Loop condition. Keeps searching as long as the search window is valid. If \`low > high\`, the target is not in the array.

\`\`\`python
        mid = low + (high - low) // 2
\`\`\`
- **Line 5:** Finds the middle index. Using \`low + (high - low) // 2\` prevents integer overflow issues that can happen in languages with fixed integer sizes.

\`\`\`python
        if arr[mid] == target:
            return mid
\`\`\`
- **Lines 6–7:** **Best Case ($O(1)$)**. If the element at the middle index matches our \`target\`, return the index immediately.

\`\`\`python
        elif arr[mid] < target:
            low = mid + 1
\`\`\`
- **Lines 8–9:** Target is in the **right half**. Since \`arr\` is sorted, all elements from \`low\` to \`mid\` are smaller than \`target\`. We shift \`low\` to \`mid + 1\`.

\`\`\`python
        else:
            high = mid - 1
\`\`\`
- **Lines 10–11:** Target is in the **left half**. All elements from \`mid\` to \`high\` are larger than \`target\`. We shift \`high\` to \`mid - 1\`.

\`\`\`python
    return -1
\`\`\`
- **Line 12:** If the loop terminates without finding the target, return \`-1\` to indicate "Not Found".

**Complexity Summary:**
- **Time Complexity:** $O(\\log_2 n)$ because the array length divides by 2 in each iteration.
- **Auxiliary Space:** $O(1)$ constant memory.`;
  }

  // ── 3. MCQs: "GIVE ME 5 MCQS" ─────────────────────────────────────────────
  if (
    q.includes('mcq') ||
    q.includes('quiz') ||
    q.includes('multiple choice') ||
    q.includes('questions with options')
  ) {
    if (q.includes('normalization') || prevLower.includes('normalization')) {
      return `### 📝 5 MCQs on Normalization in DBMS

---

#### **Q1. Which normal form strictly eliminates repeating groups and ensures atomic attributes?**
- **A)** 2NF
- **B)** 1NF
- **C)** 3NF
- **D)** BCNF
> **Correct Answer: B) 1NF**
> *Explanation:* First Normal Form (1NF) disallows multi-valued or composite attributes; every attribute in every tuple must contain an atomic (indivisible) value.

---

#### **Q2. A table is in 2NF if and only if it is in 1NF and:**
- **A)** It contains no transitive dependencies
- **B)** Every determinant is a candidate key
- **C)** No non-prime attribute is partially dependent on any candidate key
- **D)** It contains no multivalued dependencies
> **Correct Answer: C) No non-prime attribute is partially dependent on any candidate key**
> *Explanation:* Second Normal Form (2NF) eliminates partial dependency. Every non-prime attribute must depend fully on the complete primary key.

---

#### **Q3. If a table has functional dependencies $A \\to B$ and $B \\to C$, the dependency $A \\to C$ is called:**
- **A)** Partial Dependency
- **B)** Multi-valued Dependency
- **C)** Transitive Dependency
- **D)** Trivial Dependency
> **Correct Answer: C) Transitive Dependency**
> *Explanation:* Transitive dependency occurs when an attribute depends on another non-key attribute, which in turn depends on the primary key ($A \\to B \\to C$). 3NF eliminates this.

---

#### **Q4. In Boyce-Codd Normal Form (BCNF), for every functional dependency $X \\to Y$:**
- **A)** $Y$ must be a prime attribute
- **B)** $X$ must be a super key
- **C)** $Y$ must be a super key
- **D)** $X$ and $Y$ must be prime attributes
> **Correct Answer: B) X must be a super key**
> *Explanation:* BCNF is a stricter version of 3NF. In BCNF, the determinant ($X$) must always be a super key.

---

#### **Q5. Which anomaly occurs when deleting a student's enrolled course record inadvertently deletes their personal details?**
- **A)** Insertion Anomaly
- **B)** Deletion Anomaly
- **C)** Modification Anomaly
- **D)** Redundancy Anomaly
> **Correct Answer: B) Deletion Anomaly**
> *Explanation:* Deletion anomaly happens when the loss of one set of data forces the unintended loss of unrelated data due to poor schema design.`;
    }

    if (q.includes('binary search') || prevLower.includes('binary search') || q.includes('daa')) {
      return `### 📝 5 MCQs on Binary Search & DAA

---

#### **Q1. What is the fundamental prerequisite for applying Binary Search on an array?**
- **A)** Elements must be unique integers
- **B)** Array elements must be sorted in ascending or descending order
- **C)** Array size must be a power of two
- **D)** Array must be implemented as a linked list
> **Correct Answer: B) Array elements must be sorted**
> *Explanation:* Binary search relies on ordering to discard half the search space at each comparison.

---

#### **Q2. What is the worst-case time complexity of Binary Search on a sorted array of $n$ elements?**
- **A)** $O(1)$
- **B)** $O(n)$
- **C)** $O(\\log_2 n)$
- **D)** $O(n \\log_2 n)$
> **Correct Answer: C) O(log₂ n)**
> *Explanation:* At each step, the search interval is halved ($n, n/2, n/4, \\dots, 1$), taking $\\lceil \\log_2 n \\rceil$ comparisons.

---

#### **Q3. What is the auxiliary space complexity of iterative binary search?**
- **A)** $O(1)$
- **B)** $O(\\log n)$
- **C)** $O(n)$
- **D)** $O(n^2)$
> **Correct Answer: A) O(1)**
> *Explanation:* Iterative binary search uses only pointers (\`low\`, \`high\`, \`mid\`) and requires constant extra space.

---

#### **Q4. In Python, why is \`mid = low + (high - low) // 2\` preferred over \`mid = (low + high) // 2\`?**
- **A)** To avoid float division
- **B)** To prevent potential integer overflow in systems with fixed 32-bit registers
- **C)** Because it runs in half the CPU cycles
- **D)** It is required by PEP 8 guidelines
> **Correct Answer: B) To prevent potential integer overflow**
> *Explanation:* In languages like C/C++/Java, \`(low + high)\` can exceed \`2^31 - 1\`, resulting in negative indices. \`low + (high - low) // 2\` is mathematically equivalent and overflow-safe.

---

#### **Q5. In an array of 1,024 sorted elements, what is the maximum number of comparisons needed to find an element?**
- **A)** 1024
- **B)** 512
- **C)** 10
- **D)** 11
> **Correct Answer: D) 11**
> *Explanation:* $\\log_2(1024) = 10$. Including the final comparison for failure or match, at most $10 + 1 = 11$ comparisons are required.`;
    }

    // Default DBMS MCQs
    return `### 📝 5 MCQs on Database Management Systems (DBMS)

1. **Which property ensures that a transaction is all-or-nothing?**
   - **A)** Atomicity *(Correct)*
   - **B)** Consistency
   - **C)** Isolation
   - **D)** Durability

2. **Which SQL command is a Data Definition Language (DDL) command?**
   - **A)** SELECT
   - **B)** INSERT
   - **C)** CREATE *(Correct)*
   - **D)** UPDATE

3. **In the relational model, a row in a relation is known as a:**
   - **A)** Attribute
   - **B)** Tuple *(Correct)*
   - **C)** Domain
   - **D)** Schema

4. **Which key uniquely identifies a record and CANNOT contain NULL values?**
   - **A)** Candidate Key
   - **B)** Foreign Key
   - **C)** Primary Key *(Correct)*
   - **D)** Super Key

5. **Which component of DBMS is responsible for managing concurrent transaction execution?**
   - **A)** Query Optimizer
   - **B)** Concurrency Control Manager *(Correct)*
   - **C)** Storage Engine
   - **D)** Buffer Manager`;
  }

  // ── 4. CODE: "WRITE A PYTHON PROGRAM FOR BINARY SEARCH" ──────────────────
  if (
    q.includes('binary search') &&
    (q.includes('program') || q.includes('python') || q.includes('code') || q.includes('write'))
  ) {
    return `### 🐍 Python Program: Binary Search Algorithm

Here is the clean, production-ready Python implementation for Binary Search with both **Iterative** and **Recursive** approaches:

\`\`\`python
"""
Binary Search Algorithm in Python
Time Complexity: O(log n)
Auxiliary Space: O(1) iterative, O(log n) recursive
"""

def binary_search_iterative(arr: list[int], target: int) -> int:
    """
    Performs iterative binary search on a sorted list.
    Returns the 0-based index of target if found, else -1.
    """
    low = 0
    high = len(arr) - 1

    while low <= high:
        # Calculate mid index avoiding overflow
        mid = low + (high - low) // 2

        if arr[mid] == target:
            return mid          # Element found!
        elif arr[mid] < target:
            low = mid + 1       # Search in right half
        else:
            high = mid - 1      # Search in left half

    return -1                   # Target not found


def binary_search_recursive(arr: list[int], low: int, high: int, target: int) -> int:
    """
    Performs recursive binary search on a sorted list.
    """
    if low > high:
        return -1

    mid = low + (high - low) // 2

    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, mid + 1, high, target)
    else:
        return binary_search_recursive(arr, low, mid - 1, target)


# ─── Example Usage & Test Cases ─────────────────────────────────────────
if __name__ == "__main__":
    dataset = [12, 24, 32, 45, 57, 68, 79, 88, 93, 105]
    search_target = 68

    result_idx = binary_search_iterative(dataset, search_target)
    print(f"Sorted Array: {dataset}")
    print(f"Target: {search_target}")

    if result_idx != -1:
        print(f"✅ Found {search_target} at index {result_idx} (Element: {dataset[result_idx]})")
    else:
        print(f"❌ Element {search_target} not present in array")
\`\`\`

#### **Output:**
\`\`\`text
Sorted Array: [12, 24, 32, 45, 57, 68, 79, 88, 93, 105]
Target: 68
✅ Found 68 at index 5 (Element: 68)
\`\`\`

#### **Key Properties:**
- **Best Case Time:** $O(1)$ (Target is at the exact middle).
- **Average & Worst Case Time:** $O(\\log_2 n)$.
- **Space Complexity:** $O(1)$ iterative memory.`;
  }

  // ── 5. TOPIC: NORMALIZATION IN DBMS ───────────────────────────────────────
  if (
    q.includes('normalization') ||
    q.includes('normal form') ||
    q.includes('1nf') ||
    q.includes('2nf') ||
    q.includes('3nf') ||
    q.includes('bcnf')
  ) {
    return `### 🗄️ Normalization in DBMS

**Normalization** is the systematic technique of organizing data in a relational database to minimize **data redundancy** (duplication) and eliminate undesirable anomalies (**Insertion**, **Update**, and **Deletion** anomalies).

---

#### 1. Database Anomalies (Why We Normalize)
- **Insertion Anomaly:** Inability to insert a record without inserting unrelated null data (e.g., cannot register a new department until a student joins).
- **Deletion Anomaly:** Deletion of one record accidentally deletes independent critical data.
- **Update Anomaly:** Updating an address requires mutating 100 rows; failure to update all causes data inconsistency.

---

#### 2. The Normal Forms Hierarchy

| Normal Form | Key Requirement | Eliminates |
| :--- | :--- | :--- |
| **1NF** | Attributes must hold **atomic** (single, indivisible) values; no repeating groups. | Multi-valued attributes & nested tables |
| **2NF** | Must be in 1NF **AND** no partial dependency (every non-key attribute depends on the whole primary key). | Partial functional dependencies |
| **3NF** | Must be in 2NF **AND** no transitive dependency (no non-key attribute depends on another non-key attribute). | Transitive dependencies ($A \\to B \\to C$) |
| **BCNF** | Must be in 3NF **AND** in every functional dependency $X \\to Y$, $X$ must be a **Super Key**. | Anomalies where determinant is not a candidate key |

---

#### 3. Step-by-Step Example

**Non-1NF Table (Multi-valued):**
\`\`\`text
StudentID | Name         | Courses
STU001    | Arjun Sharma | DBMS, DAA, Networks
\`\`\`

**Converted to 1NF (Atomic Values):**
\`\`\`text
StudentID | Name         | Course
STU001    | Arjun Sharma | DBMS
STU001    | Arjun Sharma | DAA
STU001    | Arjun Sharma | Networks
\`\`\`

**Converted to 2NF & 3NF (Decomposed into Relations):**
- **\`Students\` Table:** \`StudentID (PK) | Name | Department\`
- **\`Courses\` Table:** \`CourseID (PK) | CourseName | Credits\`
- **\`Enrollment\` Table:** \`StudentID (FK) | CourseID (FK) | Grade\``;
  }

  // ── 6. TOPIC: WHAT IS DBMS? ───────────────────────────────────────────────
  if (
    q.includes('what is dbms') ||
    q.includes('explain dbms') ||
    q.includes('database management') ||
    (q.includes('dbms') && q.length < 20)
  ) {
    return `### 🗄️ Database Management System (DBMS)

A **Database Management System (DBMS)** is specialized software that enables users and applications to define, create, maintain, and securely query a centralized database.

---

#### 1. Core Functions of a DBMS
1. **Data Definition (DDL):** Defines schemas, constraints, and relationships (e.g., \`CREATE\`, \`ALTER\`, \`DROP\`).
2. **Data Manipulation (DML):** Inserting, updating, and querying records (e.g., \`SELECT\`, \`INSERT\`, \`UPDATE\`).
3. **Data Security & Privacy:** Access control, role-based permissions, and encryption.
4. **Concurrency Control:** Allows simultaneous read/write operations without race conditions.
5. **Crash Recovery:** Guarantees data durability via Write-Ahead Logging (WAL) and checkpoints.

---

#### 2. The ACID Properties (Gold Standard of Transactions)
- **Atomicity:** "All or nothing" — every transaction succeeds completely or rolls back entirely.
- **Consistency:** Transactions transition the database from one valid state to another, respecting all constraints.
- **Isolation:** Concurrent transactions execute without interfering with one another.
- **Durability:** Once committed, transaction changes survive hardware or power crashes.

---

#### 3. DBMS vs. Traditional File System

| Feature | DBMS | Traditional File System |
| :--- | :--- | :--- |
| **Data Redundancy** | Minimized via Normalization | High redundancy across multiple files |
| **Data Inconsistency** | Automatically prevented | Common due to scattered duplicates |
| **Query Language** | Powerful SQL declarative queries | Custom parsing scripts required |
| **Concurrent Access** | Built-in 2-Phase Locking & MVCC | Prone to file locking or race overwrites |
| **Backup & Recovery** | Automated ACID transaction logs | Manual file copies prone to corruption |`;
  }

  // ── 7. EXAM NOTES: 3, 5, OR 6 MARKS ───────────────────────────────────────
  if (q.includes('mark') || q.includes('exam answer') || q.includes('short note')) {
    const markCount = q.includes('3') ? 3 : q.includes('6') ? 6 : 5;
    return `### 📝 University Exam Answer (${markCount} Marks) — ${subject}

#### **Topic: Core Fundamentals of ${subject}**

**1. Standard Definition (1 Mark):**
A systematic mechanism designed to store, retrieve, and govern data/algorithms with predictable asymptotic bounds and deterministic integrity constraints.

**2. Architecture & Working (${Math.ceil(markCount / 2)} Marks):**
- **Input / Layer 1:** Receives structured payloads, validates schema conformance.
- **Processing Engine:** Uses modular indexing and execution plans to optimize computational throughput.
- **Storage / State:** Persists state across transactional boundaries ensuring fault isolation.

**3. Key Features / Benefits (${Math.floor(markCount / 2)} Marks):**
- **High Concurrency:** Supports multiple concurrent execution threads without deadlocks.
- **Integrity Validation:** Prevents invalid states via strict type checking and assertions.
- **Scalability:** Capable of handling $O(\\log n)$ or linear scaling under increased campus workload.

**4. Real-World Application Example:**
University student portal managing 10,000 active student records, exam grades, and placement eligibility checks in real-time.`;
  }

  // ── 8. SUBJECT-SPECIFIC FALLBACKS (DAA, NETWORKS, AI/ML, OS, CLOUD) ───────
  if (q.includes('daa') || subject === 'DAA' || q.includes('algorithm')) {
    return `### ⚡ Design & Analysis of Algorithms (DAA)

**Key Algorithmic Paradigms:**
1. **Divide and Conquer:** Break problem into independent sub-problems (e.g., Merge Sort, Binary Search).
2. **Dynamic Programming:** Solves subproblems once and stores answers in a table (e.g., 0/1 Knapsack, LCS).
3. **Greedy Algorithms:** Makes locally optimal choice at each step (e.g., Dijkstra, Prim's, Kruskal's).
4. **Backtracking:** Explores all possibilities with pruning (e.g., N-Queens, Sudoku).

**Asymptotic Time Complexity Bounds:**
- **$O(1)$:** Constant time (Array index access).
- **$O(\\log n)$:** Logarithmic (Binary search).
- **$O(n)$:** Linear search.
- **$O(n \\log n)$:** Merge Sort, Quick Sort (average).
- **$O(n^2)$:** Bubble Sort, Insertion Sort.`;
  }

  if (q.includes('network') || subject === 'Computer Networks') {
    return `### 🌐 Computer Networks — Core Concepts

**OSI 7-Layer Reference Model:**
1. **Application (Layer 7):** HTTP, HTTPS, DNS, SMTP, FTP.
2. **Presentation (Layer 6):** Data encryption, compression, SSL/TLS.
3. **Session (Layer 5):** Establishes, manages, and terminates sessions.
4. **Transport (Layer 4):** TCP (reliable, connection-oriented) vs UDP (fast, connectionless).
5. **Network (Layer 3):** Logical addressing (IP), routing (OSPF, BGP).
6. **Data Link (Layer 2):** Framing, MAC addressing, error detection (CRC).
7. **Physical (Layer 1):** Bit transmission over copper, fiber, or wireless radio.`;
  }

  // ── 9. DYNAMIC GENERAL ACADEMIC RESPONSE ───────────────────────────────────
  return `### 📚 Study Assistant: ${subject}

**Regarding your question:** *"${rawQuery}"*

#### 1. Core Concept Overview
In **${subject}**, this topic deals with fundamental principles governing data flow, computational efficiency, and practical system design.

#### 2. Key Technical Highlights
- **Theoretical Basis:** Formulated around mathematical and logical frameworks to guarantee correctness.
- **Implementation Strategy:** Structured sequentially to ensure optimal resource utilization and modular maintainability.
- **Common Exam Trap:** Confusing conceptual definitions with physical implementation details. Always specify assumptions and asymptotic boundaries.

#### 3. Next Steps & Follow-Up Suggestions
You can ask me:
- *"Explain this in simpler words with a real-life analogy"*
- *"Give me a code example in Python / Java"*
- *"Explain the code line by line"*
- *"Give me 5 MCQs on this topic"*
- *"Provide a 5-mark university exam answer"*`;
}

// ─── MAIN STUDY AI ORCHESTRATOR ──────────────────────────────────────────────

export async function processStudyChat(
  req: StudyChatRequest
): Promise<StudyChatResponse> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const subject = req.subject || 'Computer Science';
  const history = req.conversationHistory || [];
  const message = (req.message || '').trim();

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  // Audit log per specification (without leaking private data)
  console.log(
    `[StudyAssistant] Req: ${requestId} | Student: ${req.studentId || 'anon'} | Subject: ${subject} | AI Key Configured: ${
      Boolean(geminiKey || openAiKey)
    } | Prompt Len: ${message.length}`
  );

  // ── A. LIVE GENERATIVE AI: GOOGLE GEMINI ──────────────────────────────────
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      const systemInstruction = `You are the EduPulse AI Study Assistant, an expert university academic mentor for engineering students.
Subject context: ${subject}. Student: ${req.studentName || 'Student'}.
Provide clear, structured, technical yet accessible explanations. Support code examples with line-by-line notes, MCQs, step-by-step numerical solutions, and simple analogies when asked.
Do not hallucinate syllabus. Format code blocks with language identifiers.`;

      // Build turn-by-turn contents
      const contents = [
        ...history.slice(-8).map((h) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: `[Subject: ${subject}]\n${message}` }],
        },
      ];

      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 1400,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          return {
            success: true,
            requestId,
            reply: text,
            subject,
            aiProvider: {
              configured: true,
              provider: 'gemini',
              model: 'Google Gemini 1.5 Flash',
              mode: 'live-generative-ai',
            },
            contextUsed: {
              historyLength: history.length,
              subject,
              followUpDetected: history.length > 0,
            },
            timestamp: new Date().toISOString(),
          };
        }
      }
      console.warn(`[StudyAssistant] Gemini API returned status ${res.status}. Falling back to Academic Engine.`);
    } catch (apiErr: any) {
      console.error('[StudyAssistant] Gemini API call exception:', apiErr.message);
    }
  }

  // ── B. LIVE GENERATIVE AI: OPENAI (Fallback if OpenAI Key Provided) ────────
  if (openAiKey) {
    try {
      const url = 'https://api.openai.com/v1/chat/completions';
      const messages = [
        {
          role: 'system',
          content: `You are EduPulse AI Study Assistant for university engineering students. Current subject: ${subject}.`,
        },
        ...history.slice(-8).map((h) => ({
          role: h.role,
          content: h.content,
        })),
        { role: 'user', content: message },
      ];

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.65,
          max_tokens: 1200,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || '';
        if (text) {
          return {
            success: true,
            requestId,
            reply: text,
            subject,
            aiProvider: {
              configured: true,
              provider: 'openai',
              model: 'OpenAI GPT-4o-mini',
              mode: 'live-generative-ai',
            },
            contextUsed: {
              historyLength: history.length,
              subject,
              followUpDetected: history.length > 0,
            },
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (openAiErr: any) {
      console.error('[StudyAssistant] OpenAI API error:', openAiErr.message);
    }
  }

  // ── C. OFFLINE ACADEMIC KNOWLEDGE BASE (Truthful, non-repetitive fallback) ─
  const offlineAnswer = getOfflineAcademicAnswer(message, subject, history);

  return {
    success: true,
    requestId,
    reply: offlineAnswer,
    subject,
    aiProvider: {
      configured: false,
      provider: 'none',
      model: 'EduPulse Local Academic Engine v2.0',
      mode: 'offline-academic-engine',
      setupInstructions:
        'To enable live Google Gemini AI, obtain a free API key at https://aistudio.google.com and set GEMINI_API_KEY="your_api_key" in server/.env.',
    },
    contextUsed: {
      historyLength: history.length,
      subject,
      followUpDetected: history.length > 0,
    },
    timestamp: new Date().toISOString(),
  };
}
