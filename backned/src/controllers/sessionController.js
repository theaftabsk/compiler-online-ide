// In-Memory Database Store with initial seed data
const sessions = new Map();
const attendees = new Map(); // sessionId -> Map(studentRoll -> attendeeData)
const submissions = new Map(); // sessionId -> Array of submissions

// Initialize default demonstration session
const DEFAULT_SESSION_CODE = 'BW-AIML-J-26X91';

const defaultSession = {
  id: 'sess-bw-aiml-j-2026',
  institution: 'Brainware University',
  department: 'Artificial Intelligence & Machine Learning (AI & ML)',
  section: 'Section J',
  semester: '3rd Semester',
  subject: 'Programming in C',
  labRoom: 'Lab 204',
  facultyName: 'Dr. S. Mukherjee',
  sessionCode: DEFAULT_SESSION_CODE,
  status: 'ACTIVE',
  totalCapacity: 60,
  createdAt: new Date().toISOString(),
  questions: [
    {
      id: 'q-101',
      title: 'Check Positive, Negative, or Zero',
      description: 'Write a program in C that takes an integer as input and checks whether the number is positive, negative, or zero. Print "Positive", "Negative", or "Zero" accordingly.',
      allowedLanguages: ['c', 'cpp', 'java', 'python'],
      starterCode: {
        c: '#include <stdio.h>\n\nint main() {\n    int num;\n    scanf("%d", &num);\n    \n    if (num > 0) {\n        printf("Positive\\n");\n    } else if (num < 0) {\n        printf("Negative\\n");\n    } else {\n        printf("Zero\\n");\n    }\n    \n    return 0;\n}',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int num;\n    cin >> num;\n    if (num > 0) cout << "Positive" << endl;\n    else if (num < 0) cout << "Negative" << endl;\n    else cout << "Zero" << endl;\n    return 0;\n}',
        java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int num = sc.nextInt();\n        if (num > 0) System.out.println("Positive");\n        else if (num < 0) System.out.println("Negative");\n        else System.out.println("Zero");\n    }\n}',
        python: 'num = int(input())\nif num > 0:\n    print("Positive")\nelif num < 0:\n    print("Negative")\nelse:\n    print("Zero")'
      },
      testCases: [
        { id: 'tc-1', inputData: '10', expectedOutput: 'Positive', isHidden: false },
        { id: 'tc-2', inputData: '-5', expectedOutput: 'Negative', isHidden: false },
        { id: 'tc-3', inputData: '0', expectedOutput: 'Zero', isHidden: false },
        { id: 'tc-4', inputData: '9999', expectedOutput: 'Positive', isHidden: true }
      ]
    }
  ]
};

sessions.set(DEFAULT_SESSION_CODE, defaultSession);

// Seed pre-populated student attendees (representing 60 machine lab grid)
const defaultAttendeesMap = new Map();

// Seed Aftab Sk (Roll 538, Section J)
defaultAttendeesMap.set('538', {
  rollNumber: '538',
  name: 'Aftab Sk',
  section: 'Section J',
  machineNumber: 'PC-14',
  onlineStatus: 'ONLINE',
  codingStatus: 'CODING',
  language: 'c',
  score: 100,
  passedCases: '3/3',
  submitted: true,
  tabSwitches: 0,
  lastHeartbeat: new Date().toISOString(),
  currentCode: defaultSession.questions[0].starterCode.c
});

// Seed other simulated lab students across PCs
const sampleNames = [
  'Rohan Das', 'Priya Sharma', 'Sneha Roy', 'Sourav Sen', 'Ananya Paul',
  'Debanjan Bose', 'Rahul Gupta', 'Suman Roy', 'Tania Ghosh', 'Arpan Mondal',
  'Ritika Dey', 'Subham Banerjee', 'Pooja Dutta', 'Kunal Mukherjee', 'Sayan Das'
];

for (let i = 1; i <= 35; i++) {
  const pcNum = `PC-${i < 10 ? '0' + i : i}`;
  if (pcNum === 'PC-14') continue; // Taken by Aftab Sk

  const roll = (500 + i).toString();
  const name = sampleNames[i % sampleNames.length] + ` (${roll})`;
  const isSubmitted = i % 3 === 0;
  const isOnline = i % 8 !== 0;

  defaultAttendeesMap.set(roll, {
    rollNumber: roll,
    name: name,
    section: 'Section J',
    machineNumber: pcNum,
    onlineStatus: isOnline ? 'ONLINE' : 'OFFLINE',
    codingStatus: isSubmitted ? 'SUBMITTED' : (isOnline ? 'CODING' : 'OFFLINE'),
    language: 'c',
    score: isSubmitted ? 100 : (i % 2 === 0 ? 66 : 0),
    passedCases: isSubmitted ? '3/3' : (i % 2 === 0 ? '2/3' : '0/3'),
    submitted: isSubmitted,
    tabSwitches: i % 5 === 0 ? 2 : 0,
    lastHeartbeat: new Date().toISOString(),
    currentCode: `// Student ${name} writing C practical\n#include <stdio.h>\n\nint main() {\n    printf("Student working on ${pcNum}\\n");\n    return 0;\n}`
  });
}

