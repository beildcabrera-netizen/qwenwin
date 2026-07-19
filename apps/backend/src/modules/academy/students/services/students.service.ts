import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StudentsRepository } from '../repositories/students.repository';
import { CreateStudentDto, UpdateStudentDto, StudentResponseDto } from '../dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private studentsRepository: StudentsRepository) {}

  async create(createStudentDto: CreateStudentDto, userId: string): Promise<StudentResponseDto> {
    // Validar que no exista un estudiante con el mismo CI
    const existingStudents = await this.studentsRepository.findAll({ ci: createStudentDto.ci });
    if (existingStudents.length > 0) {
      throw new BadRequestException('Ya existe un estudiante con esta cédula de identidad');
    }

    // Generar código de barras (CI o código único)
    const barcode = this.generateBarcode(createStudentDto.ci);

    return this.studentsRepository.create({ ...createStudentDto, barcode }, userId);
  }

  async findAll(filters?: any): Promise<StudentResponseDto[]> {
    return this.studentsRepository.findAll(filters);
  }

  async findOne(id: string): Promise<StudentResponseDto> {
    const student = await this.studentsRepository.findOne(id);
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return this.mapStudentResponse(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto, userId: string): Promise<StudentResponseDto> {
    // Verificar que el estudiante existe
    await this.findOne(id);

    // Si cambia el CI, validar que no exista otro con ese CI
    if (updateStudentDto.ci) {
      const existingStudents = await this.studentsRepository.findAll({ 
        ci: updateStudentDto.ci,
        id: { not: id }
      });
      if (existingStudents.length > 0) {
        throw new BadRequestException('Ya existe un estudiante con esta cédula de identidad');
      }
    }

    return this.studentsRepository.update(id, updateStudentDto, userId) as any;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verificar que el estudiante existe
    await this.findOne(id);

    // TODO: Verificar que no haya inscripciones activas

    await this.studentsRepository.softDelete(id, userId);
  }

  async getActiveStudents(): Promise<StudentResponseDto[]> {
    return this.studentsRepository.findActiveStudents() as any;
  }

  async findByBarcode(barcode: string) {
    const student = await this.studentsRepository.findByBarcode(barcode);
    if (!student) {
      throw new NotFoundException(`Estudiante con código ${barcode} no encontrado`);
    }
    return this.mapStudentResponse(student);
  }

  async getStudentsWithBirthdaysThisWeek() {
    return this.studentsRepository.getStudentsWithBirthdaysThisWeek();
  }

  private generateBarcode(ci: string): string {
    // Formato: ACAD-XXXXXX (usando CI o generando único)
    const cleanCi = ci.replace(/[^0-9]/g, '');
    return `ACAD-${cleanCi.padStart(6, '0')}`;
  }

  private mapStudentResponse(student: any): StudentResponseDto {
    const birthDate = new Date(student.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return {
      ...student,
      fullName: `${student.firstName} ${student.lastName}`,
      age,
    };
  }
}
