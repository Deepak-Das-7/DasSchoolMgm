import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { libraryController } from '../controllers/library.controller';
import { createBookSchema, issueBookSchema, listBooksQuerySchema, updateBookSchema } from '../validators/library.validators';
import { idParamSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';

const router = Router();
router.use(authenticate, requireSchoolContext);

router.get('/books', requirePermission('library:read'), validate(listBooksQuerySchema, 'query'), libraryController.listBooks.bind(libraryController));
router.get('/books/isbn/:isbn', requirePermission('library:read'), libraryController.findByIsbn.bind(libraryController));
router.get('/books/barcode/:barcode', requirePermission('library:read'), libraryController.findByBarcode.bind(libraryController));
router.get('/books/:id', requirePermission('library:read'), validate(idParamSchema, 'params'), libraryController.getBook.bind(libraryController));
router.post('/books', requirePermission('library:write'), validate(createBookSchema), auditLog('create', 'book'), libraryController.createBook.bind(libraryController));
router.put('/books/:id', requirePermission('library:write'), validate(idParamSchema, 'params'), validate(updateBookSchema), auditLog('update', 'book'), libraryController.updateBook.bind(libraryController));
router.delete('/books/:id', requirePermission('library:write'), validate(idParamSchema, 'params'), auditLog('delete', 'book'), libraryController.deleteBook.bind(libraryController));
router.get('/categories', requirePermission('library:read'), libraryController.getCategories.bind(libraryController));
router.post('/issue', requirePermission('library:write'), validate(issueBookSchema), auditLog('create', 'issued_book'), libraryController.issueBook.bind(libraryController));
router.post('/return/:id', requirePermission('library:write'), validate(idParamSchema, 'params'), auditLog('update', 'issued_book'), libraryController.returnBook.bind(libraryController));
router.get('/issued', requirePermission('library:read'), validate(paginationQuerySchema, 'query'), libraryController.listIssued.bind(libraryController));

export default router;
