import * as fs from 'fs';
import * as path from 'path';

// Read the JSON file
const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'locations.json'), 'utf-8'),
);

// Type definitions
type Province = { name: string };
type District = { name: string; province: string };
type Sector = { name: string; district: string; province: string };
type Cell = {
  name: string;
  sector: string;
  district: string;
  province: string;
};
type Village = {
  name: string;
  cell: string;
  sector: string;
  district: string;
  province: string;
};

// Input types for the raw JSON
interface RawVillage {
  name: string;
}

interface RawCell {
  name: string;
  villages: RawVillage[];
}

interface RawSector {
  name: string;
  cells: RawCell[];
}

interface RawDistrict {
  name: string;
  sectors: RawSector[];
}

interface RawProvince {
  name: string;
  districts: RawDistrict[];
}

interface RawData {
  provinces: RawProvince[];
}

// Accumulator type
interface Accumulator {
  provinces: Province[];
  districts: District[];
  sectors: Sector[];
  cells: Cell[];
  villages: Village[];
}

// SOLUTION 1: Fix by adding explicit type annotations to each reduce
const { provinces, districts, sectors, cells, villages } = (
  raw as RawData
).provinces.reduce<Accumulator>(
  (acc, prov) =>
    prov.districts.reduce<Accumulator>(
      (a1, dist) =>
        dist.sectors.reduce<Accumulator>(
          (a2, sec) =>
            sec.cells.reduce<Accumulator>(
              (a3, cell) =>
                cell.villages.reduce<Accumulator>(
                  (a4, vil) => {
                    a4.villages.push({
                      name: vil.name,
                      cell: cell.name,
                      sector: sec.name,
                      district: dist.name,
                      province: prov.name,
                    });
                    return a4;
                  },
                  (() => {
                    a3.cells.push({
                      name: cell.name,
                      sector: sec.name,
                      district: dist.name,
                      province: prov.name,
                    });
                    return a3;
                  })(),
                ),
              (() => {
                a2.sectors.push({
                  name: sec.name,
                  district: dist.name,
                  province: prov.name,
                });
                return a2;
              })(),
            ),
          (() => {
            a1.districts.push({
              name: dist.name,
              province: prov.name,
            });
            return a1;
          })(),
        ),
      (() => {
        acc.provinces.push({ name: prov.name });
        return acc;
      })(),
    ),
  { provinces: [], districts: [], sectors: [], cells: [], villages: [] },
);

// SOLUTION 2: Cleaner approach with explicit typing and proper parameters
function extractDataWithReduce(rawData: RawData): Accumulator {
  return rawData.provinces.reduce<Accumulator>(
    (acc: Accumulator, prov: RawProvince): Accumulator => {
      // Add province
      acc.provinces.push({ name: prov.name });

      // Process districts
      return prov.districts.reduce<Accumulator>(
        (a1: Accumulator, dist: RawDistrict): Accumulator => {
          // Add district
          a1.districts.push({
            name: dist.name,
            province: prov.name,
          });

          // Process sectors
          return dist.sectors.reduce<Accumulator>(
            (a2: Accumulator, sec: RawSector): Accumulator => {
              // Add sector
              a2.sectors.push({
                name: sec.name,
                district: dist.name,
                province: prov.name,
              });

              // Process cells
              return sec.cells.reduce<Accumulator>(
                (a3: Accumulator, cell: RawCell): Accumulator => {
                  // Add cell
                  a3.cells.push({
                    name: cell.name,
                    sector: sec.name,
                    district: dist.name,
                    province: prov.name,
                  });

                  // Process villages
                  return cell.villages.reduce<Accumulator>(
                    (a4: Accumulator, vil: RawVillage): Accumulator => {
                      // Add village
                      a4.villages.push({
                        name: vil.name,
                        cell: cell.name,
                        sector: sec.name,
                        district: dist.name,
                        province: prov.name,
                      });
                      return a4;
                    },
                    a3,
                  );
                },
                a2,
              );
            },
            a1,
          );
        },
        acc,
      );
    },
    { provinces: [], districts: [], sectors: [], cells: [], villages: [] },
  );
}

