import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Button, Textarea } from "flowbite-react";

const Comment = ({ comment, onLike, onEdit }) => {
  const [userComment, setUserComment] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/user/${comment.userId}`);
        const data = await res.json();
        if (res.ok) {
          setUserComment(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getUser();
  }, [comment]);

  const handleEdit = async () => {
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
      <div className="flex-shrink-0 mr-3">
        <img
          src={userComment.image}
          alt={userComment.username}
          className="w-10 h-10 rounded-full bg-gray-200"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-bold mr-1 text-xs truncate">
            {userComment ? `@${userComment.username}` : "Anomyous User"}
          </span>
          <span className="text-gray-500 text-xs">{moment(comment.createdAt).fromNow()}</span>
        </div>
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              className="mb-2"
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 text-xs">
              <Button type="button" size="sm" gradientDuoTone="purpleToBlue" onClick={handleSave}>
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                gradientDuoTone="purpleToBlue"
                outline
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 pb-2">{comment.content}</p>
            <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
              <button
                type="button"
                className={`text-gray-400 hover:text-blue-500 ${
                  user.currentUser &&
                  comment.likes.includes(user.currentUser._id) &&
                  "!text-blue-500"
                }`}
                onClick={() => onLike(comment._id)}
              >
                <FaThumbsUp className="text-sm" />
              </button>
              <p>
                {comment.numberOfLikes > 0 &&
                  comment.numberOfLikes + " " + (comment.numberOfLikes === 1 ? "like" : "likes")}
              </p>
              {user.currentUser &&
                (user.currentUser._id === comment.userId || user.currentUser.isAdmin) && (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-blue-500"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;
