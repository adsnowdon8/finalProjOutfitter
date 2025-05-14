export type EmbeddedItem = ClothingItem & {
  embedding: number[];
};

export enum Category {
  Tops = "tops",
  Bottoms = "bottoms",
  Shoes = "shoes",
}
export type ClothingItem = {
  name: string;
  description?: string;
  imgFileUri: string;
  category: Category;
  // color: string;
  temperatureRange: [string, string];
};
export type ForecastHour = {
  displayDateTime?: { value: string };
  temperature?: { value: number };
  relativeHumidity?: number;
  uvIndex?: number;
  cloudCover?: number;
  isDaytime?: boolean;
};

export type FormattedHour = {
  time: string | undefined;
  temp: number | undefined;
  humidity: number | undefined;
  uvIndex: number | undefined;
  cloudCover: number | undefined;
  isDaytime: boolean | undefined;
};
