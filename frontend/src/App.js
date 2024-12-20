import React, { useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [empId, setEmpId] = useState('');
  const [favTools, setFavTools] = useState([]);
  const [password, setPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [page, setPage] = useState('home');

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Handle checkbox change for tools
  const handleToolChange = (event) => {
    const { value, checked } = event.target;
    setFavTools((prevTools) =>
      checked ? [...prevTools, value] : prevTools.filter((tool) => tool !== value)
    );
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    const employee = { name, designation, empId, favTools, password };

    try {
      const response = await fetch(`${backendUrl}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
      });
      const data = await response.json();
      setResponseMessage(data.message);
      setName('');
      setDesignation('');
      setEmpId('');
      setFavTools([]);
      setPassword('');
    } catch (error) {
      setResponseMessage('Error connecting to the backend');
      console.error(error);  // Log the error for debugging
    }
  };

  const handleLogin = async (event) => {
  event.preventDefault();
  const loginData = { empId: loginName, password };

  try {
    const response = await fetch(`${backendUrl}/api/employees/login`, {
      method: 'POST',  // Use POST for login
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      setPage('welcome');
      // Set employee details after successful login
      setEmpId(data.empId);
      setName(data.name);
      setDesignation(data.designation);
      setFavTools(data.favTools);
      setPassword('');  // Reset the password field
    } else {
      setResponseMessage(data.message);  // Show error message if any
    }

    setLoginName('');
  } catch (error) {
    setResponseMessage('Error connecting to the backend');
    console.error(error);  // Log the error for debugging
  }
};

  const renderHomePage = () => (
    <div className="container">
      <h1 className="header">Employee Portal</h1>
      <button className="button" onClick={() => setPage('createAccount')}>Create Employee Account</button>
      <button className="button" onClick={() => setPage('login')}>Employee Login</button>
    </div>
  );

  const renderCreateAccountPage = () => (
    <div className="container">
      <h2>Create Employee Account</h2>
      <form onSubmit={handleCreateAccount} className="form">
        {/* Employee ID */}
        <label>
          Employee ID:
          <input
            className="input"
            type="text"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            placeholder="Enter Employee ID"
            required
          />
        </label>

        {/* Name */}
        <label>
          Name:
          <input
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Full Name"
            required
          />
        </label>

        {/* Designation */}
        <label>
          Designation:
          <input
            className="input"
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Enter Designation"
            required
          />
        </label>

        {/* DevOps Tools Selection */}
        <div className="checkbox-group">
          <label>Choose your favorite DevOps tools:</label>
          {[
            "Git",
            "Linux",
            "Shell Scripting",
            "Maven",
            "Jenkins",
            "Docker",
            "Kubernetes",
            "AWS",
            "Terraform",
          ].map((tool) => (
            <label key={tool} className="checkbox-item">
              <input type="checkbox" value={tool} onChange={handleToolChange} />
              {tool}
            </label>
          ))}
        </div>

        {/* Password */}
        <label>
          Password:
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
          />
        </label>

        {/* Profile Picture Upload */}
        <label>
          Upload Profile Picture:
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
          />
        </label>

        {/* Submit Button */}
        <button className="button" type="submit">
          Create Account
        </button>
      </form>

      {/* Back Button */}
      <button className="linkButton" onClick={() => setPage("home")}>
        Back
      </button>

      {/* Response Message */}
      {responseMessage && <p className="responseMessage">{responseMessage}</p>}
    </div>
  );


  const renderLoginPage = () => (
    <div className="container">
      <h2>Employee Login</h2>
      <form onSubmit={handleLogin} className="form">
        <label>
          Employee ID:
          <input
            className="input"
            type="text"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <div>
        <button className="button" type="submit">Login</button>
        </div>
      </form>
      <button className="linkButton" onClick={() => setPage('home')}>Back</button>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );

  const renderWelcomePage = () => (
    <div className="welcomeContainer">
      <h1 className="welcomeHeader">🎉 Welcome {name}! 🎉</h1>
      <p>Your Employee Details:</p>
      <table className="detailsTable">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Favorite Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{empId}</td>
            <td>{name}</td>
            <td>{designation}</td>
            <td>{favTools.join(', ') || 'None'}</td>
          </tr>
        </tbody>
      </table>
      <button className="linkButton" onClick={() => setPage('home')}>Back to Home</button>
    </div>
  );

  return (
    <div>
      {page === 'home' && renderHomePage()}
      {page === 'createAccount' && renderCreateAccountPage()}
      {page === 'login' && renderLoginPage()}
      {page === 'welcome' && renderWelcomePage()}
    </div>
  );
}

export default App;
