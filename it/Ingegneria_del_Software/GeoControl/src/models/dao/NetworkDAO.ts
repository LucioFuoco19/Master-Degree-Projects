import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { GatewayDAO } from "./GatewayDAO";

@Entity("networks")
export class NetworkDAO {

    @PrimaryGeneratedColumn()
    networkID!: number; // auto-incremented primary key

    @Column({ unique: true })
    code: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    description: string;

    @OneToMany(() => GatewayDAO, (gateway) => gateway.network, {
        nullable: true
    })
    gateways: GatewayDAO[]; //gateways in the network
}
