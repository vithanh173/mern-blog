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
import { Zoom, toast } from "react-toastify";

import { app } from "../firebase";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message, {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
        return;
      } else {
        toast.success("Post is created", {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
        navigate(`/post/${data.slug}`);
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
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            id="title"
            required
            className="flex-1"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            <option value="Uncategorized">Select a category</option>
            <option value="Techology">Technology</option>
            <option value="Health and lifestyle">Health and lifestyle</option>
            <option value="Tourism">Tourism</option>
            <option value="Nature">Nature</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
            <option value="Game">Game</option>
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
        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
