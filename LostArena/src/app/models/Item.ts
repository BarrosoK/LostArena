export interface IBonus {
  stat: string;
  value?: number;
  default?: number;
  variance?: number;
}

export interface IItem {
  _id: string;
  id: number;
  type: number;
  part?: string;
  img?: string;
  name: string;
  bonus?: Array<Object> | Object;
}
