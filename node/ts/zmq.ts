// TODOs:
//  1. Add support for jointStateCallback, batteryStateCallback, occupancyGridCallback, moveBaseResultCallback, amclPoseCallback, isRunStoppedCallback, hasBetaTeleopKitCallback

import { Socket } from 'zeromq';
import { RobotPose, ValidJointStateDict } from './util';


export class Robot {
    private socket: zmq.Socket
    // private jointStateCallback: (robotPose: RobotPose, jointValues: ValidJointStateDict, effortValues: ValidJointStateDict) => void
    // private batteryStateCallback: (batteryState: ROSBatteryState) => void
    // private occupancyGridCallback: (occupancyGrid: ROSOccupancyGrid) => void
    // private moveBaseResultCallback: (goalState: MoveBaseState) => void
    // private amclPoseCallback: (pose: ROSLIB.Transform) => void
    // private isRunStoppedCallback: (isRunStopped: boolean) => void
    // private hasBetaTeleopKitCallback: (value: boolean) => void

    constructor(
        // jointStateCallback: (robotPose: RobotPose, jointValues: ValidJointStateDict, effortValues: ValidJointStateDict) => void,
        // batteryStateCallback: (batteryState: ROSBatteryState) => void,
        // occupancyGridCallback: (occupancyGrid: ROSOccupancyGrid) => void,
        // moveBaseResultCallback: (goalState: MoveBaseState) => void,
        // amclPoseCallback: (pose: ROSLIB.Transform) => void,
        // isRunStoppedCallback: (isRunStopped: boolean) => void,
        // hasBetaTeleopKitCallback: (value: boolean) => void
    ) {
        // this.jointStateCallback = jointStateCallback
        // this.batteryStateCallback = batteryStateCallback
        // this.occupancyGridCallback = occupancyGridCallback
        // this.moveBaseResultCallback = moveBaseResultCallback
        // this.amclPoseCallback = amclPoseCallback
        // this.isRunStoppedCallback = isRunStoppedCallback
        // this.hasBetaTeleopKitCallback = hasBetaTeleopKitCallback
    }

    async connect(): Promise<void> {
        this.socket = new zmq.Pair();
        let context = new zmq.Context();
        context.socket(zmq.PAIR);


        await this.socket.connect("tcp://127.0.0.1:3000");
        this.socket.send("hello");
        await this.socket.receive();
    }

    executeBaseVelocity = (props: {linVel: number, angVel: number}): void => {
        console.log(props);
        console.log(props.linVel);
    }
}

