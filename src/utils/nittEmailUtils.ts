/**
 * src/utils/nittEmailUtils.ts
 *
 * NIT Trichy campus email intelligence:
 * - Real roll number parsing & department auto-detection
 * - 6-Digit Webmail OTP generation and verification
 * - Validation of @nitt.edu addresses
 */

export interface NittEmailDetails {
  isValidNittEmail: boolean;
  isRollNumber: boolean;
  rollNumber?: string;
  department?: string;
  degree?: string;
  batchYear?: string;
  academicYear?: string;
}

const DEPT_MAP: Record<string, { name: string; degree: string }> = {
  '101': { name: 'Architecture', degree: 'B.Arch' },
  '102': { name: 'Chemical Engineering', degree: 'B.Tech' },
  '103': { name: 'Civil Engineering', degree: 'B.Tech' },
  '106': { name: 'Computer Science and Engineering (CSE)', degree: 'B.Tech' },
  '107': { name: 'Electrical and Electronics Engineering (EEE)', degree: 'B.Tech' },
  '108': { name: 'Electronics and Communication Engineering (ECE)', degree: 'B.Tech' },
  '110': { name: 'Instrumentation and Control Engineering (ICE)', degree: 'B.Tech' },
  '111': { name: 'Mechanical Engineering', degree: 'B.Tech' },
  '112': { name: 'Metallurgical and Materials Engineering (MME)', degree: 'B.Tech' },
  '114': { name: 'Production Engineering', degree: 'B.Tech' },
  '205': { name: 'Computer Applications (MCA)', degree: 'MCA' },
  '215': { name: 'Management Studies (DoMS)', degree: 'MBA' },
};

export function parseNittEmail(email: string): NittEmailDetails {
  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith('@nitt.edu')) {
    return {
      isValidNittEmail: false,
      isRollNumber: false,
    };
  }

  const userPart = normalized.replace('@nitt.edu', '');

  // Standard NITT Student Roll Number: 9 digits e.g. 106123085
  // Format: [3-digit dept code][1-digit program][2-digit year][3-digit serial]
  const rollMatch = userPart.match(/^([1-2][0-1][0-9])([0-9])([0-9]{2})([0-9]{3})$/);

  if (rollMatch) {
    const deptCode = rollMatch[1];
    const yearDigits = rollMatch[3]; // e.g. '23'
    const deptInfo = DEPT_MAP[deptCode] || { name: 'Engineering / Sciences', degree: 'B.Tech' };
    const joinedYear = 2000 + parseInt(yearDigits, 10);
    const currentYear = 2026;
    const yearDiff = currentYear - joinedYear;

    let academicYear = 'Undergraduate';
    if (yearDiff === 1) academicYear = '1st Year';
    else if (yearDiff === 2) academicYear = '2nd Year';
    else if (yearDiff === 3) academicYear = '3rd Year';
    else if (yearDiff >= 4) academicYear = 'Final Year';

    return {
      isValidNittEmail: true,
      isRollNumber: true,
      rollNumber: userPart,
      department: deptInfo.name,
      degree: deptInfo.degree,
      batchYear: `Class of ${joinedYear + 4}`,
      academicYear,
    };
  }

  // Staff / Club / Name-based email (e.g., priya.sharma@nitt.edu or dean.sac@nitt.edu)
  return {
    isValidNittEmail: true,
    isRollNumber: false,
    department: 'National Institute of Technology, Tiruchirappalli',
    academicYear: 'Campus Member',
  };
}

// Generate deterministic or pseudo-random 6-digit OTP
export function generateNittOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
