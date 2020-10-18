import { TrailFileMeta } from './TrailFileMeta';

export class Trail {
  meta: TrailFileMeta;
  content: string;
  error?: string;
  private _coordinates: string[];
  private _placemarks: string[];

  constructor(meta: TrailFileMeta, content: string, error?: string) {
    this.meta = meta;
    this.content = content;
    this.error = error;
    this._coordinates = [];
    this._placemarks = [];
  }

  get coordinates(): string[] {
    return this._coordinates;
  }

  set coordinates(value: string[]) {
    this._coordinates = value;
  }

  get placemarks(): string[] {
    return this._placemarks;
  }

  set placemarks(value: string[]) {
    this._placemarks = value;
  }
}