// SOLUTION 3: Using Array.prototype.reduce with type assertion
const extractDataWithTypeAssertion = (rawData: any) => {
  return (rawData as RawData).provinces.reduce(
    (acc: Accumulator, prov: RawProvince) =>
      prov.districts.reduce(
        (a1: Accumulator, dist: RawDistrict) =>
          dist.sectors.reduce(
            (a2: Accumulator, sec: RawSector) =>
              sec.cells.reduce(
                (a3: Accumulator, cell: RawCell) =>
                  cell.villages.reduce(
                    (a4: Accumulator, vil: RawVillage) => {
                      a4.villages.push({
                        name: vil.name,
                        cell: cell.name,
                        sector: sec.name,
                        district: dist.name,
                        province: prov.name,
                      });
                      return a4;
                    },
                    (() => {
                      a3.cells.push({
                        name: cell.name,
                        sector: sec.name,
                        district: dist.name,
                        province: prov.name,
                      });
                      return a3;
                    })(),
                  ),
                (() => {
                  a2.sectors.push({
                    name: sec.name,
                    district: dist.name,
                    province: prov.name,
                  });
                  return a2;
                })(),
              ),
            (() => {
              a1.districts.push({
                name: dist.name,
                province: prov.name,
              });
              return a1;
            })(),
          ),
        (() => {
          acc.provinces.push({ name: prov.name });
          return acc;
        })(),
      ),
    {
      provinces: [],
      districts: [],
      sectors: [],
      cells: [],
      villages: [],
    } as Accumulator,
  );
};

// SOLUTION 4: Simplified single reduce with proper typing
function extractDataSingleReduce(rawData: RawData): Accumulator {
  return rawData.provinces.reduce<Accumulator>(
    (result, province) => {
      result.provinces.push({ name: province.name });

      const districtResult = province.districts.reduce<Accumulator>(
        (acc, district) => {
          acc.districts.push({ name: district.name, province: province.name });

          const sectorResult = district.sectors.reduce<Accumulator>(
            (acc2, sector) => {
              acc2.sectors.push({
                name: sector.name,
                district: district.name,
                province: province.name,
              });

              const cellResult = sector.cells.reduce<Accumulator>(
                (acc3, cell) => {
                  acc3.cells.push({
                    name: cell.name,
                    sector: sector.name,
                    district: district.name,
                    province: province.name,
                  });

                  const villageResult = cell.villages.reduce<Accumulator>(
                    (acc4, village) => {
                      acc4.villages.push({
                        name: village.name,
                        cell: cell.name,
                        sector: sector.name,
                        district: district.name,
                        province: province.name,
                      });
                      return acc4;
                    },
                    acc3,
                  );

                  return villageResult;
                },
                acc2,
              );

              return cellResult;
            },
            acc,
          );

          return sectorResult;
        },
        result,
      );

      return districtResult;
    },
    { provinces: [], districts: [], sectors: [], cells: [], villages: [] },
  );
}

// Usage examples:
// console.log('Solution 1 (Fixed original):');
// console.log({ provinces, districts, sectors, cells, villages });

// console.log('\nSolution 2 (Function with explicit typing):');
// const result2 = extractDataWithReduce(raw as RawData);
// console.log(result2);

// console.log('\nSolution 3 (Type assertion):');
// const result3 = extractDataWithTypeAssertion(raw);
// console.log(result3);

// console.log('\nSolution 4 (Single reduce):');
// const result4 = extractDataSingleReduce(raw as RawData);
// console.log(result4);

// Export the results
export { provinces, districts, sectors, cells, villages };
export {
  extractDataWithReduce,
  extractDataWithTypeAssertion,
  extractDataSingleReduce,
};