attendees.set(DEFAULT_SESSION_CODE, defaultAttendeesMap);

// Controllers
function createSession(req, res) {
  const {
    institution = 'Brainware University',
    department = 'AI & ML',
    section = 'Section J',
    semester = '3rd Semester',
    subject = 'Programming in C',
    labRoom = 'Lab 204',
    facultyName = 'Faculty',
    questions = []
  } = req.body;

  // Generate unique session code e.g. BW-AIML-J-XXXXX
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const deptCode = department.replace(/[^A-Z]/g, '').slice(0, 4) || 'AIML';
  const secCode = section.replace(/[^A-Z0-9]/g, '').slice(-1) || 'J';
  const sessionCode = `BW-${deptCode}-${secCode}-${randomSuffix}`;

  const newSession = {
    id: 'sess-' + Date.now(),
    institution,
    department,
    section,
    semester,
    subject,
    labRoom,
    facultyName,
    sessionCode,
    status: 'ACTIVE',
    totalCapacity: 60,
    createdAt: new Date().toISOString(),
    questions: questions.length > 0 ? questions : defaultSession.questions
  };

  sessions.set(sessionCode, newSession);
  attendees.set(sessionCode, new Map());
  submissions.set(sessionCode, []);

  res.status(201).json({ success: true, session: newSession });
}

function getSession(req, res) {
  const { code } = req.params;
  const session = sessions.get(code);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Invalid or expired session code.' });
  }

  res.json({ success: true, session });
}

function joinSession(req, res) {
  const { sessionCode, rollNumber, name, machineNumber, section } = req.body;
  const session = sessions.get(sessionCode);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  if (session.status === 'ENDED') {
    return res.status(403).json({ success: false, message: 'This practical session has been ended by the faculty.' });
  }

  let sessionAttendees = attendees.get(sessionCode);
  if (!sessionAttendees) {
    sessionAttendees = new Map();
    attendees.set(sessionCode, sessionAttendees);
  }

  const attendee = {
    rollNumber: rollNumber || '538',
    name: name || `Student ${rollNumber}`,
    section: section || session.section,
    machineNumber: machineNumber || 'PC-01',
    onlineStatus: 'ONLINE',
    codingStatus: 'CODING',
    language: 'c',
    score: 0,
    passedCases: '0/3',
    submitted: false,
    tabSwitches: 0,
    lastHeartbeat: new Date().toISOString(),
    currentCode: session.questions[0]?.starterCode?.c || ''
  };

  sessionAttendees.set(rollNumber, attendee);

  res.json({
    success: true,
    message: 'Successfully joined practical session',
    session,
    attendee
  });
}

function getSessionLiveGrid(req, res) {
  const { code } = req.params;
  const session = sessions.get(code);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  const sessionAttendees = attendees.get(code) || new Map();
  const attendeesList = Array.from(sessionAttendees.values());

  const stats = {
    totalCapacity: session.totalCapacity || 60,
    joinedStudents: attendeesList.length,
    onlineCount: attendeesList.filter(a => a.onlineStatus === 'ONLINE').length,
    offlineCount: attendeesList.filter(a => a.onlineStatus === 'OFFLINE').length,
    codingCount: attendeesList.filter(a => a.codingStatus === 'CODING').length,
    submittedCount: attendeesList.filter(a => a.submitted).length,
    pendingCount: attendeesList.filter(a => !a.submitted).length
  };

  res.json({
    success: true,
    session,
    stats,
    attendees: attendeesList
  });
}

function endSession(req, res) {
  const { code } = req.params;
  const session = sessions.get(code);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  session.status = 'ENDED';
  session.endedAt = new Date().toISOString();

  res.json({ success: true, message: 'Session ended successfully', session });
}

module.exports = {
  sessions,
  attendees,
  submissions,
  createSession,
  getSession,
  joinSession,
  getSessionLiveGrid,
  endSession
};
