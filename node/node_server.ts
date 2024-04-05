import { Robot } from './ts/zmq';
import { WebRTCConnection } from './ts/webrtcconnections'
import { navigationProps, realsenseProps, gripperProps, WebRTCMessage, ValidJointStateDict, ValidJointStateMessage, IsRunStoppedMessage, RobotPose, MoveBaseState, MoveBaseStateMessage, BatteryVoltageMessage, HasBetaTeleopKitMessage } from './ts/util'
// import { AllVideoStreamComponent, VideoStream } from './videostreams';

export const robot = new Robot(
    // jointStateCallback: forwardJointStates,
    // batteryStateCallback: forwardBatteryState,
    // occupancyGridCallback: forwardOccupancyGrid,
    // moveBaseResultCallback: forwardMoveBaseState,
    // amclPoseCallback: forwardAMCLPose,
    // isRunStoppedCallback: forwardIsRunStopped,
    // hasBetaTeleopKitCallback: forwardHasBetaTeleopKit
)

export let connection: WebRTCConnection;
// export let navigationStream = new VideoStream(navigationProps);
// export let realsenseStream = new VideoStream(realsenseProps)
// export let gripperStream = new VideoStream(gripperProps);
// let occupancyGrid: ROSOccupancyGrid | undefined;

connection = new WebRTCConnection({
    peerRole: 'robot',
    polite: false,
    onRobotConnectionStart: handleSessionStart,
    onMessage: handleMessage,
    onConnectionEnd: disconnectFromRobot
})

robot.connect().then(() => {
    // robot.subscribeToVideo({
    //     topicName: "/navigation_camera/image_raw/rotated/compressed",
    //     callback: navigationStream.updateImage
    // })
    // navigationStream.start()

    // robot.subscribeToVideo({
    //     topicName: "/camera/color/image_raw/rotated/compressed",
    //     callback: realsenseStream.updateImage
    // })
    // realsenseStream.start()

    // robot.subscribeToVideo({
    //     topicName: "/gripper_camera/image_raw/cropped/compressed",
    //     callback: gripperStream.updateImage
    // })
    // gripperStream.start()

    // robot.getOccupancyGrid()
    // robot.getJointLimits()
    
    connection.joinRobotRoom()
})

function handleSessionStart() {
    // connection.removeTracks()

    // console.log('adding local media stream to peer connection');

    // let stream: MediaStream = navigationStream.outputVideoStream!;
    // stream.getTracks().forEach(track => connection.addTrack(track, stream, "overhead"))

    // stream = realsenseStream.outputVideoStream!;
    // stream.getTracks().forEach(track => connection.addTrack(track, stream, "realsense"))

    // stream = gripperStream.outputVideoStream!;
    // stream.getTracks().forEach(track => connection.addTrack(track, stream, "gripper"))
    console.log("Opening data channels")
    connection.openDataChannels()
}

function sendPing(msg: string) {
    if (!connection) throw 'WebRTC connection undefined!'

    connection.sendData({type: "ping", message: msg});
}

// setInterval(sendPing, 1000, "hello, operator");

// function forwardMoveBaseState(state: MoveBaseState) {
//     if (!connection) throw 'WebRTC connection undefined!'
    
//     if (state.alert_type != "info") {
//         connection.sendData({
//             type: "goalStatus",
//             message: state
//         } as GoalStatusMessage)
//     }

//     connection.sendData({
//         type: "moveBaseState",
//         message: state
//     } as MoveBaseStateMessage)
// }

// function forwardIsRunStopped(isRunStopped: boolean) {
//     if (!connection) throw 'WebRTC connection undefined!'

//     connection.sendData({
//         type: "isRunStopped",
//         enabled: isRunStopped,
//     } as IsRunStoppedMessage);
// }

// function forwardHasBetaTeleopKit(value: boolean) {
//     if (!connection) throw 'WebRTC connection undefined!'

//     connection.sendData({
//         type: "hasBetaTeleopKit",
//         value: value,
//     } as HasBetaTeleopKitMessage);
// }

// function forwardJointStates(robotPose: RobotPose, jointValues: ValidJointStateDict, effortValues: ValidJointStateDict) {
//     if (!connection) throw 'WebRTC connection undefined!'

//     connection.sendData({
//         type: "validJointState",
//         robotPose: robotPose,
//         jointsInLimits: jointValues,
//         jointsInCollision: effortValues
//     } as ValidJointStateMessage);
// }

