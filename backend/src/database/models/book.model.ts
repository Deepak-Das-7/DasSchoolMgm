import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IBook extends Document, BaseDocumentFields {
  title: string;
  author: string;
  isbn?: string;
  category: string;
  barcode?: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation?: string;
}

const bookSchema = new Schema<IBook>(
  {
    ...baseSchemaFields,
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true },
    totalCopies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
    shelfLocation: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(bookSchema);
bookSchema.index({ schoolId: 1, isbn: 1 }, { sparse: true });
bookSchema.index({ schoolId: 1, barcode: 1 }, { sparse: true, unique: true });
bookSchema.index({ schoolId: 1, category: 1 });
bookSchema.index({ title: 'text', author: 'text' });

export const Book = model<IBook>('Book', bookSchema);
