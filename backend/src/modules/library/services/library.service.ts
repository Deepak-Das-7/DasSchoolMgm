import { Types } from 'mongoose';
import { bookRepository } from '../repositories/book.repository';
import { issuedBookRepository } from '../repositories/issuedBook.repository';
import { Book, IssuedBookStatus } from '../../../database/models';
import { AppError } from '../../../middlewares/error.middleware';
import { PaginationQuery } from '../../../shared/types/common';

export class LibraryService {
  async listBooks(schoolId: string, query: PaginationQuery & { category?: string }) {
    const filter = query.category ? { category: query.category } : {};
    return bookRepository.findAll(schoolId, query, ['title', 'author', 'isbn', 'barcode'], filter as never);
  }

  async getBook(id: string, schoolId: string) {
    const book = await bookRepository.findById(id, schoolId);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  async createBook(schoolId: string, userId: string, data: Record<string, unknown>) {
    const totalCopies = (data.totalCopies as number) || 1;
    return bookRepository.create({
      ...data,
      schoolId: new Types.ObjectId(schoolId),
      availableCopies: totalCopies,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    } as never);
  }

  async updateBook(id: string, schoolId: string, userId: string, data: Record<string, unknown>) {
    const book = await bookRepository.update(id, schoolId, data as never, userId);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  async deleteBook(id: string, schoolId: string, userId: string) {
    const book = await bookRepository.softDelete(id, schoolId, userId);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  async findByIsbn(isbn: string, schoolId: string) {
    const book = await bookRepository.findByIsbn(isbn, schoolId);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  async findByBarcode(barcode: string, schoolId: string) {
    const book = await bookRepository.findByBarcode(barcode, schoolId);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  async getCategories(schoolId: string) {
    return Book.distinct('category', { schoolId: new Types.ObjectId(schoolId), isDeleted: false });
  }

  async issueBook(schoolId: string, userId: string, bookId: string, studentId: string, dueDate: Date) {
    const book = await this.getBook(bookId, schoolId);
    if (book.availableCopies <= 0) throw new AppError('No copies available', 400);

    await bookRepository.update(bookId, schoolId, { availableCopies: book.availableCopies - 1 } as never, userId);

    return issuedBookRepository.create({
      schoolId: new Types.ObjectId(schoolId),
      bookId: new Types.ObjectId(bookId),
      studentId: new Types.ObjectId(studentId),
      issueDate: new Date(),
      dueDate,
      status: IssuedBookStatus.ISSUED,
      fine: 0,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    } as never);
  }

  async returnBook(id: string, schoolId: string, userId: string) {
    const issued = await issuedBookRepository.findById(id, schoolId);
    if (!issued) throw new AppError('Issued book record not found', 404);
    if (issued.status === IssuedBookStatus.RETURNED) throw new AppError('Book already returned', 400);

    const book = await this.getBook(issued.bookId.toString(), schoolId);
    const daysLate = Math.max(0, Math.ceil((Date.now() - issued.dueDate.getTime()) / 86400000));
    const fine = daysLate * 5;

    await bookRepository.update(book.id, schoolId, { availableCopies: book.availableCopies + 1 } as never, userId);

    return issuedBookRepository.update(id, schoolId, {
      status: IssuedBookStatus.RETURNED,
      returnDate: new Date(),
      fine,
    } as never, userId);
  }

  async listIssued(schoolId: string, query: PaginationQuery) {
    return issuedBookRepository.findAll(schoolId, query, []);
  }
}

export const libraryService = new LibraryService();
