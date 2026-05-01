import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {PrivacyPolicy, Tasks, Dashboard, Inbox, Login, ResetPassword, Register, Board, Projects, 
        Team, Reports, Settings, CreateIssue, BackLog, Sprint, TaskDetail, ProjectDetail, Timeline, 
        Calendar, Forms, Goals, Development, Archive, Pages, Scope, Code} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/board" element={<Board />} />
        <Route path="/team" element={<Team />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-issue" element={<CreateIssue />} />
        <Route path="/backlog" element={<BackLog />} />
        <Route path="/sprint" element={<Sprint />} />
        <Route path="/task-details" element={<TaskDetail />} />
        <Route path="/project-detail" element={<ProjectDetail />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/development" element={<Development />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/pages" element={<Pages />} />
        <Route path="/scope" element={<Scope />} />
        <Route path="/code" element={<Code />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;