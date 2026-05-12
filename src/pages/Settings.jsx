import { useEffect, useState } from "react";
import { FiLock, FiSave, FiUser } from "react-icons/fi";
import AppLayout from "../layouts/AppLayout";
import {
  getProfile,
  updatePassword,
  updateProfile,
} from "../services/userService";
import "../styles/PageForms.css";

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    fallback
  );
}

function Settings() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await getProfile();
      const user = res.data?.data;
      setProfile(user);
      setProfileForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Profile could not be loaded."),
      });
    } finally {
      setLoading(false);
    }
  }

  function updateProfileField(name, value) {
    setProfileForm((current) => ({ ...current, [name]: value }));
    setMessage(null);
  }

  function updatePasswordField(name, value) {
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setMessage(null);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) return;

    setSavingProfile(true);
    try {
      const res = await updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
      });
      const updatedUser = res.data?.data;
      setProfile(updatedUser);
      updateStoredUser(updatedUser);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Profile could not be updated."),
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New password confirmation does not match." });
      return;
    }

    setSavingPassword(true);
    try {
      await updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Password could not be updated."),
      });
    } finally {
      setSavingPassword(false);
    }
  }

  const profileDisabled =
    !profileForm.firstName.trim() ||
    !profileForm.lastName.trim() ||
    savingProfile;
  const passwordDisabled =
    !passwordForm.oldPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword ||
    savingPassword;

  return (
    <AppLayout>
      <div className="service-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile settings.</p>
        </div>
      </div>

      {message && (
        <div className={`service-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="service-grid">
        <section className="service-panel">
          <div className="service-panel-header">
            <div>
              <h2>Profile</h2>
              <p>Update your first and last name.</p>
            </div>
            <FiUser size={20} />
          </div>

          {loading ? (
            <div className="service-empty">Loading profile...</div>
          ) : (
            <form className="service-form" onSubmit={handleProfileSubmit}>
              <div className="service-form-grid">
                <div className="service-field">
                  <label htmlFor="settings-first-name">First name</label>
                  <input
                    id="settings-first-name"
                    type="text"
                    value={profileForm.firstName}
                    onChange={(event) =>
                      updateProfileField("firstName", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="service-field">
                  <label htmlFor="settings-last-name">Last name</label>
                  <input
                    id="settings-last-name"
                    type="text"
                    value={profileForm.lastName}
                    onChange={(event) =>
                      updateProfileField("lastName", event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="service-meta">
                <span>Email</span>
                <strong>{profile?.email || "-"}</strong>
              </div>
              <div className="service-meta">
                <span>Role</span>
                <strong>{profile?.role?.name || "-"}</strong>
              </div>

              <div className="service-actions">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={profileDisabled}
                >
                  <FiSave size={16} />
                  {savingProfile ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="service-panel">
          <div className="service-panel-header">
            <div>
              <h2>Password</h2>
              <p>Change your password securely.</p>
            </div>
            <FiLock size={20} />
          </div>

          <form className="service-form" onSubmit={handlePasswordSubmit}>
            <div className="service-field">
              <label htmlFor="settings-old-password">Current password</label>
              <input
                id="settings-old-password"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) =>
                  updatePasswordField("oldPassword", event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>

            <div className="service-field">
              <label htmlFor="settings-new-password">New password</label>
              <input
                id="settings-new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <div className="service-field">
              <label htmlFor="settings-confirm-password">Confirm new password</label>
              <input
                id="settings-confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <div className="service-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={passwordDisabled}
              >
                <FiLock size={16} />
                {savingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

function updateStoredUser(updatedUser) {
  if (!updatedUser) return;

  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  try {
    localStorage.setItem(
      "user",
      JSON.stringify({ ...JSON.parse(storedUser), ...updatedUser })
    );
  } catch {
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }
}

export default Settings;
