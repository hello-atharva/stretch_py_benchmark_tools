import cv2
import numpy as np
import argparse

class FisheyeUndistort:
    def __init__(self, dim=(1280, 720), K=None, D=None):
        self.DIM = dim
        self.K = K or np.array([[516.0520775635061, 0.0, 693.0236429705749],
                                 [0.0, 516.0108909359323, 329.25202523213096],
                                 [0.0, 0.0, 1.0]])
        self.D = D or np.array([[-0.01386781228070666],
                                 [-0.0008223814224284043],
                                 [-0.0018500545179076487],
                                 [0.0003565970275021436]])

    def undistort(self, img_path):
        img = cv2.imread(img_path)
        h, w = img.shape[:2]
        map1, map2 = cv2.fisheye.initUndistortRectifyMap(self.K, self.D, np.eye(3), self.K, self.DIM, cv2.CV_16SC2)
        undistorted_img = cv2.remap(img, map1, map2, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
        output_path = img_path.replace("images", "undistorted")
        cv2.imwrite(output_path, undistorted_img)
        cv2.imshow("undistorted", undistorted_img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fisheye Image Undistortion')
    parser.add_argument('--image', type=str, help='Path to the image for undistortion')
    parser.add_argument('--K', type=float, nargs='+', help='Intrinsic matrix K')
    parser.add_argument('--D', type=float, nargs='+', help='Distortion coefficients D')
    args = parser.parse_args()

    K = np.array(args.K).reshape(3, 3) if args.K else None
    D = np.array(args.D).reshape(-1, 1) if args.D else None

    undistorter = FisheyeUndistort(K=K, D=D)
    undistorter.undistort(args.image)
