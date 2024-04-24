#!/usr/bin/env python3
import math
import sys
import time

import cv2
import numpy as np

import orbslam3

class StretchSlam():
    def __init__(self, vocab_path, settings_path, camera_index=6):
        self.slam = orbslam3.System(vocab_path, settings_path, orbslam3.Sensor.MONOCULAR)
        self.slam.set_use_viewer(True)
        self.camera_index = int(camera_index)
        self.video_capture = None

    def initialize(self):
        self.slam.initialize()
        self.video_capture = cv2.VideoCapture(6)
        # self.video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        # self.video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    def run(self):
        if not self.slam.is_running() or self.video_capture is None:
            print("[ERROR] SLAM is not initialized. Call StretchSlam.initialize() first.")
            return

        while self.video_capture.isOpened():
            timestamp = time.time()
            # print(timestamp)
            ret, frame = self.video_capture.read()

            if not ret or frame is None:
                print(f"[ERROR] Failed to read camera device ({self.camera_index}).")
                continue

            # print(frame.shape)
            self.slam.process_image_mono(frame, timestamp)

            trajectory = self.slam.get_trajectory_points()
            if len(trajectory) < 1:
                continue
            latest_frame = trajectory[-1]

            # Extract timestamp and quaternion
            timestamp = latest_frame[0]
            q = np.array([latest_frame[4], latest_frame[5], latest_frame[6], latest_frame[7]])
            
            # Extract translation vector
            twc = np.array([latest_frame[1], latest_frame[2], latest_frame[3]])
            
            # Compute Euler angles
            q /= np.linalg.norm(q)  # Normalize quaternion

            # Extract quaternion components
            w, x, y, z = q

            # Roll (x-axis rotation)
            roll = np.arctan2(2 * (w * x + y * z), 1 - 2 * (x**2 + y**2))

            # Pitch (y-axis rotation)
            sin_pitch = 2 * (w * y - z * x)
            if np.abs(sin_pitch) >= 1:
                pitch = np.sign(sin_pitch) * np.pi / 2
            else:
                pitch = np.arcsin(sin_pitch)

            # Yaw (z-axis rotation)
            yaw = np.arctan2(2 * (w * z + x * y), 1 - 2 * (y**2 + z**2))
            
            # Print timestamp, XYZ coordinates, and Euler angles
            print(f"[INFO] timestamp: {timestamp}, translation (x, y, z): {twc}, rotation (rpy): [{roll, pitch, yaw}]")

            if time.time() - timestamp < 0.1:
                time.sleep(0.1 - (time.time() - timestamp))

def main():
    slam = StretchSlam(sys.argv[1], sys.argv[2], sys.argv[3])
    slam.initialize()
    slam.run()

if __name__=="__main__":
    main()
