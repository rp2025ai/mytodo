import { exportTodosAsPDF, Todo } from "./utils/pdf";
import { getCurrentUser, logIn, logOut, signUp, todosKey } from "./utils/auth";
import { useEffect, useMemo, useState } from "react";
import "./App.css";

export default function App() {
  // Auth state
  const [username, setUsername] = useState<string | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const isLoggedIn = useMemo(() => !!username, [username]);


  // Todo state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);


  // Load current user on mount
  useEffect(() => {
    const cu = getCurrentUser();
    if (cu) setUsername(cu);
  }, []);


  // Load todos when username changes
  useEffect(() => {
    if (!username) return;
    try {
      const raw = localStorage.getItem(todosKey(username));
      setTodos(raw ? JSON.parse(raw) : []);
    } catch {
      setTodos([]);
    }
  }, [username]);


  // Persist todos per user
  useEffect(() => {
    if (!username) return;
    localStorage.setItem(todosKey(username), JSON.stringify(todos));
  }, [username, todos]);


  // CRUD handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;


    if (editingId) {
      setTodos((prev) => prev.map((t) => (t.id === editingId ? { ...t, title, description } : t)));
      setEditingId(null);
    } else {
      setTodos((prev) => [...prev, { id: Date.now(), title, description }]);
    }


    setTitle("");
    setDescription("");
  };


  const handleDelete = (id: number) => setTodos((prev) => prev.filter((t) => t.id !== id));
  const handleEdit = (todo: Todo) => {
    setTitle(todo.title);
    setDescription(todo.description || "");
    setEditingId(todo.id);
  };


  // Share
  const handleShare = () => {
    const text = todos.map((t) => `• ${t.title}: ${t.description || "—"}`).join("\n");
    if ((navigator as any).share) {
      (navigator as any).share({ title: `Todos of ${username}`, text }).catch(() => { });
    } else {
      alert("Web Share API not supported in this browser.");
    }
  };


  // Auth actions
  const onSignUp = async () => {
    setAuthError(null);
    if (!loginUser.trim() || !loginPass) {
      setAuthError("Enter username and password");
      return;
    }
    const res = await signUp(loginUser.trim(), loginPass);
    if (res === "ok") {
      setUsername(loginUser.trim());
      setLoginPass("");
    } else setAuthError(res);
  };


  const onLogIn = async () => {
    setAuthError(null);
    if (!loginUser.trim() || !loginPass) {
      setAuthError("Enter username and password");
      return;
    }
    const res = await logIn(loginUser.trim(), loginPass);
    if (res === "ok") {
      setUsername(loginUser.trim());
      setLoginPass("");
    } else setAuthError(res);
  };


  const onLogOut = () => {
    logOut();
    setUsername(null);
    setTodos([]);
    setTitle("");
    setDescription("");
    setEditingId(null);
  };
  if (!isLoggedIn) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Login / Sign Up</h2>
          <input
            placeholder="Username"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
          />
          {authError && <div className="error">{authError}</div>}
          <div className="row">
            <button onClick={onLogIn}>Log In</button>
            <button onClick={onSignUp} className="secondary">Sign Up</button>
          </div>
          <p className="hint">Passwords are stored as SHA‑256 hashes in your browser's localStorage. Do not use a real password.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="app">
      {/* Form Section */}
      <div className="form-section">
        <div className="topbar">
          <h2>{editingId ? "Edit Todo" : "Add Todo"}</h2>
          <div className="user">👤 {username}</div>
        </div>
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
          <button type="submit">{editingId ? "Update" : "Add"}</button>
        </form>
        <div className="actions">
          <button onClick={() => exportTodosAsPDF(username!, todos)}>Download PDF</button>
          <button onClick={handleShare}>Share</button>
          <button onClick={onLogOut} className="danger">Logout</button>
        </div>
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
                <div className="todo-actions">
                  <button onClick={() => handleEdit(todo)}>Edit</button>
                  <button onClick={() => handleDelete(todo.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}