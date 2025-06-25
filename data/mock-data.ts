export const mockStudentData = {
  profile: {
    id: "STD001",
    name: "Juan Pérez",
    email: "juan.perez@estudiante.usm.edu.ve",
    grade: "4to año",
    section: "A",
    studentId: "2024-001",
    avatar: "/avatars/student.png",
  },
  courses: [
    {
      id: "MAT101",
      name: "Matemáticas",
      teacher: "Prof. María González",
      schedule: "Lunes y Miércoles 8:00 - 9:30",
      classroom: "A-101",
    },
    {
      id: "FIS102",
      name: "Física",
      teacher: "Prof. Carlos Rodríguez",
      schedule: "Martes y Jueves 10:00 - 11:30",
      classroom: "B-203",
    },
    {
      id: "QUI103",
      name: "Química",
      teacher: "Prof. Ana Martínez",
      schedule: "Miércoles y Viernes 13:00 - 14:30",
      classroom: "LAB-01",
    },
  ],
  evaluationPlan: [
    {
      courseId: "MAT101",
      courseName: "Matemáticas",
      evaluations: [
        {
          id: "E001",
          title: "Examen Parcial 1",
          date: "2024-03-15",
          weight: 30,
          topics: ["Álgebra", "Funciones", "Ecuaciones"],
        },
        {
          id: "E002",
          title: "Proyecto",
          date: "2024-04-01",
          weight: 30,
          description: "Aplicación práctica de conceptos",
        },
      ],
    },
  ],
  academicSummary: {
    gpa: 18.5,
    totalCredits: 24,
    currentPeriod: "2023-2024",
    grades: [
      {
        course: "Matemáticas",
        grade: 19,
        period: "2023-2024",
      },
      {
        course: "Física",
        grade: 18,
        period: "2023-2024",
      },
    ],
  },
}

export const mockTeacherData = {
  profile: {
    id: "TCH001",
    name: "María González",
    email: "maria.gonzalez@profesor.usm.edu.ve",
    department: "Ciencias",
    specialization: "Matemáticas",
    avatar: "/avatars/teacher.png",
  },
  courses: [
    {
      id: "MAT101",
      name: "Matemáticas",
      grade: "4to año",
      section: "A",
      schedule: "Lunes y Miércoles 8:00 - 9:30",
      classroom: "A-101",
      students: 25,
    },
    {
      id: "MAT102",
      name: "Matemáticas",
      grade: "4to año",
      section: "B",
      schedule: "Martes y Jueves 8:00 - 9:30",
      classroom: "A-102",
      students: 28,
    },
  ],
  evaluations: [
    {
      courseId: "MAT101",
      courseName: "Matemáticas 4A",
      evaluations: [
        {
          id: "E001",
          title: "Examen Parcial 1",
          date: "2024-03-15",
          status: "Pendiente",
          studentsSubmitted: 0,
          totalStudents: 25,
        },
      ],
    },
  ],
  attendance: {
    courseId: "MAT101",
    courseName: "Matemáticas 4A",
    dates: [
      {
        date: "2024-03-01",
        present: 23,
        absent: 2,
        total: 25,
      },
    ],
  },
}

export const mockAdminData = {
  profile: {
    id: "ADM001",
    name: "Roberto Silva",
    email: "roberto.silva@directivo.usm.edu.ve",
    position: "Director Académico",
    department: "Dirección Académica",
    avatar: "/avatars/admin.png",
  },
  academicMetrics: {
    totalStudents: 450,
    totalTeachers: 35,
    averageAttendance: 92,
    averageGrade: 16.8,
  },
  staff: {
    teachers: [
      {
        id: "TCH001",
        name: "María González",
        department: "Ciencias",
        courses: 4,
        students: 120,
      },
    ],
    administrative: [
      {
        id: "ADM002",
        name: "Laura Pérez",
        position: "Coordinadora Administrativa",
        department: "Administración",
      },
    ],
  },
  infrastructure: {
    classrooms: [
      {
        id: "A101",
        name: "Aula A-101",
        capacity: 30,
        equipment: ["Proyector", "Aire acondicionado"],
        status: "Activa",
      },
    ],
    laboratories: [
      {
        id: "LAB01",
        name: "Laboratorio de Ciencias",
        capacity: 25,
        equipment: ["Microscopios", "Material de laboratorio"],
        status: "Activa",
      },
    ],
  },
  reports: {
    attendance: {
      monthly: 92,
      trend: "+2%",
    },
    academic: {
      averageGrade: 16.8,
      trend: "+0.3",
    },
    financial: {
      budget: 1000000,
      expenses: 850000,
    },
  },
} 