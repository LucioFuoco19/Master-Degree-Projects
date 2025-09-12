import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SensorDAO } from "./SensorDAO";


@Entity("measurement")
export class MeasurementDAO {
  @PrimaryGeneratedColumn()
  measurementID!: number;

  @Column({ type: "text", transformer: {
    to: (value: Date) => value.toISOString(), // "2024-02-18T16:00:00.000Z"
    from: (value: string) => new Date(value),
  }})
  createdAt: Date;

  @Column({ type: "real", nullable: false })
  value: number;

  @ManyToOne(() => SensorDAO, (sensor) => sensor.measurements, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "sensorID" })
  sensor: SensorDAO;
}
