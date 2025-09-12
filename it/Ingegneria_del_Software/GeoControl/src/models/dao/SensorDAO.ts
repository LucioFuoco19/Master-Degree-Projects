import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { MeasurementDAO } from "./MeasurementDAO";
import { GatewayDAO } from "./GatewayDAO";

@Entity("sensors")
export class SensorDAO {

    @PrimaryGeneratedColumn()
    sensorID!: number;

    @Column({ unique: true })
    macAddress: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    description: string;

    @Column({ nullable: false })
    variable: string;

    @Column({ nullable: false })
    unit: string;

    @ManyToOne(() => GatewayDAO, (gateway) => gateway.sensors, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "gatewayID" }) 
    gateway: GatewayDAO;

    @OneToMany(() => MeasurementDAO, (measurement) => measurement.sensor, {
        nullable: true
    })
    measurements: MeasurementDAO[];
}
