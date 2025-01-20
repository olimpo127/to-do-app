import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { firestore } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  VStack,
  Box,
  Button,
  Input,
  Heading,
  Text,
  Checkbox,
  Stack,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Wrap,
  WrapItem 
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";

const ToDoList = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState(""); // State for new category
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditingId, setIsEditingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(""); // Filtro de categoría
  const [startDateFilter, setStartDateFilter] = useState(""); // Fecha de inicio
  const [endDateFilter, setEndDateFilter] = useState(""); // Fecha de fin
  const [editTaskData, setEditTaskData] = useState({
    task: "",
    description: "",
    category: "",
    date: "",
    time: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      const fetchUserData = async () => {
        try {
          const userDoc = doc(firestore, "users", user.uid);
          const userSnap = await getDoc(userDoc);
          if (userSnap.exists()) {
            setTasks(userSnap.data().tasks || []);
            setCategories(userSnap.data().categories || []);
          }
        } catch (error) {
          console.error("Error fetching tasks: ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [user, navigate]);

  const addTask = async () => {
    if (task.trim() === "") return;

    const newTask = {
      id: Date.now(),
      task,
      description,
      category,
      date,
      time,
      checkbox: false,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    clearInputFields();

    const userDoc = doc(firestore, "users", user.uid);
    await updateDoc(userDoc, { tasks: updatedTasks });
  };

  const clearInputFields = () => {
    setTask("");
    setDescription("");
    setCategory("");
    setDate("");
    setTime("");
    setIsEditingId(null);
  };

  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Santiago" })
  );
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayTasks = tasks
    .filter((taskItem) => {
      const taskDate = new Date(`${taskItem.date}T${taskItem.time || "00:00"}`);
      return (
        taskDate.getFullYear() === today.getFullYear() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getDate() === today.getDate()
      );
    })
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || "00:00"}`);
      const bTime = new Date(`${b.date}T${b.time || "00:00"}`);

      return aTime - bTime || a.category.localeCompare(b.category);
    });

  const tomorrowTasks = tasks
    .filter((taskItem) => {
      const taskDate = new Date(`${taskItem.date}T${taskItem.time || "00:00"}`);
      return (
        taskDate.getFullYear() === tomorrow.getFullYear() &&
        taskDate.getMonth() === tomorrow.getMonth() &&
        taskDate.getDate() === tomorrow.getDate()
      );
    })
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || "00:00"}`);
      const bTime = new Date(`${b.date}T${b.time || "00:00"}`);

      return aTime - bTime || a.category.localeCompare(b.category);
    });
  // New Function to Add Category
  const addCategory = async () => {
    if (newCategory.trim() === "") return;

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setNewCategory("");

    const userDoc = doc(firestore, "users", user.uid);
    await updateDoc(userDoc, { categories: updatedCategories });
  };

  const deleteCategory = async (categoryToDelete) => {
    const updatedCategories = categories.filter(
      (cat) => cat !== categoryToDelete
    );
    setCategories(updatedCategories);

    const userDoc = doc(firestore, "users", user.uid);
    await updateDoc(userDoc, { categories: updatedCategories });
  };

  const toggleTaskCompletion = async (taskId) => {
    const updatedTasks = tasks.map((taskItem) =>
      taskItem.id === taskId
        ? { ...taskItem, checkbox: !taskItem.checkbox }
        : taskItem
    );

    setTasks(updatedTasks);

    const userDoc = doc(firestore, "users", user.uid);
    await updateDoc(userDoc, { tasks: updatedTasks });
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter((taskItem) => taskItem.id !== taskId);
    setTasks(updatedTasks);

    const userDoc = doc(firestore, "users", user.uid);
    await updateDoc(userDoc, { tasks: updatedTasks });
  };

  const restTasks = tasks
    .filter((taskItem) => {
      const taskDate = new Date(`${taskItem.date}T${taskItem.time || "00:00"}`);
      return taskDate > tomorrow;
    })
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || "00:00"}`);
      const bTime = new Date(`${b.date}T${b.time || "00:00"}`);

      return aTime - bTime || a.category.localeCompare(b.category);
    });

  const filteredRestTasks = restTasks
    .filter((taskItem) => {
      const taskDate = new Date(`${taskItem.date}T${taskItem.time || "00:00"}`);

      // Filtro de categoría
      const matchesCategory =
        !categoryFilter || taskItem.category === categoryFilter;

      // Filtro de rango de fechas
      const matchesDateRange =
        (!startDateFilter || taskDate >= new Date(startDateFilter)) &&
        (!endDateFilter || taskDate <= new Date(endDateFilter));

      return matchesCategory && matchesDateRange;
    })
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || "00:00"}`);
      const bTime = new Date(`${b.date}T${b.time || "00:00"}`);
      return aTime - bTime || a.category.localeCompare(b.category);
    });

  const startEditing = (taskId) => {
    const taskToEdit = tasks.find((taskItem) => taskItem.id === taskId);
    if (taskToEdit) {
      setIsEditingId(taskId);
      setEditTaskData({
        task: taskToEdit.task,
        description: taskToEdit.description,
        category: taskToEdit.category,
        date: taskToEdit.date,
        time: taskToEdit.time,
      });
      onEditOpen();
    }
  };

  const editTask = async () => {
    if (isEditingId === null) return;

    const updatedTask = {
      id: isEditingId,
      task: editTaskData.task,
      description: editTaskData.description,
      category: editTaskData.category,
      date: editTaskData.date,
      time: editTaskData.time,
      checkbox: tasks.find((taskItem) => taskItem.id === isEditingId).checkbox,
    };

    const updatedTasks = tasks.map((taskItem) =>
      taskItem.id === isEditingId ? updatedTask : taskItem
    );

    setTasks(updatedTasks);

    const userDoc = doc(firestore, "users", user.uid);
    await updateDoc(userDoc, { tasks: updatedTasks });

    setEditTaskData({
      task: "",
      description: "",
      category: "",
      date: "",
      time: "",
    });
    setIsEditingId(null);
    onEditClose();
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <VStack spacing={4} padding={4}>
      <Navbar />
      <Heading>My To-Do List</Heading>

      {/* Add Category Button */}
      <Button colorScheme="teal" onClick={onOpen} marginBottom={10}>
        Manage Categories
      </Button>

      {/* Modal for adding new category */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Categories</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              mb={4}
            />

            {/* List of existing categories with delete buttons */}
            {categories.map((cat, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <Text flex="1">{cat}</Text>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => deleteCategory(cat)}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={() => {
                addCategory();
                onClose();
              }}
            >
              Add Category
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for editing a task */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Task"
              value={editTaskData.task}
              onChange={(e) =>
                setEditTaskData((prev) => ({ ...prev, task: e.target.value }))
              }
              mb={3}
            />
            <Input
              placeholder="Description"
              value={editTaskData.description}
              onChange={(e) =>
                setEditTaskData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              mb={3}
            />
            <Select
              placeholder="Select category"
              value={editTaskData.category}
              onChange={(e) =>
                setEditTaskData((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              mb={3}
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={editTaskData.date}
              onChange={(e) =>
                setEditTaskData((prev) => ({ ...prev, date: e.target.value }))
              }
              mb={3}
            />
            <Input
              type="time"
              value={editTaskData.time}
              onChange={(e) =>
                setEditTaskData((prev) => ({ ...prev, time: e.target.value }))
              }
              mb={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={editTask}>
              Update Task
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Heading size="lg">Today's Tasks</Heading>
{todayTasks.length > 0 ? (
  <Wrap spacing={4} justify="start" width="100%">
    {todayTasks.map((taskItem) => (
      <WrapItem key={taskItem.id}>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          padding={4}
          bg={taskItem.checkbox ? "green.200" : "white"}
          width="100%"
          minWidth="250px"
        >
          <Heading size="md">{taskItem.task}</Heading>
          <Text>{taskItem.description}</Text>
          <Heading size="sm">{taskItem.category}</Heading>
          <Text>{taskItem.date}</Text>
          <Text>{taskItem.time || "Sin tiempo"}</Text>
          <Stack direction="row" alignItems="center">
            <Checkbox
              isChecked={taskItem.checkbox}
              onChange={() => toggleTaskCompletion(taskItem.id)}
            >
              Status
            </Checkbox>
            <Button
              colorScheme="yellow"
              onClick={() => startEditing(taskItem.id)}
            >
              Edit
            </Button>
            <Button colorScheme="red" onClick={() => deleteTask(taskItem.id)}>
              Delete
            </Button>
          </Stack>
        </Box>
      </WrapItem>
    ))}
  </Wrap>
) : (
  <Box>No tasks for today.</Box>
)}



      {/* Input fields for the task */}
      <Box
        display={"flex"}
        flexDir={"column"}
        padding={5}
        marginBottom={10}
        marginTop={10}
        sx={{
          position: "relative",
          "::before": {
            content: '""',
            position: "absolute",
            top: "-2px", // Move the line slightly above
            left: "-2px", // Move the line slightly to the left
            right: "-2px", // Extend the line slightly to the right
            bottom: "-2px", // Extend the line slightly below
            border: "2px solid black", // Define the thickness and color of the exterior border
            borderRadius: "md", // Adjust as needed for rounded corners
            pointerEvents: "none", // Makes sure the pseudo-element doesn’t affect interaction
          },
        }}
      >
        <Heading marginBottom={7}>Crear una nueva tarea</Heading>
        <Input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Task"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task Description and/or Location"
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
          placeholder="Due Date"
        />
        <Input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          type="time"
          placeholder="Time"
        />
        <Button onClick={addTask} colorScheme="teal" marginTop={8}>
          Add Task
        </Button>
      </Box>

      {/* Tomorrow's Tasks */}
      <Heading size="lg">Tomorrow's Tasks</Heading>
{tomorrowTasks.length > 0 ? (
  <Wrap spacing={4}>
    {tomorrowTasks.map((taskItem) => (
      <WrapItem key={taskItem.id}>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          padding={4}
          marginBottom={4}
          bg={taskItem.checkbox ? "green.200" : "white"}
        >
          <Heading size="md">{taskItem.task}</Heading>
          <Text>{taskItem.description}</Text>
          <Heading size="sm">{taskItem.category}</Heading>
          <Text>{taskItem.date}</Text>
          <Text>{taskItem.time || "Sin tiempo"}</Text>
          <Stack direction="row" alignItems="center">
            <Checkbox
              isChecked={taskItem.checkbox}
              onChange={() => toggleTaskCompletion(taskItem.id)}
            >
              Status
            </Checkbox>
            <Button
              colorScheme="yellow"
              onClick={() => startEditing(taskItem.id)}
            >
              Edit
            </Button>
            <Button colorScheme="red" onClick={() => deleteTask(taskItem.id)}>
              Delete
            </Button>
          </Stack>
        </Box>
      </WrapItem>
    ))}
  </Wrap>
) : (
  <Box>No tasks for tomorrow.</Box>
)}

      {/* Upcoming Tasks */}
      <Heading size="lg">Upcoming Tasks</Heading>
      {/* Controles de Filtro */}
      <Box>
        <Select
          placeholder="All categories"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          placeholder="Start Date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
        />
        <Input
          type="date"
          placeholder="End Date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
        />
      </Box>

      {filteredRestTasks.length > 0 ? (
        filteredRestTasks.map((taskItem) => (
          <Box
            key={taskItem.id}
            borderWidth="1px"
            borderRadius="lg"
            padding={4}
            marginBottom={4}
            bg={taskItem.checkbox ? "green.200" : "white"}
          >
            <Heading size="md">{taskItem.task}</Heading>
            <Text>{taskItem.description}</Text>
            <Heading size="sm">{taskItem.category}</Heading>
            <Text>{taskItem.date}</Text>
            <Text>{taskItem.time || "Sin hora fijada"}</Text>
            <Stack direction="row" alignItems="center">
              <Checkbox
                isChecked={taskItem.checkbox}
                onChange={() => toggleTaskCompletion(taskItem.id)}
              >
                Status
              </Checkbox>
              <Button
                colorScheme="yellow"
                onClick={() => startEditing(taskItem.id)}
              >
                Edit
              </Button>
              <Button colorScheme="red" onClick={() => deleteTask(taskItem.id)}>
                Delete
              </Button>
            </Stack>
          </Box>
        ))
      ) : (
        <Box>No upcoming tasks.</Box>
      )}
    </VStack>
  );
};

export default ToDoList;
