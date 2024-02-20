import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import { CircularProgressbar } from "react-circular-progressbar";
import { FaTrashAlt } from "react-icons/fa";

import { app } from "../firebase";
import "react-quill/dist/quill.snow.css";

const CreatePost = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setError("Please select an image");
        return;
      }
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress.toFixed(0));
        },
        (error) => {
          setError("Image upload failed");
          setProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            setError(null);
            setProgress(null);
            setFormData({ ...formData, image: downloadUrl });
          });
        }
      );
    } catch (error) {
      setError("Image upload failed");
      setProgress(null);
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        draggable: true,
        transition: Zoom,
      });
    }
  };

  const handleDeleteImage = () => {
    setFormData({ ...formData, image: "" });
    const storage = getStorage(app);
    const storageRef = ref(storage, formData.image);
    deleteObject(storageRef)
      .then(console.log("Delete successfully!"))
      .catch((error) => console.log(error));
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput type="text" placeholder="Title" id="title" required className="flex-1" />
          <Select>
            <option value="uncategorized">Select a category</option>
            <option value="techology">Technology</option>
            <option value="healthandlifestyle">Health and lifestyle</option>
            <option value="tourism">Tourism</option>
            <option value="nature">Nature</option>
            <option value="history">History</option>
            <option value="geography">Geography</option>
            <option value="game">Game</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            disabled={progress}
            onClick={handleUploadImage}
          >
            {progress ? (
              <div className="w-16 h-16">
                <CircularProgressbar value={progress} text={`${progress || 0}%`} />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {error && <Alert color="failure">{error}</Alert>}
        {formData.image && (
          <div className="relative">
            <img src={formData.image} alt="Blog Image" className="w-full h-72 object-cover" />
            <Button
              color="failure"
              gradientMonochrome="failure"
              size="xs"
              outline
              className="absolute top-1 right-1"
              onClick={handleDeleteImage}
            >
              <FaTrashAlt size={30} color="black" />
            </Button>
          </div>
        )}
        <ReactQuill theme="snow" placeholder="Write something..." className="h-72 mb-12" />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
