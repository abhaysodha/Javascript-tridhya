
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const StudentDB = (function () {


  let students = [];
  let nextId = 1;
 
  const gradeTable = [
    { min: 90, grade: "A" },
    { min: 75, grade: "B" },
    { min: 60, grade: "C" },
    { min: 40, grade: "D" },
    { min: 0, grade: "F" },
  ];

  function calcAverage(marksObj) {
    const values = Object.values(marksObj || {});
    if (values.length === 0) return 0;
    return values.reduce((sum, m) => sum + m, 0) / values.length;
  }

  function calcGrade(average) {
    const found = gradeTable.find((g) => average >= g.min);
    return found ? found.grade : "F";
  }


  function validateStudentInput({ name, rollNo, age }) {
    const errors = [];
    if (!name || typeof name !== "string") errors.push("Name is required and must be text.");
    if (!rollNo || typeof rollNo !== "string") errors.push("Roll number is required and must be text.");
    if (age === undefined || age === null || isNaN(age)) errors.push("Age must be a number.");
    return errors;
  }


  return {



    addStudent({ name, rollNo, age, marks = {}, attendance = 0 }) {
      const errors = validateStudentInput({ name, rollNo, age });
      if (errors.length > 0) {
        return { success: false, message: errors.join(" ") };
      }

      const rollExists = students.some((s) => s.rollNo === rollNo);
      if (rollExists) {
        return { success: false, message: `Roll number ${rollNo} already exists.` };
      }

      const newStudent = { id: nextId, name, rollNo, age: Number(age), marks, attendance: Number(attendance) };
      students.push(newStudent);
      nextId++;

      return { success: true, student: newStudent };
    },

    getAllStudents() {
      return [...students]; 
    },

    getStudentById(id) {
      return students.find((s) => s.id === id) || null;
    },

    updateStudent(id, updates) {
      const exists = students.some((s) => s.id === id);
      if (!exists) {
        return { success: false, message: `No student found with id ${id}.` };
      }

      const { id: _ignoredId, ...safeUpdates } = updates;

      students = students.map((s) =>
        s.id === id ? { ...s, ...safeUpdates } : s
      );

      return { success: true, student: this.getStudentById(id) };
    },

    removeStudent(id) {
      const before = students.length;
      students = students.filter((s) => s.id !== id);
      const removed = students.length !== before;
      return { success: removed, message: removed ? "Removed." : "Student not found." };
    },

    resetAll() {
      students = [];
      nextId = 1;
      return { success: true, message: "All data cleared." };
    },

    searchByName(query) {
      if (!query) return this.getAllStudents();
      const q = query.toLowerCase();
      return students.filter((s) => s.name.toLowerCase().includes(q));
    },

    
    sortBy(key, order = "asc") {
      return students.slice().sort((a, b) => {
        if (a[key] < b[key]) return order === "asc" ? -1 : 1;
        if (a[key] > b[key]) return order === "asc" ? 1 : -1;
        return 0;
      });
    },


    getAverageMarks(id) {
      const student = this.getStudentById(id);
      if (!student) return null;
      return calcAverage(student.marks);
    },

    getGrade(id) {
      const avg = this.getAverageMarks(id);
      if (avg === null) return null;
      return calcGrade(avg);
    },

    getPassFailList() {
      return students.reduce(
        (acc, s) => {
          const avg = calcAverage(s.marks);
          if (avg >= 40) acc.pass.push(s);
          else acc.fail.push(s);
          return acc;
        },
        { pass: [], fail: [] }
      );
    },

    groupByGrade() {
      return students.reduce((acc, s) => {
        const grade = calcGrade(calcAverage(s.marks));
        acc[grade] = acc[grade] || [];
        acc[grade].push(s);
        return acc;
      }, {});
    },

    getClassStats() {
      if (students.length === 0) {
        return { totalStudents: 0, classAverage: 0, topper: null, lowest: null };
      }

      const withAverages = students.map((s) => ({
        name: s.name,
        rollNo: s.rollNo,
        avg: calcAverage(s.marks),
      }));

      const classAverage =
        withAverages.reduce((sum, s) => sum + s.avg, 0) / withAverages.length;

      const topper = withAverages.reduce((max, s) => (s.avg > max.avg ? s : max));
      const lowest = withAverages.reduce((min, s) => (s.avg < min.avg ? s : min));

      return {
        totalStudents: students.length,
        classAverage: Number(classAverage.toFixed(2)),
        topper,
        lowest,
      };
    },
  };
})();





document.addEventListener("DOMContentLoaded", () => {

  const output = document.getElementById("output");


  function show(data) {
    output.textContent =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
    console.log(data); 
  }

  document.getElementById("btnAddStudent").addEventListener("click", () => {
    const result = StudentDB.addStudent({
      name: document.getElementById("inputName").value,
      rollNo: document.getElementById("inputRollNo").value,
      age: document.getElementById("inputAge").value,
      marks: {
        math: Number(document.getElementById("inputMath").value) || 0,
        science: Number(document.getElementById("inputScience").value) || 0,
        english: Number(document.getElementById("inputEnglish").value) || 0,
      },
      attendance: document.getElementById("inputAttendance").value,
    });
    show(result);
  });

  const debouncedSearch = debounce((query) => {
    show(StudentDB.searchByName(query));
  }, 300);

  document.getElementById("inputSearch").addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
  });

  document.getElementById("btnShowAll").addEventListener("click", () => {
    show(StudentDB.getAllStudents());
  });

  document.getElementById("btnSortAge").addEventListener("click", () => {
    show(StudentDB.sortBy("age", "asc"));
  });

  document.getElementById("btnSortMarks").addEventListener("click", () => {
    const withAvg = StudentDB.getAllStudents()
      .map((s) => ({ ...s, avgMarks: StudentDB.getAverageMarks(s.id) }))
      .sort((a, b) => b.avgMarks - a.avgMarks);
    show(withAvg);
  });

  document.getElementById("btnPassFail").addEventListener("click", () => {
    show(StudentDB.getPassFailList());
  });

  document.getElementById("btnGroupGrade").addEventListener("click", () => {
    show(StudentDB.groupByGrade());
  });

  document.getElementById("btnClassStats").addEventListener("click", () => {
    show(StudentDB.getClassStats());
  });


  document.getElementById("btnReset").addEventListener("click", () => {
    const confirmed = confirm("This will delete all student data. Continue?");
    if (confirmed) show(StudentDB.resetAll());
  });
});