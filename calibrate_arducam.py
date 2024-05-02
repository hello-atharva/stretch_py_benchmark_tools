import cv2
import numpy as np
import os
import glob
import argparse

class FishEyeCalibration:
    def __init__(self, checkerboard=(8, 5)):
        self.checkerboard = checkerboard
        self.subpix_criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.1)
        self.calibration_flags = cv2.fisheye.CALIB_RECOMPUTE_EXTRINSIC + cv2.fisheye.CALIB_CHECK_COND + cv2.fisheye.CALIB_FIX_SKEW
        self.objp = np.zeros((1, checkerboard[0] * checkerboard[1], 3), np.float32)
        self.objp[0, :, :2] = np.mgrid[0:checkerboard[0], 0:checkerboard[1]].T.reshape(-1, 2)
        self._img_shape = None
        self.objpoints = []  # 3d point in real world space
        self.imgpoints = []  # 2d points in image plane.

    def find_chessboard_corners(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        ret, corners = cv2.findChessboardCorners(gray, self.checkerboard, cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_FAST_CHECK + cv2.CALIB_CB_NORMALIZE_IMAGE)
        if ret:
            self.objpoints.append(self.objp)
            cv2.cornerSubPix(gray, corners, (3, 3), (-1, -1), self.subpix_criteria)
            self.imgpoints.append(corners)

    def calibrate(self):
        images = glob.glob('images/*.png')
        for fname in images:
            img = cv2.imread(fname)
            if self._img_shape is None:
                self._img_shape = img.shape[:2]
            else:
                assert self._img_shape == img.shape[:2], "All images must share the same size."
            self.find_chessboard_corners(img)

        N_OK = len(self.objpoints)
        K = np.zeros((3, 3))
        D = np.zeros((4, 1))
        rvecs = [np.zeros((1, 1, 3), dtype=np.float64) for _ in range(N_OK)]
        tvecs = [np.zeros((1, 1, 3), dtype=np.float64) for _ in range(N_OK)]
        rms, _, _, _, _ = \
            cv2.fisheye.calibrate(
                self.objpoints,
                self.imgpoints,
                self._img_shape[::-1],
                K,
                D,
                rvecs,
                tvecs,
                self.calibration_flags,
                (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1e-6)
            )

        print("Found " + str(N_OK) + " valid images for calibration")
        print("DIM=" + str(self._img_shape[::-1]))
        print("K=np.array(" + str(K.tolist()) + ")")
        print("D=np.array(" + str(D.tolist()) + ")")

        fx = K[0, 0]
        fy = K[1, 1]
        cx = K[0, 2]
        cy = K[1, 2]
        k1 = D[0, 0]
        k2 = D[1, 0]
        k3 = D[2, 0]
        k4 = D[3, 0]

        print("fx:", fx)
        print("fy:", fy)
        print("cx:", cx)
        print("cy:", cy)
        print("k1:", k1)
        print("k2:", k2)
        print("k3:", k3)
        print("k4:", k4)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fisheye Calibration')
    parser.add_argument('--checkerboard', type=int, nargs=2, default=(8, 5), help='Checkerboard dimensions')
    args = parser.parse_args()

    calibration = FishEyeCalibration(checkerboard=args.checkerboard)
    calibration.calibrate()
