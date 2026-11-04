import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from '../../database/schemas/person.schema';
import { Person as PersonInterface } from '../../common/types/navigation.types';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
  ) {}

  async listAll(): Promise<PersonInterface[]> {
    const people = await this.personModel.find().sort({ createdAt: 1 }).lean();
    return people.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      createdAt: p.createdAt,
    }));
  }
}
