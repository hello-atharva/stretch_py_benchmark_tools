#!/usr/bin/python3

# Built-in imports
import json

# Third-party imports
import zmq

# Stretch imports
import stretch_body.robot

class StretchBodyZMQCLient():
    def __init__(self, hostname, port):
        self.ctx = zmq.Context()
        self.sock = self.ctx.socket(zmq.SUB)
        self.sock.connect(f"tcp://{hostname}:{str(port)}")

        # Subscribe to stretch_teleop_commands
        self.sock.setsockopt(zmq.SUBSCRIBE, ''.encode('utf-8'))

        # Stretch body
        self.robot = stretch_body.robot.Robot()
        self.robot.startup()
    def run(self):
        # Run indefinetly and listen to incoming messages
        try:
            while True:
                topic, msg = self.sock.recv_multipart()
                print(
                    '   Command:{}'.format(
                        msg.decode('utf-8')
                    )
                )

                # Handle command
                cmd = json.loads(msg.decode('utf-8'))

                if cmd['type'] == "forward":
                    pass
                elif cmd['type'] == "moveBy":
                    pass
                elif cmd['type'] == "moveTo":
                    pass
                elif cmd['type'] == "home":
                    self.robot.home()
                elif cmd['type'] == "runstop":
                    pass
                else:
                    print("Unknown command")
        except KeyboardInterrupt:
            pass
        print("Done.")

if __name__=="__main__":
    client = StretchBodyZMQCLient("localhost", 3000)
    client.run()
