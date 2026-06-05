import { IssuedBook, IIssuedBook } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';

class IssuedBookRepository extends BaseRepository<IIssuedBook> {
  constructor() {
    super(IssuedBook);
  }
}

export const issuedBookRepository = new IssuedBookRepository();
