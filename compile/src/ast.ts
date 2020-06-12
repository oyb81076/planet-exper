export interface IRoot {
  key: string;
  link: string[]
  attrs: Record<string, string>;
  events: {
    vars?: string;
    'click-alert'?: string;
  },
}
