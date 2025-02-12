import { BibleBookData } from '../common/books';
import { rejigAlignment } from '../utils/rejig_alignment';
import { getAlignedQuote, getAlignedQuoteTryingDifferentSeparators } from './getAlignedQuote';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

