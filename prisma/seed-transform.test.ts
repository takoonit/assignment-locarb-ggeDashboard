import { describe, expect, it } from "vitest";
import { transformSeedCsv } from "./seed-transform";

const fixture = `Metadata,Generated export
Country Name,Country Code,Series Name,Series Code,1990 [YR1990],1991 [YR1991],2020 [YR2020]
Thailand,THA,Total greenhouse gas emissions,EN.GHG.ALL.MT.CE.AR5,100,,0
Thailand,THA,CO2 emissions,EN.ATM.CO2E.KT,50,..,60
Thailand,THA,Methane emissions,EN.ATM.METH.KT.CE,5,6,7
Thailand,THA,Nitrous oxide emissions,EN.ATM.NOXE.KT.CE,1.5,2.5,3.5
Thailand,THA,HFC gas emissions,EN.ATM.HFCG.KT.CE,,0,4
Thailand,THA,PFC gas emissions,EN.ATM.PFCG.KT.CE,1,,2
Thailand,THA,SF6 gas emissions,EN.ATM.SF6G.KT.CE,0.1,,0.3
Thailand,THA,CO2 emissions from transport,EN.CO2.TRAN.ZS,10,11,12
Thailand,THA,CO2 emissions from manufacturing/construction,EN.CO2.MANF.ZS,20,21,22
Thailand,THA,CO2 emissions from electricity/heat,EN.CO2.ELGH.ZS,30,31,32
Thailand,THA,CO2 emissions from buildings,EN.CO2.BLDG.ZS,40,,42
Thailand,THA,CO2 emissions from other sectors,EN.CO2.OTHX.ZS,0,..,52
World,WLD,Total greenhouse gas emissions,EN.GHG.ALL.MT.CE.AR5,1000,1001,1002
Footer,Footer,Footer,Footer,,,
`;

describe("seed CSV transformer", () => {
  const result = transformSeedCsv(fixture);

  it("extracts countries and marks aggregate regions", () => {
    expect(result.countries).toEqual([
      { code: "THA", name: "Thailand", isRegion: false },
      { code: "WLD", name: "World", isRegion: true },
    ]);
  });

  it("maps annual gas series and preserves missing values as null", () => {
    expect(result.annualEmissionsByCountryYear.get("THA:1990")).toEqual({
      countryCode: "THA",
      year: 1990,
      total: 100,
      co2: 50,
      ch4: 5,
      n2o: 1.5,
      hfc: null,
      pfc: 1,
      sf6: 0.1,
    });

    expect(result.annualEmissionsByCountryYear.get("THA:1991")).toMatchObject({
      countryCode: "THA",
      year: 1991,
      total: null,
      co2: null,
      hfc: 0,
    });

    expect(result.annualEmissionsByCountryYear.get("THA:2020")).toMatchObject({
      total: 0,
      co2: 60,
    });
  });

  it("maps sector series to sector shares", () => {
    expect(result.sectorSharesByCountryYear.get("THA:1990")).toEqual({
      countryCode: "THA",
      year: 1990,
      transport: 10,
      manufacturing: 20,
      electricity: 30,
      buildings: 40,
      other: 0,
    });

    expect(result.sectorSharesByCountryYear.get("THA:1991")).toMatchObject({
      buildings: null,
      other: null,
    });
  });

  it("skips metadata, footer, and unmapped rows", () => {
    expect(result.countries.map((country) => country.code)).not.toContain(
      "Footer",
    );
    expect(result.annualEmissionsByCountryYear.has("Footer:1990")).toBe(false);
  });
});
