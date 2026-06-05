import { Book, IBook } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';

class BookRepository extends BaseRepository<IBook> {
  constructor() {
    super(Book);
  }

  async findByIsbn(isbn: string, schoolId: string) {
    return this.model.findOne(this.baseFilter(schoolId, { isbn } as never));
  }

  async findByBarcode(barcode: string, schoolId: string) {
    return this.model.findOne(this.baseFilter(schoolId, { barcode } as never));
  }
}

export const bookRepository = new BookRepository();
