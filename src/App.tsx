import { useState } from "react";
import "./App.css";

interface Todo {
  id: number;
  title: string;
  description: string;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      title,
      description,
    };

    setTodos([...todos, newTodo]);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="app">
      {/* Form Section */}
      <div className="form-section">
        <h2>Add a Todo</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo Title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Todo Description"
          />
          <button type="submit">Add Todo</button>
        </form>
      </div>

      {/* List Section */}
      <div className="list-section">
        <h2>Your Todos</h2>
        {todos.length === 0 ? (
          <p>No todos yet. Add one!</p>
        ) : (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                <h3>{todo.title}</h3>
                <p>{todo.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
