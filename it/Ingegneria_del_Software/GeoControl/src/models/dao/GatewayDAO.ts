import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { SensorDAO } from "./SensorDAO";
import { NetworkDAO } from "./NetworkDAO";



@Entity("gateways")
export class GatewayDAO {

    @PrimaryGeneratedColumn()
    gatewayID!: number;

    @Column({ unique: true, nullable: false }) 
    macAddress: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    description: string;


    @ManyToOne(() => NetworkDAO, (network) => network.gateways, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    network: NetworkDAO;
      

    @OneToMany(() => SensorDAO, (sensor) => sensor.gateway, {
        nullable: true
    })
    sensors: SensorDAO[]; //sensors linked to the gateway

}
