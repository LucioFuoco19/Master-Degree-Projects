import { getMeasurementsDTO, getOutliersDTO, computeStats } from "@services/statsService";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";

describe("MeasurementService", () => {
  const sensorMac = "00:11:22:33:44:55";

  const mockMeasurements: MeasurementDTO[] = [
    { value: 14, createdAt: new Date("2024-01-10T21:10:00Z") },
    { value: 12, createdAt: new Date("2024-01-02T14:45:00Z") },
    { value: 100, createdAt: new Date("2024-01-12T12:00:00Z") }, // outlier
    { value: 7, createdAt: new Date("2024-01-07T06:20:00Z") },
    { value: 9, createdAt: new Date("2024-01-05T18:00:00Z") },
    { value: 10, createdAt: new Date("2024-01-01T08:30:00Z") },
    { value: 14, createdAt: new Date("2024-01-03T09:15:00Z") },
  ];  
  
  describe("getMeasurementsDTO", () => {
    it("should return stats and all measurements", () => {
      const dto: MeasurementsDTO = getMeasurementsDTO(sensorMac, [...mockMeasurements], "2010-01-01T00:00:00Z", "2026-01-12T23:59:59Z");

      expect(dto.sensorMacAddress).toBe(sensorMac);
      expect(dto.measurements.length).toBe(7);
      expect(dto.stats).toBeDefined();
      expect(dto.stats?.mean).toBeCloseTo(23.71, 1);
      expect(dto.stats?.variance).toBeCloseTo(975.63, 1);
    });

    it("should return empty measurements and zero stats for empty input", () => {
      const dto = getMeasurementsDTO(sensorMac, [], "2010-01-01T00:00:00Z", "2026-01-12T23:59:59Z");
      expect(dto.sensorMacAddress).toBe(sensorMac);
      expect(dto.measurements).toEqual([]);

      // ✅ Aggiornato: stats è definito e con valori a zero
      expect(dto.stats).toBeDefined();
      expect(dto.stats?.mean).toBe(0);
      expect(dto.stats?.variance).toBe(0);
      expect(dto.stats?.upperThreshold).toBe(0);
      expect(dto.stats?.lowerThreshold).toBe(0);
    });
  });

  describe("getOutliersDTO", () => {
    it("should return only outliers", () => {
      const dto = getOutliersDTO(sensorMac, [...mockMeasurements], "2010-01-01T00:00:00Z", "2026-01-12T23:59:59Z");

      const outliers = dto.measurements;
      expect(outliers.length).toBe(1);
      expect(outliers[0].value).toBe(100);
    });


  });

  describe("computeStats", () => {
    it("should compute mean, variance, thresholds and set outliers", () => {
      const list = [...mockMeasurements];
      const stats = computeStats(list, "2010-01-01T00:00:00Z", "2026-01-12T23:59:59Z");

      expect(stats.mean).toBeCloseTo(23.71, 1);
      expect(stats.variance).toBeCloseTo(975.63, 1);
      expect(stats.upperThreshold).toBeCloseTo(86.18, 1);
      expect(stats.lowerThreshold).toBeCloseTo(-38.76, 1);
      expect(stats.startDate).toEqual(new Date("2010-01-01T00:00:00Z"));
      expect(stats.endDate).toEqual(new Date("2026-01-12T23:59:59Z"));

      const isOutlier = list.map((m) => m.isOutlier);
      expect(isOutlier).toEqual([false, false, true, false, false, false, false]);
    });
  });
});
