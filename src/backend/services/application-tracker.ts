import { ApplicationTrackerRecord, ApplicationTrackerFilter } from '@/shared/types';
import { db } from '../db/database';

/**
 * Local Application Tracker Service
 * Stores application history in local SQLite database with duplicate detection & CRUD.
 */

export class ApplicationTracker {
  /**
   * Check for duplicate job application
   */
  public isDuplicateApplication(jobUrl: string, company: string, jobTitle: string): { isDuplicate: boolean; existingRecord?: ApplicationTrackerRecord } {
    const history = db.getApplicationTrackerRecords();
    
    const existing = history.find(rec => 
      (rec.jobUrl && rec.jobUrl === jobUrl) ||
      (rec.company.toLowerCase() === company.toLowerCase() && rec.jobTitle.toLowerCase() === jobTitle.toLowerCase())
    );

    return {
      isDuplicate: !!existing,
      existingRecord: existing,
    };
  }

  /**
   * Save or update application tracker record
   */
  public saveRecord(record: ApplicationTrackerRecord): ApplicationTrackerRecord {
    const existingRecords = db.getApplicationTrackerRecords();
    const index = existingRecords.findIndex(r => r.id === record.id || (r.jobUrl && r.jobUrl === record.jobUrl));

    if (index >= 0) {
      existingRecords[index] = { ...existingRecords[index], ...record };
    } else {
      existingRecords.unshift(record);
    }

    db.saveApplicationTrackerRecords(existingRecords);
    return record;
  }

  /**
   * Delete application record
   */
  public deleteRecord(recordId: string): void {
    const records = db.getApplicationTrackerRecords().filter(r => r.id !== recordId);
    db.saveApplicationTrackerRecords(records);
  }

  /**
   * Filter and list application records
   */
  public getRecords(filter?: ApplicationTrackerFilter): ApplicationTrackerRecord[] {
    let records = db.getApplicationTrackerRecords();

    if (!filter) return records;

    if (filter.status && filter.status !== 'all') {
      records = records.filter(r => r.status === filter.status);
    }

    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      records = records.filter(r => 
        r.company.toLowerCase().includes(q) ||
        r.jobTitle.toLowerCase().includes(q)
      );
    }

    if (filter.minMatchScore !== undefined) {
      records = records.filter(r => r.matchScore >= filter.minMatchScore!);
    }

    return records;
  }
}

export const applicationTracker = new ApplicationTracker();
