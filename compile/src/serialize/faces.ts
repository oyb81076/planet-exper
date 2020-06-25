export interface ISerializeConfig {
  compress?: boolean;
  compactJS?: boolean;
  compactJSON?: boolean;
  quote?: boolean;
}

export interface ISerializer {
  compress: boolean;
  compactJS: boolean;
  compactJSON: boolean;
  quote: boolean;
}
