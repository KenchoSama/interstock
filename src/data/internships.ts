export interface Internship {
  id: string;
  title: string;
  partner: string;
  type: 'Paid' | 'Unpaid';
  comp: string;
  period: string;
  spots: number;
  minGrade: number;
  reqText: string;
  xpReq: number;
  applicationSteps: string[];
  contactEmail: string;
}

export const INTERNSHIP_DATA: Internship[] = [
  {
    id: 'int1',
    title: 'Summer Finance Internship',
    partner: 'Financial Partner',
    type: 'Paid',
    comp: '$25/hr',
    period: 'Jun-Aug',
    spots: 3,
    minGrade: 12,
    reqText: 'Top 5 nationally · Gr12 · XP 3000+',
    xpReq: 3000,
    applicationSteps: [
      'Update your Profile page — completed diplomas and trading history are reviewed as part of the application.',
      'Write a short answer (150–300 words): "What is one trade you made this year and what did you learn from it?"',
      'Email your response to internships@interstock.app with the subject line "Summer Finance Internship — [Your Name]".',
      'Applications are reviewed on a rolling basis. You will hear back within 2–3 weeks.',
    ],
    contactEmail: 'internships@interstock.app',
  },
  {
    id: 'int2',
    title: 'Options Desk Shadowing',
    partner: 'Partner Exchange',
    type: 'Unpaid',
    comp: 'Credit',
    period: 'Jul 2025',
    spots: 5,
    minGrade: 11,
    reqText: 'Level 2 · Gr11-12 · XP 2000+',
    xpReq: 2000,
    applicationSteps: [
      'Complete the Options Basics lesson module if you have not already — this is required before shadowing.',
      'Ask your teacher or school admin to confirm your eligibility with a brief note.',
      'Email internships@interstock.app with your name, grade, and confirmation note attached.',
      'Selected students will be contacted directly to schedule a shadowing day.',
    ],
    contactEmail: 'internships@interstock.app',
  },
];