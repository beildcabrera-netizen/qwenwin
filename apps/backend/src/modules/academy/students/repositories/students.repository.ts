import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from '../dto/student.dto';

@Injectable()
export class StudentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStudentDto & { barcode: string }, userId: string) {
    const { emergencyContact, ...studentData } = data;

    return this.prisma.academy_student.create({
      data: {
        ...studentData,
        createdBy: userId,
        emergencyContact: emergencyContact ? {
          create: emergencyContact,
        } : undefined,
      },
      include: {
        emergencyContact: true,
        enrollments: {
          where: { deletedAt: null },
          include: {
            group: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(where?: any) {
    return this.prisma.academy_student.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      include: {
        emergencyContact: true,
        enrollments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            group: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.academy_student.findUnique({
      where: { id, deletedAt: null },
      include: {
        emergencyContact: true,
        enrollments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            group: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        attendances: {
          where: { deletedAt: null },
          orderBy: { checkIn: 'desc' },
          take: 10,
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findByBarcode(barcode: string) {
    return this.prisma.academy_student.findFirst({
      where: { 
        OR: [
          { ci: barcode },
          { barcode },
        ],
        deletedAt: null,
      },
      include: {
        emergencyContact: true,
        enrollments: {
          where: { 
            deletedAt: null,
            isActive: true,
          },
          include: {
            group: {
              select: {
                id: true,
                name: true,
                level: true,
                toleranceMinutes: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
                durationDays: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateStudentDto, userId: string) {
    const { emergencyContact, ...studentData } = data;

    const updateData: any = {
      ...studentData,
      updatedBy: userId,
    };

    if (emergencyContact) {
      updateData.emergencyContact = {
        upsert: {
          create: emergencyContact,
          update: emergencyContact,
        },
      };
    }

    return this.prisma.academy_student.update({
      where: { id },
      data: updateData,
      include: {
        emergencyContact: true,
        enrollments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            group: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.academy_student.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  async findActiveStudents() {
    return this.prisma.academy_student.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        emergencyContact: true,
        enrollments: {
          where: { 
            deletedAt: null,
            isActive: true,
          },
          include: {
            group: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async getStudentsWithBirthdaysThisWeek() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const students = await this.prisma.academy_student.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      include: {
        enrollments: {
          where: { 
            deletedAt: null,
            isActive: true,
          },
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return students.filter((student) => {
      const birthDate = new Date(student.dateOfBirth);
      const currentYear = today.getFullYear();
      
      const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      const birthdayNextYear = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      
      const isThisWeek = (birthdayThisYear >= today && birthdayThisYear <= nextWeek) ||
                         (birthdayNextYear >= today && birthdayNextYear <= nextWeek);
      
      return isThisWeek;
    }).map((student) => ({
      ...student,
      age: this.calculateAge(student.dateOfBirth),
    }));
  }

  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}
