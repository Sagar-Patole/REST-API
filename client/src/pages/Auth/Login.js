import React, { useState } from 'react';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import Auth from './Auth';

const Login = (props) => {
  const [loginForm, setLoginForm] = useState({
    email: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, email]
    },
    password: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, length({ min: 5 })]
    }
  });
  const [isLoginFormValid, setIsLoginFormValid] = useState(false);

  const inputChangeHandler = (input, value) => {
    setLoginForm(prevLoginForm => {
      let isValid = true
      for (const validator of prevLoginForm[input].validators) {
        isValid = isValid && validator(value);
      }
      return  {
        ...prevLoginForm,
        [input]: {
          ...prevLoginForm[input],
          valid: isValid,
          value: value
        }
      }
    });
    setIsLoginFormValid(prevIsLoginFormValid => {
      let formIsValid = true;
      for (const inputName in loginForm) {
        formIsValid = formIsValid && loginForm[inputName].isValid;
      }
      return formIsValid
    });
  };

  const inputBlurHandler = input => {
    setLoginForm(prevLoginForm => {
      return {
        ...prevLoginForm,
        [input]: {
          ...prevLoginForm[input],
          touched: true
        }
      }
    });
  };

  return (
    <Auth>
      <form
        onSubmit={e =>
          props.onLogin(e, {
            email: loginForm.email.value,
            password: loginForm.password.value
          })
        }
      >
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('email')}
          value={loginForm['email'].value}
          valid={loginForm['email'].valid}
          touched={loginForm['email'].touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('password')}
          value={loginForm['password'].value}
          valid={loginForm['password'].valid}
          touched={loginForm['password'].touched}
        />
        <Button design="raised" type="submit" loading={props.loading}>
          Login
        </Button>
      </form>
    </Auth>
  );
}

export default Login;
