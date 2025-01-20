import React, { useState } from "react";
import { Button, Input, Select, Stack } from "@chakra-ui/react";

const EditTask = ({ taskData, categories, onSave, onCancel }) => {
  const [task, setTask] = useState(taskData.task);
  const [description, setDescription] = useState(taskData.description);
  const [category, setCategory] = useState(taskData.category);
  const [date, setDate] = useState(taskData.date);
  const [time, setTime] = useState(taskData.time);

  const handleSave = () => {
    const updatedTask = {
      ...taskData,
      task,
      description,
      category,
      date,
      time,
    };
    onSave(updatedTask); // Call the onSave function and pass the updated task data
  };

  return (
    <Stack spacing={3}>
      <Input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Task Title"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
      />
      <Select
        placeholder="Select category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((cat, index) => (
          <option key={index} value={cat}>
            {cat}
          </option>
        ))}
      </Select>
      <Input
        value={date}
        onChange={(e) => setDate(e.target.value)}
        type="date"
      />
      <Input
        value={time}
        onChange={(e) => setTime(e.target.value)}
        type="time"
      />
      <Stack direction="row" spacing={3}>
        <Button colorScheme="blue" onClick={handleSave}>
          Save
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Stack>
    </Stack>
  );
};

export default EditTask;
