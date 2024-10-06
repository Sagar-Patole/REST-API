import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

const SinglePost = (props) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');

  const {postId} = useParams();

  useEffect(() => {
    fetch(`http://localhost:8080/server/feed/post/${postId}`, {
      headers: {
        'Authorization': `Bearer ${props.token}`
      }
    }).then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch status');
      }
      return res.json();
    }).then(resData => {
      const imageUrl = resData.post.imageUrl.replace(/\\/g, '/');
      setTitle(resData.post.title);
      setAuthor(resData.post.creator.name);
      setDate(new Date(resData.post.createdAt).toLocaleDateString('en-US'));
      setImage(`http://localhost:8080/${imageUrl}`);
      setContent(resData.post.content);
    }).catch(err => {
      console.log(err);
    });
  }, []);

  return (
    <section className="single-post">
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className="single-post__image">
        <Image contain imageUrl={image} />
      </div>
      <p>{content}</p>
    </section>
  );
}

export default SinglePost;
