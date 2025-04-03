import { IUsuario } from '../models/Usuarios';

declare module 'mongodb' {
  interface Collection<T> {
    findOneAndUpdate(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>>;
  }

  interface UpdateFilter<TSchema> {
    $push?: {
      [key in keyof TSchema]?: any;
    };
    $inc?: {
      [key in keyof TSchema]?: number;
    };
    $set?: {
      [key in keyof TSchema]?: any;
    };
  }
}