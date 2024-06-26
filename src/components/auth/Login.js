import React, { useState } from 'react';
//import PropTypes from 'prop-types';
import './Login.css';
//import Context from '../App/App.js'
import { useDispatch } from "react-redux";
import { setUser } from '../../redux/user';
import {login} from '../services/list'
  
export default function Login({setToken, setAuth}) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch()
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  //const dispatch = useDispatch()
/*
  const handleSubmit_old = async e => {
    e.preventDefault();
    let url =  `${rootpath}/sessions`
    const credentials =  {
      username: username,
      password
    }
    const response = await axios.post(url,credentials )
    setToken(response.data.token);
    setAuth({auth: response.data.token})
  }
*/
  const handleSubmit = async e => {
    e.preventDefault();
    login({username: username, password} )
    .then (response => {
      setToken(response.token);
      setAuth({auth: response.token})
      dispatch(setUser(response.user))
    })
    .catch(error => {
      console.log("Login error",error)
      alert(error.response.data.error)
      //alert(error.data)
    })
  }

  return(
    <div className="login-wrapper">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input 
          type={
            showPassword ? "text" : "password"
          }
          onChange={e => setPassword(e.target.value)} />
        </label>
        <label htmlFor="check">&nbsp;Show Password&nbsp;</label>
                <input
                    id="check"
                    type="checkbox"
                    value={showPassword}
                    onChange={() =>
                        setShowPassword((prev) => !prev)
                    }
                />
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

//Login.propTypes = {
 // setToken: PropTypes.func.isRequired
//};