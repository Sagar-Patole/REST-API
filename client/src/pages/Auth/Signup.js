import React, { Component, useState } from 'react';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import Auth from './Auth';

const Signup = (props) => {
  const [signupForm, setSignupForm] = useState({
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
    },
    name: {
      value: '',
      valid: false,
      touched: false,
      validators: [required]
    }
  });
  const [isSignupFormValid, setIsSignupFormValid] = useState(false);

  const inputChangeHandler = (input, value) => {
    setSignupForm(prevSignupForm => {
      let isValid = true;
      for (const validator of prevSignupForm[input].validators) {
        isValid = isValid && validator(value);
      }
      return {
        ...prevSignupForm,
        [input]: {
          ...prevSignupForm[input],
          valid: isValid,
          value: value
        }
      }
    });
    setIsSignupFormValid(prevIsSignupFormValid => {
      let formIsValid = true;
      for (const inputName in signupForm) {
        formIsValid = formIsValid && signupForm[inputName].valid;
      }
      return formIsValid;
    });
  };

  const inputBlurHandler = input => {
    setSignupForm(prevSignupForm => {
      return {
        ...prevSignupForm,
        [input]: {
          ...prevSignupForm[input],
          touched: true
        }
      }
    });
  };

  return (
    <Auth>
      <form onSubmit={e => props.onSignup(e, {signupForm: signupForm, isSignupFormValid: isSignupFormValid})}>
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('email')}
          value={signupForm['email'].value}
          valid={signupForm['email'].valid}
          touched={signupForm['email'].touched}
        />
        <Input
          id="name"
          label="Your Name"
          type="text"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('name')}
          value={signupForm['name'].value}
          valid={signupForm['name'].valid}
          touched={signupForm['name'].touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('password')}
          value={signupForm['password'].value}
          valid={signupForm['password'].valid}
          touched={signupForm['password'].touched}
        />
        <Button design="raised" type="submit" loading={props.loading}>
          Signup
        </Button>
      </form>
    </Auth>
  );
}

export default Signup;
