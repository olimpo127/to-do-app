import React from "react";
import { Button } from "@chakra-ui/react";

const DeleteTask = ({ taskIndex, onDelete }) => {
  const handleDelete = () => {
    onDelete(taskIndex); // Call the onDelete function and pass the task index
  };

  return (
    <Button colorScheme="red" onClick={handleDelete}>
      Delete
    </Button>
  );
};

export default DeleteTask;
