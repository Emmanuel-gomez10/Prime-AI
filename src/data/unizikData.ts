export interface DepartmentInfo {
  name: string;
  code: string;
  sampleCourses: Array<{ code: string; title: string; year: string }>;
}

export interface FacultyInfo {
  name: string;
  departments: DepartmentInfo[];
}

export const UNIVERSITIES_LIST = [
  'UNIZIK (Nnamdi Azikiwe University)',
  'UNILAG (University of Lagos)',
  'OAU (Obafemi Awolowo University)',
  'UI (University of Ibadan)',
  'UNN (University of Nigeria Nsukka)',
  'ABU (Ahmadu Bello University)',
  'Covenant University'
];

export const UNIZIK_FACULTIES: FacultyInfo[] = [
  {
    name: "Faculty of Physical Sciences",
    departments: [
      {
        name: "Computer Science",
        code: "CSC",
        sampleCourses: [
          { code: "CSC101", title: "Introduction to Computer Science", year: "2023" },
          { code: "CSC201", title: "Data Structures & Algorithms", year: "2022" },
          { code: "CSC301", title: "Database Management Systems", year: "2023" },
        ]
      },
      {
        name: "Mathematics",
        code: "MAT",
        sampleCourses: [
          { code: "MAT111", title: "Algebra & Trigonometry", year: "2023" },
          { code: "MAT201", title: "Linear Algebra I", year: "2022" },
        ]
      },
      {
        name: "Physics & Industrial Physics",
        code: "PHY",
        sampleCourses: [
          { code: "PHY101", title: "General Physics I (Mechanics)", year: "2023" },
          { code: "PHY201", title: "Electricity & Magnetism", year: "2022" },
        ]
      },
      {
        name: "Pure & Industrial Chemistry",
        code: "ICH",
        sampleCourses: [
          { code: "ICH101", title: "General Chemistry I", year: "2023" },
          { code: "ICH201", title: "Organic Chemistry I", year: "2022" },
        ]
      }
    ]
  },
  {
    name: "Faculty of Engineering",
    departments: [
      {
        name: "Electrical & Electronic Engineering",
        code: "EEE",
        sampleCourses: [
          { code: "EEE201", title: "Circuit Theory I", year: "2023" },
          { code: "EEE301", title: "Electromagnetic Fields & Waves", year: "2022" },
        ]
      },
      {
        name: "Mechanical Engineering",
        code: "MEE",
        sampleCourses: [
          { code: "MEE201", title: "Engineering Thermodynamics", year: "2023" },
          { code: "MEE301", title: "Fluid Mechanics", year: "2022" },
        ]
      },
      {
        name: "Civil Engineering",
        code: "CVE",
        sampleCourses: [
          { code: "CVE201", title: "Strength of Materials", year: "2023" },
          { code: "CVE301", title: "Structural Analysis", year: "2022" },
        ]
      }
    ]
  },
  {
    name: "Faculty of Health Sciences & Medicine",
    departments: [
      {
        name: "Medicine & Surgery",
        code: "MED",
        sampleCourses: [
          { code: "ANA201", title: "Human Anatomy & Histology", year: "2023" },
          { code: "PIO201", title: "Human Physiology", year: "2022" },
        ]
      },
      {
        name: "Nursing Science",
        code: "NUR",
        sampleCourses: [
          { code: "NUR201", title: "Foundations of Nursing Practice", year: "2023" },
        ]
      },
      {
        name: "Medical Laboratory Science",
        code: "MLS",
        sampleCourses: [
          { code: "MLS201", title: "Clinical Chemistry & Haematology", year: "2023" },
        ]
      }
    ]
  },
  {
    name: "Faculty of Law",
    departments: [
      {
        name: "Public & Private Law",
        code: "LAW",
        sampleCourses: [
          { code: "LAW101", title: "Nigerian Legal System I", year: "2023" },
          { code: "LAW201", title: "Constitutional Law", year: "2022" },
        ]
      }
    ]
  },
  {
    name: "Faculty of Management Sciences",
    departments: [
      {
        name: "Accountancy",
        code: "ACC",
        sampleCourses: [
          { code: "ACC101", title: "Financial Accounting I", year: "2023" },
        ]
      },
      {
        name: "Business Administration",
        code: "BUS",
        sampleCourses: [
          { code: "BUS101", title: "Principles of Management", year: "2023" },
        ]
      },
      {
        name: "Banking & Finance",
        code: "FIN",
        sampleCourses: [
          { code: "FIN101", title: "Elements of Banking", year: "2023" },
        ]
      }
    ]
  },
  {
    name: "Faculty of Arts & General Studies",
    departments: [
      {
        name: "Mass Communication",
        code: "MAC",
        sampleCourses: [
          { code: "MAC101", title: "Introduction to Mass Communication", year: "2023" },
        ]
      },
      {
        name: "General Studies Unit",
        code: "GST",
        sampleCourses: [
          { code: "GST101", title: "Use of English & Communication", year: "2023" },
          { code: "GST102", title: "Philosophy & Human Existence", year: "2022" },
        ]
      }
    ]
  }
];
