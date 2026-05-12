import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

import {
  Dashboard, Inbox, Login, ResetPassword, Register,
  Board, Projects, Team, Reports, Settings, CreateIssue,
  BackLog, Sprint, TaskDetail, ProjectDetail, Timeline,
  Calendar, Forms, Goals, Development, Archive, Pages,
  Scope, Code, Tasks
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/board" element={<Board />} />
          <Route path="/team" element={<Team />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-issue" element={<CreateIssue />} />
          <Route path="/backlog" element={<BackLog />} />
          <Route path="/sprint" element={<Sprint />} />
          <Route path="/task-details/:id" element={<TaskDetail />} />
          <Route path="/project-detail" element={<ProjectDetail />} />
          <Route path="/project-detail/:id" element={<ProjectDetail />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/development" element={<Development />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/scope" element={<Scope />} />
          <Route path="/code" element={<Code />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
