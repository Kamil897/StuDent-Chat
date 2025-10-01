import React from 'react';
import styled from 'styled-components';

const Checkbox = () => {
  return (
    <StyledWrapper>
      <label className="container">
        <input type="checkbox" defaultChecked="checked" />
        <svg className="save-regular" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z" /></svg>
        <svg className="save-solid" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" /></svg>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /*------ Settings ------*/
  .container {
    --color: #a5a5b0;
    --size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
    font-size: var(--size);
    user-select: none;
    fill: var(--color);
    height: 48px;
    width: 76px;
    border-radius: 16px;
    background-color: #1d1d1d;
    overflow: hidden;
    box-shadow:
      inset -2px -2px 5px rgba(255, 255, 255, 0.2),
      inset 2px 2px 5px rgba(0, 0, 0, 0.1),
      4px 4px 10px rgba(0, 0, 0, 0.4),
      -2px -2px 8px rgba(255, 255, 255, 0.1);
  }

  .container .save-regular {
    position: absolute;
    animation: keyframes-fill .5s;
    transform-origin: top;
  }

  .container .save-solid {
    position: absolute;
    animation: keyframes-fill .5s;
    display: none;
    transform-origin: top;
  }

  /* ------ On check event ------ */
  .container input:checked ~ .save-regular {
    display: none;
  }

  .container input:checked ~ .save-solid {
    display: block;
  }

  /* ------ Hide the default checkbox ------ */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  /* ------ Animation ------ */
  @keyframes keyframes-fill {
    0% {
      transform: scale(0);
      opacity: 0;
    }

    50% {
      transform: scaleY(1.2);
    }
  }`;

export default Checkbox;
