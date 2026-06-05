import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { timetableRepository } from '../repositories/timetable.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';
import {
  ITimetable,
  ITimetablePeriod,
  WeekDay,
} from '../../../database/models/timetable.model';
import { TimetableConflict, TimetableInput, TimetablePeriodInput } from '../types/timetable.types';

export class TimetableService {
  async create(schoolId: string | null, userId: string, data: TimetableInput) {
    const conflicts = await this.detectInputConflicts(schoolId, data);
    if (conflicts.length > 0) {
      throw new AppError('Timetable conflicts detected', 409, {
        conflicts: conflicts.map((c) => c.message),
      });
    }

    const existing = await timetableRepository.findByDayAndSection(
      schoolId,
      data.sectionId,
      data.day
    );
    if (existing) {
      throw new AppError(
        `Timetable already exists for section on ${data.day}`,
        409
      );
    }

    return timetableRepository.create({
      classId: new Types.ObjectId(data.classId),
      sectionId: new Types.ObjectId(data.sectionId),
      day: data.day,
      periods: this.mapPeriods(data.periods),
      ...buildAuditFields(userId, schoolId),
    });
  }

  async list(
    schoolId: string | null,
    query: PaginationQuery & { classId?: string; sectionId?: string; day?: WeekDay }
  ) {
    const extra: Record<string, unknown> = {};
    if (query.classId) extra.classId = new Types.ObjectId(query.classId);
    if (query.sectionId) extra.sectionId = new Types.ObjectId(query.sectionId);
    if (query.day) extra.day = query.day;
    return timetableRepository.findAll(schoolId, query, [], extra);
  }

