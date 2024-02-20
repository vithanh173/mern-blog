import { Alert, Button, Modal, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import { Zoom, toast } from "react-toastify";

import "react-circular-progressbar/dist/styles.css";
import { app } from "../firebase";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteFailure,
  deleteStart,
  deleteSuccess,
  signoutSuccess,
} from "../redux/user/userSlice";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const DashboardProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [progress, setProgress] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const filePickerRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    const storage = getStorage(app);
    const fileName = imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress.toFixed(0));
      },
      (error) => {
        setError("Could not upload image (file must be less than 2MB)");
        setProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setImageFileUrl(downloadUrl);
          setFormData({ ...formData, image: downloadUrl });
          setImageUploading(false);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) {
      toast.info("No changes made");
      return;
    }
    if (imageUploading) {
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${user.currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        toast.error(data.message, {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
      } else {
        dispatch(updateSuccess(data));
        toast.success("Update successfully", {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        draggable: true,
        transition: Zoom,
      });
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteStart());
      const res = await fetch(`/api/user/delete/${user.currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteFailure(data.message));
        toast.error(data.message, {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
      } else {
        dispatch(deleteSuccess(data));
        toast.success("Delete successfully", {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
      }
    } catch (error) {
      dispatch(deleteFailure(error.message));
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        draggable: true,
        transition: Zoom,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message, {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        draggable: true,
        transition: Zoom,
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {progress && (
            <CircularProgressbar
              value={progress || 0}
              text={`${progress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${progress / 100})`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || user.currentUser.image}
            alt="User Image"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              progress && progress < 100 && "opacity-60"
            }`}
          />
        </div>
        {error && <Alert color="failure">{error}</Alert>}
        <TextInput
          type="text"
          id="username"
          placeholder="Username"
          defaultValue={user.currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="Email"
          defaultValue={user.currentUser.email}
          onChange={handleChange}
        />
        <TextInput type="password" id="password" placeholder="Password" onChange={handleChange} />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span className="cursor-pointer" onClick={() => setShowModal(true)}>
          Delete Account
        </span>
        <span className="cursor-pointer" onClick={handleSignOut}>
          Sign Out
        </span>
      </div>
      <Modal show={showModal} popup size="md" onClose={() => setShowModal(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardProfile;
