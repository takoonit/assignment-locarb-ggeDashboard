export type AdminCountryRow = {
  id: string;
  code: string;
  name: string;
  isRegion: boolean;
};

export type AdminEmissionRow = {
  id: string;
  countryCode: string;
  year: number;
  total: number | null;
  co2: number | null;
  ch4: number | null;
  n2o: number | null;
  hfc: number | null;
  pfc: number | null;
  sf6: number | null;
};

export type AdminSectorShareRow = {
  id: string;
  countryCode: string;
  year: number;
  transport: number | null;
  manufacturing: number | null;
  electricity: number | null;
  buildings: number | null;
  other: number | null;
};
