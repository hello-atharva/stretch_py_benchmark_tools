#!/usr/bin/python3

# Built-in imports
import base64
import json
import threading
import time

# Third-party imports
import cv2
import numpy as np
import zmq

# Stretch imports
# import stretch_body

class StretchBodyZMQCLient():
    def __init__(self, hostname, port):
        self.hostname = hostname
        self.port = port
        self.ctx = zmq.Context()
        self.sock = self.ctx.socket(zmq.SUB)
        self.sock.connect(f"tcp://{hostname}:{str(port)}")

        # Subscribe to stretch_teleop_commands
        self.sock.setsockopt(zmq.SUBSCRIBE, ''.encode('utf-8'))

        self.ack_dict = {}
        self.msg_id = 0
        self.latencies = []
        self.json_message_count = 0
        self.json_start_time = 0.0
        self.json_lock = threading.Lock()

        # self.pub_image = False
        # self.image_dict = {}
        # self.latencies_image = []
        # self.image_id = 0
        # self.image_count = 0
        self.image_lock = threading.Lock()

    def run_publisher(self):
        pub_ctx = zmq.Context()
        pub_sock = pub_ctx.socket(zmq.PUB)
        pub_sock.bind("tcp://*:3001")

        # Publish messages
        while True:
            self.json_start_time = time.time()
            with self.json_lock:
                self.ack_dict[self.msg_id] = time.time()
                pub_sock.send_multipart(
                    [b'stretch_teleop_commands', ('{"type":"forward", "value":0.1, "id":' + str(self.msg_id) + "}").encode('utf-8')]
                )
                self.msg_id += 1
                # print("Published message")
            time.sleep(0.01)

    def run_subscriber(self):
        # Run indefinetly and listen to incoming messages
        sub_ctx = zmq.Context()
        sub_sock = sub_ctx.socket(zmq.SUB)
        sub_sock.connect(f"tcp://{self.hostname}:{str(self.port)}")
        sub_sock.setsockopt(zmq.SUBSCRIBE, ''.encode('utf-8'))

        try:
            while True:
                topic, msg = sub_sock.recv_multipart()
                print(
                    'Received Command:{}'.format(
                        msg.decode('utf-8')
                    )
                )

                with self.json_lock:
                    self.json_message_count += 1
                    cmd = json.loads(json.loads(msg.decode('utf-8')))
                    # print(cmd)
                    if int(cmd['id']) in self.ack_dict:
                        self.latencies.append(time.time() - self.ack_dict[int(cmd['id'])])
                        print("For id {}, latency: {}".format(cmd['id'], self.latencies[-1]))
                        # del self.ack_dict[int(cmd['id'])]
                        avg_latency = sum(self.latencies) / len(self.latencies)
                        print("Average latency: {}".format(avg_latency))
                    else:
                        print("Received unknown id: {}".format(cmd['id']))

                    # elapsed_time = time.time() - self.start_time
                    # control_rate = self.json_message_count / elapsed_time
                    # print("Control rate: {}".format(control_rate))

                # Handle command
                # cmd = json.loads(msg.decode('utf-8'))

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

    def runImagePublisher(self):
        pub_ctx = zmq.Context()
        pub_sock = pub_ctx.socket(zmq.PUSH)
        # pub_sock = pub_ctx.socket(zmq.PUSH)
        pub_sock.bind("tcp://127.0.0.1:3002")

        # Send black 1280x720 images from an empty array
        while True:
            with self.image_lock:
                img = np.zeros((720, 1280, 3), dtype=np.uint8)
                # self.image_dict[self.image_id] = time.time()
                # Prepend the image with the id
                img = np.ascontiguousarray(img)
                img = cv2.imencode('.png', img)[1].tobytes()
                img = np.array(list(img))
                # We are currently not using the image id for latency calculation so we can comment this out
                # img = np.insert(img, 0, self.image_id)

                # Instead, we base64 encode the image and send it in order to display it on the web page
                img = base64.b64encode(img)
                # convert the image to a string
                # img = img.decode('utf-8')
                # create a dictionary with the image
                msg = {"type": "image", "data": "/9j/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCAEmASYDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAQF/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AgeA1EYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q=="}
 
                # convert the dictionary to a string
                msg = json.dumps(msg)
                pub_sock.send_string(msg)
                print("Published image")
                # self.image_id += 1
            time.sleep(1)

    def runImageSubscriber(self):
        sub_ctx = zmq.Context()
        sub_sock = sub_ctx.socket(zmq.PULL)
        # sub_sock = sub_ctx.socket(zmq.PULL)
        sub_sock.connect(f"tcp://127.0.0.1:{str(3003)}")
        

        try:
            while True:
                img = sub_sock.recv()
                print("Received image", img)
                # with self.image_lock:
                #     img_id = img[0]
                #     if img_id in self.image_dict:
                #         self.latencies_image.append(time.time() - self.image_dict[img_id])
                #         print("For id {}, image latency: {}".format(img_id, self.latencies_image[-1]))
                #         # del self.image_dict[img_id]
                #         avg_latency = sum(self.latencies_image) / len(self.latencies_image)
                #         print("Average image latency: {}".format(avg_latency))
                #     else:
                #         print("Received unknown id: {}".format(img_id))
        except KeyboardInterrupt:
            pass    

if __name__=="__main__":
    client = StretchBodyZMQCLient("localhost", 3000)
    
    # Start the publisher and subscriber threads
    publisher_thread = threading.Thread(target=client.run_publisher)
    subscriber_thread = threading.Thread(target=client.run_subscriber)
    publisher_thread.start()
    subscriber_thread.start()

    # Start the image publisher and subscriber threads
    image_publisher_thread = threading.Thread(target=client.runImagePublisher)
    image_subscriber_thread = threading.Thread(target=client.runImageSubscriber)
    image_publisher_thread.start()
    image_subscriber_thread.start()

    # Wait for the threads to finish
    publisher_thread.join()
    subscriber_thread.join()
    image_publisher_thread.join()
    image_subscriber_thread.join()
