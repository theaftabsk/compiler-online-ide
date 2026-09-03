const { attendees, sessions } = require('../controllers/sessionController');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    let currentSessionCode = null;
    let currentRollNumber = null;

    // Student joins a specific lab session room
    socket.on('student:join', ({ sessionCode, rollNumber, name, machineNumber, section }) => {
      currentSessionCode = sessionCode;
      currentRollNumber = rollNumber;

      socket.join(sessionCode);

      const sessionAttendees = attendees.get(sessionCode);
      if (sessionAttendees && rollNumber) {
        const student = sessionAttendees.get(rollNumber) || {
          rollNumber,
          name: name || `Student ${rollNumber}`,
          section: section || 'Section J',
          machineNumber: machineNumber || 'PC-01',
          onlineStatus: 'ONLINE',
          codingStatus: 'CODING',
          score: 0,
          submitted: false,
          tabSwitches: 0
        };

        student.onlineStatus = 'ONLINE';
        student.lastHeartbeat = new Date().toISOString();
        sessionAttendees.set(rollNumber, student);

        // Notify faculty room of updated grid
        io.to(sessionCode).emit('faculty:student_updated', student);
        io.to(sessionCode).emit('faculty:grid_refresh', Array.from(sessionAttendees.values()));
      }
    });

    // Faculty joins to monitor the room
    socket.on('faculty:join', ({ sessionCode }) => {
      socket.join(sessionCode);
      const sessionAttendees = attendees.get(sessionCode);
      if (sessionAttendees) {
        socket.emit('faculty:grid_refresh', Array.from(sessionAttendees.values()));
      }
    });

    // Live student heartbeat & focus tracking
    socket.on('student:heartbeat', ({ sessionCode, rollNumber, activeStatus, codingStatus }) => {
      const sessionAttendees = attendees.get(sessionCode);
      if (sessionAttendees && rollNumber && sessionAttendees.has(rollNumber)) {
        const student = sessionAttendees.get(rollNumber);
        student.onlineStatus = 'ONLINE';
        if (codingStatus) student.codingStatus = codingStatus;
        student.lastHeartbeat = new Date().toISOString();
        sessionAttendees.set(rollNumber, student);

        io.to(sessionCode).emit('faculty:student_updated', student);
      }
    });

    // Debounced Live Code Streaming for faculty inspection
    socket.on('student:code_stream', ({ sessionCode, rollNumber, code, language }) => {
      const sessionAttendees = attendees.get(sessionCode);
      if (sessionAttendees && rollNumber && sessionAttendees.has(rollNumber)) {
        const student = sessionAttendees.get(rollNumber);
        student.currentCode = code;
        student.language = language;
        student.codingStatus = 'CODING';
        sessionAttendees.set(rollNumber, student);

        // Real-time broadcast to faculty monitoring that specific student
        io.to(sessionCode).emit('faculty:student_code_sync', { rollNumber, code, language });
      }
    });

    // Anti-Cheating: Tab Switch detection
    socket.on('student:tab_switched', ({ sessionCode, rollNumber, switchCount }) => {
      const sessionAttendees = attendees.get(sessionCode);
      if (sessionAttendees && rollNumber && sessionAttendees.has(rollNumber)) {
        const student = sessionAttendees.get(rollNumber);
        student.tabSwitches = (student.tabSwitches || 0) + 1;
        sessionAttendees.set(rollNumber, student);

        io.to(sessionCode).emit('faculty:student_alert', {
          type: 'TAB_SWITCH',
          rollNumber,
          studentName: student.name,
          machineNumber: student.machineNumber,
          count: student.tabSwitches,
          message: `Alert: Student ${student.name} (${student.machineNumber}) navigated away from the practical tab! (Total: ${student.tabSwitches})`
        });
        io.to(sessionCode).emit('faculty:student_updated', student);
      }
    });

    // Submission Event
    socket.on('student:submitted', ({ sessionCode, rollNumber, score, passedCases }) => {
      const sessionAttendees = attendees.get(sessionCode);
      if (sessionAttendees && rollNumber && sessionAttendees.has(rollNumber)) {
        const student = sessionAttendees.get(rollNumber);
        student.submitted = true;
        student.codingStatus = 'SUBMITTED';
        student.score = score;
        student.passedCases = passedCases;
        sessionAttendees.set(rollNumber, student);

        io.to(sessionCode).emit('faculty:student_submitted', student);
        io.to(sessionCode).emit('faculty:grid_refresh', Array.from(sessionAttendees.values()));
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      if (currentSessionCode && currentRollNumber) {
        const sessionAttendees = attendees.get(currentSessionCode);
        if (sessionAttendees && sessionAttendees.has(currentRollNumber)) {
          const student = sessionAttendees.get(currentRollNumber);
          student.onlineStatus = 'OFFLINE';
          student.codingStatus = student.submitted ? 'SUBMITTED' : 'OFFLINE';
          sessionAttendees.set(currentRollNumber, student);

          io.to(currentSessionCode).emit('faculty:student_updated', student);
          io.to(currentSessionCode).emit('faculty:grid_refresh', Array.from(sessionAttendees.values()));
        }
      }
    });
  });
}

module.exports = { setupSocketIO };
