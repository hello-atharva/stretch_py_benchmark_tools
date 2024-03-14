#!/usr/bin/python3

# Built-in imports
import json

# Third-party imports
import zmq

# Stretch importsS
import stretch_body

class StretchBodyZMQCLient():
    def __init__(self, hostname, port):
        self.ctx = zmq.Context()
        self.sock = self.ctx.socket(zmq.SUB)
        self.sock.connect(f"tcp://{hostname}:{str(port)}")

        # Subscribe to stretch_teleop_commands
        self.sock.setsockopt(zmq.SUBSCRIBE, 'stretch_teleop_commands'.encode('utf-8'))
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
                    pass
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