// function forwardBatteryState(batteryState: ROSBatteryState) {
//     if (!connection) throw 'WebRTC connection undefined'

//     connection.sendData({
//         type: 'batteryVoltage',
//         message: batteryState.voltage
//     } as BatteryVoltageMessage);
// }

// function forwardOccupancyGrid(occupancyGrid: ROSOccupancyGrid) {
//     if (!connection) throw 'WebRTC connection undefined'

//     let splitOccupancyGrid: ROSOccupancyGrid = {
//         header: occupancyGrid.header,
//         info: occupancyGrid.info,
//         data: []
//     }

//     const data_size = 50000
//     for (let i = 0; i < occupancyGrid.data.length; i += data_size) {
//         const data_chunk = occupancyGrid.data.slice(i, i + data_size);
//         splitOccupancyGrid.data = data_chunk
//         connection.sendData({
//             type: 'occupancyGrid',
//             message: splitOccupancyGrid
//         } as OccupancyGridMessage);
//     }

//     // occupancyGrid.data = occupancyGrid.data.slice(0, 70000)
//     // console.log('forwarding', occupancyGrid)
//     // connection.sendData({
//     //     type: 'occupancyGrid',
//     //     message: occupancyGrid
//     // } as OccupancyGridMessage);
// }

// function forwardAMCLPose(transform: ROSLIB.Transform) {
//     if (!connection) throw 'WebRTC connection undefined'

//     connection.sendData({
//         type: 'amclPose',
//         message: transform
//     } as MapPoseMessage)
// }

function handleMessage(message: WebRTCMessage) {
    if (!("type" in message)) {
        console.error("Malformed message:", message)
        return
    }

    switch (message.type) {
        case "driveBase":
            console.log("Got command: driveBase")
            // robot.executeBaseVelocity(message.modifier)
            break;
        case "incrementalMove":
            console.log("Got command: incrementalMove")
            // robot.executeIncrementalMove(message.jointName, message.increment)
            break
        case "stopTrajectory":
            console.log("Got command: stopTrajectory")
            // robot.stopTrajectoryClient()
            break
        case "stopMoveBase":
            console.log("Got command: stopMoveBase")
            // robot.stopMoveBaseClient()
            break
        case "setRobotMode":
            console.log("Got command: setRobotMode")
            // message.modifier == "navigation" ? robot.switchToNavigationMode() : robot.switchToPositionMode()
            break
        case "setCameraPerspective":
            console.log("Got command: setCameraPerspective")
            // robot.setCameraPerspective({ camera: message.camera, perspective: message.perspective })
            break
        case "setRobotPose":
            console.log("Got command: setRobotPose")
            // robot.executePoseGoal(message.pose)
            break
        case "playbackPoses":
            console.log("Got command: playbackPoses")
            // robot.executePoseGoals(message.poses, 0)
            break
        case "moveBase":
            console.log("Got command: moveBase")
            // robot.executeMoveBaseGoal(message.pose)
            break
        case "setFollowGripper":
            console.log("Got command: setFollowGripper")
            // robot.setPanTiltFollowGripper(message.toggle)
            break
        case "setDepthSensing":
            console.log("Got command: setDepthSensing")
            // robot.setDepthSensing(message.toggle)
            break
        case "setRunStop":
            console.log("Got command: setRunStop")
            // robot.setRunStop(message.toggle)
            break
        case "lookAtGripper":
            console.log("Got command: lookAtGripper")
            // robot.lookAtGripper(0, 0)
            break
        case "getOccupancyGrid":
            console.log("Got command: getOccupancyGrid")
            // robot.getOccupancyGrid()
            break 
        case "getHasBetaTeleopKit":
            console.log("Got command: getHasBetaTeleopKit")
            // robot.getHasBetaTeleopKit()
            break;
    }
};

function disconnectFromRobot() {
    // robot.closeROSConnection()
    connection.hangup()
}

// window.onbeforeunload = () => {
//     // robot.closeROSConnection()
//     connection.hangup()
// };

// New method of rendering in react 18
// const container = document.getElementById('root');
// const root = createRoot(container!); // createRoot(container!) if you use TypeScript
// root.render(<AllVideoStreamComponent streams={[navigationStream, realsenseStream, gripperStream]} />);
