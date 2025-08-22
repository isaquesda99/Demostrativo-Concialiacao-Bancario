'use server';

import {
  analyzeFinancialDocuments,
  type AnalyzeFinancialDocumentsInput,
} from '@/ai/flows/extract-and-compare-values';

export async function comparePdfsAction(data: AnalyzeFinancialDocumentsInput) {
  try {
    const result = await analyzeFinancialDocuments(data);
    return {success: true, data: result};
  } catch (error) {
    console.error('Error during PDF comparison:', error);
    return {
      success: false,
      error:
        'An unexpected error occurred while analyzing the documents. Please try again.',
    };
  }
}