  async getById(schoolId: string | null, id: string) {
    const doc = await timetableRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Timetable not found', 404);
    return doc;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    data: Partial<TimetableInput>
  ) {
    const existing = await this.getById(schoolId, id);
    const merged: TimetableInput = {
      classId: data.classId ?? existing.classId.toString(),
      sectionId: data.sectionId ?? existing.sectionId.toString(),
      day: data.day ?? existing.day,
      periods: data.periods ?? existing.periods.map((p) => ({
        subjectId: p.subjectId.toString(),
        teacherId: p.teacherId.toString(),
        startTime: p.startTime,
        endTime: p.endTime,
      })),
    };

    const conflicts = await this.detectInputConflicts(schoolId, merged, id);
    if (conflicts.length > 0) {
      throw new AppError('Timetable conflicts detected', 409, {
        conflicts: conflicts.map((c) => c.message),
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.classId) updateData.classId = new Types.ObjectId(data.classId);
    if (data.sectionId) updateData.sectionId = new Types.ObjectId(data.sectionId);
    if (data.day) updateData.day = data.day;
    if (data.periods) updateData.periods = this.mapPeriods(data.periods);

    const doc = await timetableRepository.update(id, schoolId, updateData, userId);
    if (!doc) throw new AppError('Timetable not found', 404);
    return doc;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const doc = await timetableRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Timetable not found', 404);
    return doc;
  }

  async detectConflicts(
    schoolId: string | null,
    filters: { classId?: string; sectionId?: string }
  ): Promise<TimetableConflict[]> {
    const extra: Record<string, unknown> = {};
    if (filters.classId) extra.classId = new Types.ObjectId(filters.classId);
    if (filters.sectionId) extra.sectionId = new Types.ObjectId(filters.sectionId);

    const timetables = await timetableRepository.findFiltered(schoolId, extra);
    return this.findConflictsInTimetables(timetables);
  }

  async generate(
    schoolId: string | null,
    userId: string,
    config: {
      classId: string;
      sectionId: string;
      schedule: Array<{ day: WeekDay; periods: TimetablePeriodInput[] }>;
    }
  ) {
    const created: ITimetable[] = [];

    for (const daySchedule of config.schedule) {
      const input: TimetableInput = {
        classId: config.classId,
        sectionId: config.sectionId,
        day: daySchedule.day,
        periods: daySchedule.periods,
      };

      const conflicts = await this.detectInputConflicts(schoolId, input);
      if (conflicts.length > 0) {
        throw new AppError(
          `Conflicts detected for ${daySchedule.day}`,
          409,
          { conflicts: conflicts.map((c) => c.message) }
        );
      }

      const existing = await timetableRepository.findByDayAndSection(
        schoolId,
        config.sectionId,
        daySchedule.day
      );

      if (existing) {
        const doc = await timetableRepository.update(
          existing._id.toString(),
          schoolId,
          { periods: this.mapPeriods(daySchedule.periods) },
          userId
        );
        if (doc) created.push(doc);
      } else {
        const doc = await timetableRepository.create({
          classId: new Types.ObjectId(config.classId),
          sectionId: new Types.ObjectId(config.sectionId),
          day: daySchedule.day,
          periods: this.mapPeriods(daySchedule.periods),
          ...buildAuditFields(userId, schoolId),
        });
        created.push(doc);
      }
    }

    return created;
  }

  private mapPeriods(periods: TimetablePeriodInput[]): ITimetablePeriod[] {
    return periods.map((p) => ({
      subjectId: new Types.ObjectId(p.subjectId),
      teacherId: new Types.ObjectId(p.teacherId),
      startTime: p.startTime,
      endTime: p.endTime,
    }));
  }

  private async detectInputConflicts(
    schoolId: string | null,
    input: TimetableInput,
    excludeId?: string
  ): Promise<TimetableConflict[]> {
    const allTimetables = await timetableRepository.findFiltered(schoolId, { day: input.day });
    const conflicts: TimetableConflict[] = [];

    const sectionConflict = allTimetables.find(
      (t) =>
        t.sectionId.toString() === input.sectionId &&
        t._id.toString() !== excludeId
    );
    if (sectionConflict) {
      conflicts.push({
        type: 'section',
        day: input.day,
        sectionId: input.sectionId,
        timetableIds: [sectionConflict._id],
        message: `Section already has a timetable for ${input.day}`,
      });
    }

    for (const period of input.periods) {
      for (const timetable of allTimetables) {
        if (timetable._id.toString() === excludeId) continue;
        if (timetable.sectionId.toString() === input.sectionId && excludeId) continue;

        for (const existingPeriod of timetable.periods) {
          if (existingPeriod.teacherId.toString() !== period.teacherId) continue;
          if (!this.timesOverlap(period, existingPeriod)) continue;

          conflicts.push({
            type: 'teacher',
            day: input.day,
            teacherId: period.teacherId,
            timetableIds: [timetable._id],
            message: `Teacher ${period.teacherId} has overlapping schedule on ${input.day} (${period.startTime}-${period.endTime})`,
          });
        }
      }

      const inputPeriods = input.periods.filter((p) => p !== period);
      for (const other of inputPeriods) {
        if (
          other.teacherId === period.teacherId &&
          this.timesOverlap(period, other)
        ) {
          conflicts.push({
            type: 'time_overlap',
            day: input.day,
            teacherId: period.teacherId,
            timetableIds: [],
            message: `Teacher ${period.teacherId} has overlapping periods in the same schedule`,
          });
        }
      }
    }

    return conflicts;
  }

  private findConflictsInTimetables(timetables: ITimetable[]): TimetableConflict[] {
    const conflicts: TimetableConflict[] = [];
    const byDay = new Map<WeekDay, ITimetable[]>();

    for (const tt of timetables) {
      if (!byDay.has(tt.day)) byDay.set(tt.day, []);
      byDay.get(tt.day)!.push(tt);
    }

    for (const [day, dayTimetables] of byDay) {
      const teacherSlots: Array<{
        teacherId: string;
        start: number;
        end: number;
        timetableId: Types.ObjectId;
      }> = [];

      for (const tt of dayTimetables) {
        for (const period of tt.periods) {
          teacherSlots.push({
            teacherId: period.teacherId.toString(),
            start: this.parseTime(period.startTime),
            end: this.parseTime(period.endTime),
            timetableId: tt._id,
          });
        }
      }

      for (let i = 0; i < teacherSlots.length; i++) {
        for (let j = i + 1; j < teacherSlots.length; j++) {
          const a = teacherSlots[i];
          const b = teacherSlots[j];
          if (a.teacherId !== b.teacherId) continue;
          if (a.start < b.end && b.start < a.end) {
            conflicts.push({
              type: 'teacher',
              day,
              teacherId: a.teacherId,
              timetableIds: [a.timetableId, b.timetableId],
              message: `Teacher ${a.teacherId} has conflicting slots on ${day}`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  private timesOverlap(
    a: { startTime: string; endTime: string },
    b: { startTime: string; endTime: string }
  ): boolean {
    const aStart = this.parseTime(a.startTime);
    const aEnd = this.parseTime(a.endTime);
    const bStart = this.parseTime(b.startTime);
    const bEnd = this.parseTime(b.endTime);
    return aStart < bEnd && bStart < aEnd;
  }

  private parseTime(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}

export const timetableService = new TimetableService();
