export interface GovPortalLink {
  name: string;
  category: string;
  url: string;
  description: string;
  tag: string;
}

export const IMPORTANT_GOV_LINKS: GovPortalLink[] = [
  {
    name: 'Union Public Service Commission (UPSC)',
    category: 'Central Recruitment',
    url: 'https://upsc.gov.in',
    description: 'Civil Services IAS, IPS, IFS, NDA, CDS, CAPF, Engineering Services notifications & results.',
    tag: 'All India',
  },
  {
    name: 'Staff Selection Commission (SSC)',
    category: 'Central Recruitment',
    url: 'https://ssc.gov.in',
    description: 'CGL, CHSL, MTS, GD Constable, CPO SI, Stenographer, Junior Engineer recruitment portal.',
    tag: 'Central Govt',
  },
  {
    name: 'Railway Recruitment Boards (RRB)',
    category: 'Railways',
    url: 'https://www.rrbapply.gov.in',
    description: 'RRB NTPC, Group D, ALP, Technician, JE and RPF Constable & SI recruitment.',
    tag: 'Indian Railways',
  },
  {
    name: 'National Testing Agency (NTA)',
    category: 'National Entrance',
    url: 'https://nta.ac.in',
    description: 'NEET UG, JEE Main, CUET UG/PG, UGC NET, CSIR NET, CMAT and AISSEE portal.',
    tag: 'Entrance Exams',
  },
  {
    name: 'Institute of Banking Personnel Selection (IBPS)',
    category: 'Banking',
    url: 'https://www.ibps.in',
    description: 'PO, Clerk, Specialist Officer (SO), and RRB Office Assistant & Officer Scale I, II, III.',
    tag: 'Bank Jobs',
  },
  {
    name: 'State Bank of India (SBI Careers)',
    category: 'Banking',
    url: 'https://sbi.co.in/web/careers',
    description: 'SBI PO, Junior Associates (Clerk), CBO, Specialist Officers recruitment and results.',
    tag: 'Banking',
  },
  {
    name: 'Uttar Pradesh Public Service Commission (UPPSC)',
    category: 'State PSC',
    url: 'https://uppsc.up.nic.in',
    description: 'UP PCS, RO/ARO, Staff Nurse, Assistant Professor, Technical Lecturer posts.',
    tag: 'Uttar Pradesh',
  },
  {
    name: 'UP Police Recruitment & Promotion Board (UPPRPB)',
    category: 'Police Recruitment',
    url: 'https://uppbpb.gov.in',
    description: 'UP Police Constable, Sub Inspector (SI), Computer Operator, Fireman, Jail Warder.',
    tag: 'UP Police',
  },
  {
    name: 'Bihar Public Service Commission (BPSC)',
    category: 'State PSC',
    url: 'https://www.bpsc.bih.nic.in',
    description: 'BPSC Integrated CCE, School Teacher (TRE), Assistant Engineer, CDPO vacancies.',
    tag: 'Bihar Govt',
  },
  {
    name: 'Delhi Subordinate Services Selection Board (DSSSB)',
    category: 'State Recruitment',
    url: 'https://dsssb.delhi.gov.in',
    description: 'TGT, PGT, PRT Teachers, DASS Grade, Nursing Officer, MTS and Clerk recruitments.',
    tag: 'Delhi (NCT)',
  },
  {
    name: 'Rajasthan Public Service Commission (RPSC)',
    category: 'State PSC',
    url: 'https://rpsc.rajasthan.gov.in',
    description: 'RAS/RTS, School Lecturer, Senior Teacher Grade II, Assistant Professor.',
    tag: 'Rajasthan',
  },
  {
    name: 'Madhya Pradesh Employees Selection Board (MPESB)',
    category: 'State Recruitment',
    url: 'https://esb.mp.gov.in',
    description: 'MP Police Constable, Patwari, Teacher Eligibility Test, Sub Engineer, Forest Guard.',
    tag: 'Madhya Pradesh',
  },
  {
    name: 'Central Board of Secondary Education (CBSE)',
    category: 'Board & Eligibility',
    url: 'https://cbse.gov.in',
    description: 'Class 10 & 12 Board Exam Datesheet, Admit Card, Results & CTET Portal.',
    tag: 'CBSE / School',
  },
  {
    name: 'Department of Posts (India Post GDS)',
    category: 'Central Recruitment',
    url: 'https://indiapostgdsonline.gov.in',
    description: 'Gramin Dak Sevak (GDS) BPM & ABPM branch allocations and merit list download.',
    tag: 'India Post',
  },
  {
    name: 'Join Indian Army Recruitment',
    category: 'Defense',
    url: 'https://joinindianarmy.nic.in',
    description: 'Agniveer Rally, Officer Entry (NDA, CDS, TGC, SSC Tech) Online registration.',
    tag: 'Armed Forces',
  },
  {
    name: 'Indian Air Force (Agniveer Vayu)',
    category: 'Defense',
    url: 'https://agnipathvayu.cdac.in',
    description: 'IAF Agniveer Vayu intake, AFCAT, Airmen selection notifications.',
    tag: 'Indian Air Force',
  },
];
