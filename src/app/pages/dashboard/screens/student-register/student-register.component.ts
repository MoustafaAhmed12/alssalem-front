import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { TitleScreenComponent } from '../../../../shared/components/title-screen/title-screen.component';
import { AdminService } from '../../services/admin.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { SchoolService } from '../../services/school.service';
import { ToastrService } from 'ngx-toastr';
interface Student {
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  email: string;
  state: string;
  classNumber: number;
  index?: number;
}

interface School {
  id: number;
  name: string;
}

interface FormData {
  studentDetails: Student[];
  schoolId: number;
}
@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [FormsModule, TitleScreenComponent, NgSelectModule],
  templateUrl: './student-register.component.html',
  styleUrl: './student-register.component.scss',
})
export class StudentRegisterComponent implements OnInit {
  admin = inject(AdminService);
  schoolService = inject(SchoolService);
  toastr = inject(ToastrService);
  selectedSchoolId = signal<number | null>(null);
  excelFile = signal<string>('');
  validStudents = signal<Student[]>([]);
  duplicateStudents = signal<{ student: Student; reason: string }[]>([]);
  existsStudent = signal<Student[]>([]);
  isLoading = signal<boolean>(false);
  schools = signal<School[]>([]);

  newStudent: Student = {
    fullName: '',
    nationalId: '',
    phoneNumber: '',
    email: '',
    state: '',
    classNumber: 0,
  };

  ngOnInit() {
    this.fetchAllSchools();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.excelFile.set(file.name);
      this.readExcelFile(file);
    }
  }

  readExcelFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const students = (jsonData as any[])
        .slice(1) // skip header row
        .map((row: any[], index: number) => {
          let stateName = '';
          switch (row[4]) {
            case 1:
            case '1':
              stateName = 'الصف الأول الثانوي';
              break;
            case 2:
            case '2':
              stateName = 'الصف الثاني الثانوي';
              break;
            case 3:
            case '3':
              stateName = 'الصف الثالث الثانوي';
              break;
            case 4:
            case '4':
              stateName = 'الصف الثالث المتوسط';
              break;
            default:
              stateName = '';
          }

          return {
            fullName: row[0] || '',
            nationalId: row[1] || '',
            phoneNumber: row[2] || '',
            email: row[3] || '',
            state: stateName,
            classNumber: parseInt(row[5]) || 0,
            index: index,
          };
        })
        .filter((student) => student.fullName);

      this.separateDuplicates(students);
    };
    reader.readAsArrayBuffer(file);

    this.newStudent = {
      fullName: '',
      nationalId: '',
      phoneNumber: '',
      email: '',
      state: '',
      classNumber: 0,
    };
  }

  separateDuplicates(students: Student[]): void {
    const validStudents: Student[] = [];
    const duplicates: { student: Student; reason: string }[] = [];
    // const seenEmails = new Set<string>();
    const seenNationalIds = new Set<string>();
    // const seenPhoneNumbers = new Set<string>();

    students.forEach((student) => {
      const reasons: string[] = [];

      // if (student.email && seenEmails.has(student.email)) {
      //   reasons.push('إيميل مكرر');
      // }
      if (student.nationalId && seenNationalIds.has(student.nationalId)) {
        reasons.push('رقم هوية مكرر');
      }
      // if (student.phoneNumber && seenPhoneNumbers.has(student.phoneNumber)) {
      //   reasons.push('رقم جوال مكرر');
      // }

      if (reasons.length > 0) {
        duplicates.push({ student, reason: reasons.join(', ') });
      } else {
        validStudents.push(student);
        // if (student.email) seenEmails.add(student.email);
        if (student.nationalId) seenNationalIds.add(student.nationalId);
        // if (student.phoneNumber) seenPhoneNumbers.add(student.phoneNumber);
      }
    });

    this.validStudents.set(validStudents);
    this.duplicateStudents.set(duplicates);
  }

  removeExcelFile(): void {
    this.excelFile.set('');
    this.validStudents.set([]);
    this.duplicateStudents.set([]);
  }

  removeStudent(index: number): void {
    const currentStudents = this.validStudents();
    currentStudents.splice(index, 1);
    this.validStudents.set([...currentStudents]);
  }

  isNewStudentValid(): boolean {
    return !!(
      this.newStudent.fullName &&
      this.newStudent.phoneNumber &&
      this.newStudent.email
    );
  }

  // addStudentManually(): void {
  //   if (!this.isNewStudentValid()) return;
  //   const formData = {
  //     schoolId: Number(this.selectedSchoolId()),
  //     studentDetails: [
  //       {
  //         fullName: this.newStudent.fullName,
  //         nationalId: String(this.newStudent.nationalId),
  //         phoneNumber: String(this.newStudent.phoneNumber),
  //         email: this.newStudent.email,
  //         state: this.newStudent.state,
  //         classNumber: this.newStudent.classNumber,
  //       },
  //     ],
  //   };

  //   this.isLoading.set(true);
  //   this.admin.studentsCreate(formData).subscribe({
  //     next: ({ statusCode, msg, result }) => {
  //       if (statusCode === 200) {
  //         this.toastr.success('تم اضافة الطلاب بنجاح');
  //         this.existsStudent.set(result || []);
  //         this.newStudent = {
  //           fullName: '',
  //           nationalId: '',
  //           phoneNumber: '',
  //           email: '',
  //           state: '',
  //           classNumber: 0,
  //         };
  //       } else {
  //         this.toastr.error(msg);
  //       }
  //       this.isLoading.set(false);
  //     },
  //     error: (err) => {
  //       console.log(err);
  //       this.isLoading.set(false);
  //     },
  //   });

  //   // Reset form
  // }

  submitForm(): void {
    if (!this.selectedSchoolId() || this.validStudents().length === 0) return;
    const formData: FormData = {
      studentDetails: this.validStudents().map((student) => ({
        fullName: student.fullName,
        nationalId: String(student.nationalId),
        phoneNumber: String(student.phoneNumber),
        email: student.email,
        state: student.state,
        classNumber: student.classNumber,
      })),
      schoolId: Number(this.selectedSchoolId()),
    };

    this.isLoading.set(true);
    this.admin.studentsCreate(formData).subscribe({
      next: ({ statusCode, msg, result }) => {
        if (statusCode === 200) {
          this.toastr.success('تم اضافة الطلاب بنجاح');
          this.existsStudent.set(result || []);
        } else {
          this.toastr.error(msg);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  fetchAllSchools(): void {
    this.schoolService.getSystemSchools().subscribe({
      next: ({ result, statusCode }) => {
        if (statusCode === 200) {
          this.schools.set(result);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
