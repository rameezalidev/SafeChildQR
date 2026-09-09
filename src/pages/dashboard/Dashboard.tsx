import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { toast } from 'react-hot-toast';

type Child = {
  name: string;
  age: string;
  gender: string;
  info: string;
};

function Dashboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<{ email?: string; children?: Child[] } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  });

  const [userData, setUserData] = useState<Child[]>(() => currentUser?.children || []);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setUserData(parsedUser.children || []);
    } catch {
      localStorage.removeItem('currentUser');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  function syncChildren(nextChildren: Child[]) {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((user: { email?: string; children?: Child[] }) =>
      user.email?.toLowerCase() === currentUser.email?.toLowerCase()
        ? { ...user, children: nextChildren }
        : user
    );

    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedUser = { ...currentUser, children: nextChildren };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setUserData(nextChildren);
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      age: '',
      gender: '',
      info: '',
    },

    validate: (values) => {
      const errors: {
        name?: string;
        age?: string;
        gender?: string;
        info?: string;
      } = {};

      if (!values.name.trim()) {
        errors.name = 'Name is required';
      } else if (values.name.trim().length < 3) {
        errors.name = 'Name must be at least 3 characters';
      }

      if (!values.age) {
        errors.age = 'Age is required';
      } else if (Number(values.age) < 1) {
        errors.age = 'Age must be at least 1';
      } else if (Number(values.age) > 18) {
        errors.age = 'Age must be 18 or below';
      }



      if (!values.info.trim()) {
        errors.info = 'Information is required';
      } else if (values.info.trim().length < 10) {
        errors.info = 'Information must be at least 10 characters';
      }

      return errors;
    },

    onSubmit: (values) => {
      if (editIndex !== null && !formik.dirty) {
        setEditIndex(null);
        formik.resetForm();
        return;
      }


      const childData: Child = {
        name: values.name.trim(),
        age: values.age,
        gender: values.gender || 'Not specified',
        info: values.info.trim(),
      };

      if (editIndex === null) {
        const isDuplicate = userData.some(
          (child) =>
            child.name.toLowerCase() === childData.name.toLowerCase() 
        );

        if (isDuplicate) {
          toast.error('This child already exists');
          return;
        }

        syncChildren([...userData, childData]);
        toast.success('Child added successfully');
      }
      if (editIndex !== null) {
        const updatedChildren = userData.map((child, index) =>
          index === editIndex ? childData : child
        );
        syncChildren(updatedChildren);
        setEditIndex(null);
      } else {
        syncChildren([...userData, childData]);
      }

      formik.resetForm();
    },
  });

  function deleteChild(index: number) {
    const updatedChildren = userData.filter((_, idx) => idx !== index);
    syncChildren(updatedChildren);
    toast.success("User deleted");
    if (editIndex === index) {
      setEditIndex(null);
      formik.resetForm();
    }
  }

  function editChild(index: number) {
    const child = userData[index];

    formik.resetForm({
      values: {
        name: child.name,
        age: child.age,
        gender: child.gender,
        info: child.info,
      },
    });

    setEditIndex(index);
  }

  function cancelEdit() {
    setEditIndex(null);
    formik.resetForm({
      values: {
        name: '',
        age: '',
        gender: '',
        info: '',
      },
    });
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">SafeChildQR</p>
            <h2>Parent Dashboard</h2>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="dashboard-grid">
          <form onSubmit={formik.handleSubmit} className="child-form-card">
            <h3>{editIndex !== null ? 'Update Child Record' : 'Add Child Record'}</h3>

            <div className="child-data-input">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Child name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>
              {formik.touched.name && formik.errors.name && (
                <p className="error">{formik.errors.name}</p>
              )}

              <label>
                <span>Age</span>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>
              {formik.touched.age && formik.errors.age && (
                <p className="error">{formik.errors.age}</p>
              )}

              <label>
                <span>Gender</span>
                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              {formik.touched.gender && formik.errors.gender && (
                <p className="error">{formik.errors.gender}</p>
              )}

              <label>
                <span>Information</span>
                <textarea
                  name="info"
                  placeholder="Any medical or safety details"
                  value={formik.values.info}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>
              {formik.touched.info && formik.errors.info && (
                <p className="error">{formik.errors.info}</p>
              )}

              <div className="form-actions">
                <button type="submit" className="primary-btn" disabled={editIndex !== null && !formik.dirty}>
                  {editIndex !== null ? 'Update Child' : 'Add Child'}
                </button>

                {editIndex !== null && (
                  <button type="button" className="secondary-btn" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="child-container">
            <h3>Children List</h3>

            {userData.length > 0 ? (
              userData.map((el, idx) => (
                <div key={`${el.name}-${idx}`} className="child-card">
                  <div className="child-card-head">
                    <h4>{el.name}</h4>
                    <span>{el.age} yrs</span>
                  </div>

                  <p>
                    <strong>Gender:</strong> {el.gender}
                  </p>
                  <p>
                    <strong>Info:</strong> {el.info}
                  </p>

                  <div className="child-actions">
                    <button type="button" className="secondary-btn" onClick={() => editChild(idx)}>
                      Edit
                    </button>
                    <button type="button" className="danger-btn" onClick={() => deleteChild(idx)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No children added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;