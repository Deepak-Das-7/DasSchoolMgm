import { Request, Response } from 'express';
import { libraryService } from '../services/library.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class LibraryController {
  async listBooks(req: Request, res: Response) {
    const result = await libraryService.listBooks(req.user!.schoolId!, req.query as never);
    sendSuccess(res, result);
  }

  async getBook(req: Request, res: Response) {
    const book = await libraryService.getBook(req.params.id, req.user!.schoolId!);
    sendSuccess(res, book);
  }

  async createBook(req: Request, res: Response) {
    const book = await libraryService.createBook(req.user!.schoolId!, req.user!.id, req.body);
    sendCreated(res, book);
  }

  async updateBook(req: Request, res: Response) {
    const book = await libraryService.updateBook(req.params.id, req.user!.schoolId!, req.user!.id, req.body);
    sendSuccess(res, book);
  }

  async deleteBook(req: Request, res: Response) {
    await libraryService.deleteBook(req.params.id, req.user!.schoolId!, req.user!.id);
    sendSuccess(res, null, 'Book deleted');
  }

  async findByIsbn(req: Request, res: Response) {
    const book = await libraryService.findByIsbn(req.params.isbn, req.user!.schoolId!);
    sendSuccess(res, book);
  }

  async findByBarcode(req: Request, res: Response) {
    const book = await libraryService.findByBarcode(req.params.barcode, req.user!.schoolId!);
    sendSuccess(res, book);
  }

  async getCategories(req: Request, res: Response) {
    const categories = await libraryService.getCategories(req.user!.schoolId!);
    sendSuccess(res, categories);
  }

  async issueBook(req: Request, res: Response) {
    const { bookId, studentId, dueDate } = req.body;
    const issued = await libraryService.issueBook(req.user!.schoolId!, req.user!.id, bookId, studentId, dueDate);
    sendCreated(res, issued);
  }

  async returnBook(req: Request, res: Response) {
    const result = await libraryService.returnBook(req.params.id, req.user!.schoolId!, req.user!.id);
    sendSuccess(res, result, 'Book returned');
  }

  async listIssued(req: Request, res: Response) {
    const result = await libraryService.listIssued(req.user!.schoolId!, req.query as never);
    sendSuccess(res, result);
  }
}

export const libraryController = new LibraryController();
