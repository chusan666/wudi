import { prisma } from '@/data-access/prisma';
import { NotFoundError } from '@/utils/errors';

export class NoteService {
  async getNoteById(id: string) {
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundError(`Note with id ${id} not found`);
    }

    return note;
  }

  async createNote(data: { title: string; content?: string }) {
    return await prisma.note.create({
      data,
    });
  }
}