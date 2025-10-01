import React, { useState } from 'react';
import styled from 'styled-components';

const LikeButton = ({ initialLiked = false, initialCount = 68 }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggleLike = () => {
    setLiked(prev => !prev);
    setCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <StyledWrapper liked={liked}>
      <div className="like-button" onClick={toggleLike}>
        <div className="like">
          <svg className="like-icon" fillRule="nonzero" viewBox="0 0 24 24">
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          <span className="like-text">Likes</span>
        </div>
        <span className="like-count">{count}</span>
      </div>
    </StyledWrapper>
    
  );
};

const StyledWrapper = styled.div`
  .like-button {
    position: relative;
    cursor: pointer;
    display: flex;
    height: 48px;
    width: 136px;
    border-radius: 16px;
    border: none;
    background-color: #1d1d1d;
    overflow: hidden;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    box-shadow:
      inset -2px -2px 5px rgba(255, 255, 255, 0.2),
      inset 2px 2px 5px rgba(0, 0, 0, 0.1),
      4px 4px 10px rgba(0, 0, 0, 0.4),
      -2px -2px 8px rgba(255, 255, 255, 0.1);
  }

  .like {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .like-icon {
    height: 28px;
    width: 28px;
    fill: ${props => (props.liked ? '#fc4e4e' : '#505050')};
    transition: transform 0.2s ease-out, fill 0.2s ease-out;
    transform: ${props => (props.liked ? 'scale(1.2)' : 'scale(1)')};
  }

  .like-text {
    color: #fcfcfc;
    font-size: 16px;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  .like-count {
    color: ${props => (props.liked ? '#fcfcfc' : '#717070')};
    font-size: 16px;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    transition: all 0.3s ease-out;
  }
`;


export default LikeButton;
